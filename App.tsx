import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ProjectToolbar } from './components/ProjectToolbar';
import { TranslationGrid } from './components/TranslationGrid';
import { SettingsModal } from './components/SettingsModal';
import { ImportMapper } from './components/ImportMapper';
import { DebugPanel } from './components/DebugPanel';
import { TranslationRow, RowStatus, TranslationConfig, DEFAULT_CONFIG, ImportMapping, LogEntry } from './types';
import { translateBatch } from './services/geminiService';
import { Bot, FileText, Settings, AlertTriangle, StopCircle, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [rows, setRows] = useState<TranslationRow[]>([]);
  const [config, setConfig] = useState<TranslationConfig>(DEFAULT_CONFIG);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // View Options
  const [fontSize, setFontSize] = useState(14);
  const [textWrap, setTextWrap] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Import state
  const [pendingImportData, setPendingImportData] = useState<any[] | null>(null);
  const [isMapperOpen, setIsMapperOpen] = useState(false);
  const [activeMapping, setActiveMapping] = useState<ImportMapping | null>(null);

  const abortRef = useRef<boolean>(false);

  const addLog = (type: LogEntry['type'], message: string, details?: any) => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36),
      timestamp: new Date(),
      type,
      message,
      details
    }]);
  };

  // --- DEDUPLICATION LOGIC ---
  const deduplicateRows = (rows: TranslationRow[]): TranslationRow[] => {
    const seen = new Map<string, string>(); // original text -> first occurrence ID
    
    return rows.map(row => {
      const existingId = seen.get(row.original);
      if (existingId) {
        return { ...row, isDuplicate: true, parentId: existingId };
      } else {
        seen.set(row.original, row.id);
        return { ...row, isDuplicate: false };
      }
    });
  };

  // --- HANDLERS ---

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      setTimeout(() => {
        try {
          const json = JSON.parse(event.target?.result as string);
          addLog('info', `File loaded: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);

          if (Array.isArray(json) && json.length > 0 && typeof json[0] === 'object') {
            setPendingImportData(json);
            setIsMapperOpen(true);
          } else {
            const newRows: TranslationRow[] = Object.entries(json).map(([key, value], index) => ({
              id: `imp-${index}-${Date.now()}`,
              original: String(value),
              translation: '',
              context: key,
              status: RowStatus.NEW
            }));
            // Apply deduplication immediately
            setRows(deduplicateRows(newRows));
            setActiveMapping(null);
            setSelectedIds(new Set());
            addLog('info', `Imported ${newRows.length} rows (Key-Value format).`);
          }
        } catch (err) {
          addLog('error', 'Failed to parse JSON', err);
          alert("Error parsing JSON.");
        } finally {
          setIsLoading(false);
        }
      }, 50);
    };
    reader.readAsText(file);
    e.target.value = ''; 
  };

  const handleMapperConfirm = (mapping: ImportMapping) => {
    if (!pendingImportData) return;
    setIsLoading(true);

    setTimeout(() => {
        const rawRows: TranslationRow[] = pendingImportData.map((item, index) => {
            const existingTranslation = item[mapping.targetColumn];
            const hasTranslation = existingTranslation && existingTranslation !== item[mapping.sourceColumn];

            return {
                id: `row-${index}-${Date.now()}`,
                original: String(item[mapping.sourceColumn] || ''),
                translation: String(existingTranslation || ''),
                context: String(item[mapping.idColumn] || index),
                status: hasTranslation ? RowStatus.APPROVED : RowStatus.NEW,
                originalObject: item
            };
        });

        // Apply deduplication logic on import
        const processedRows = deduplicateRows(rawRows);

        setRows(processedRows);
        setActiveMapping(mapping);
        setPendingImportData(null);
        setIsMapperOpen(false);
        setIsLoading(false);
        setSelectedIds(new Set());
        addLog('info', `Imported ${rawRows.length} rows using mapping. found ${processedRows.filter(r => r.isDuplicate).length} duplicates.`);
    }, 50);
  };

  const handleUpdateRow = (id: string, newText: string) => {
    setRows(prev => {
      const targetRow = prev.find(r => r.id === id);
      if (!targetRow) return prev;

      // Update the targeted row AND all duplicates of this original text
      return prev.map(row => {
        if (row.original === targetRow.original) {
          return { 
            ...row, 
            translation: newText, 
            status: newText ? RowStatus.APPROVED : RowStatus.DRAFT
          };
        }
        return row;
      });
    });
  };

  const handleStatusChange = (id: string, status: RowStatus) => {
    setRows(prev => prev.map(row => row.id === id ? { ...row, status } : row));
  };

  const runAutoTranslate = async () => {
    if (isTranslating) return;
    abortRef.current = false;

    // 1. Identify which rows need processing based on selection or status
    let candidateRows: TranslationRow[] = [];
    if (selectedIds.size > 0) {
      candidateRows = rows.filter(r => selectedIds.has(r.id));
    } else {
      candidateRows = rows.filter(r => !r.translation || r.status === RowStatus.NEW || r.status === RowStatus.DRAFT);
    }

    if (candidateRows.length === 0) {
      alert("No rows to translate.");
      return;
    }

    // 2. Extract UNIQUE originals from the candidates
    const uniqueOriginals = Array.from(new Set(candidateRows.map(r => r.original)));
    
    addLog('info', `Starting batch translation`, {
      totalCandidates: candidateRows.length,
      uniqueStrings: uniqueOriginals.length
    });

    setIsTranslating(true);
    setProgress(0);

    const BATCH_SIZE = config.batchSize;
    const totalBatches = Math.ceil(uniqueOriginals.length / BATCH_SIZE);

    try {
      for (let i = 0; i < totalBatches; i++) {
        if (abortRef.current) break;

        const batchStart = i * BATCH_SIZE;
        const currentBatchTexts = uniqueOriginals.slice(batchStart, batchStart + BATCH_SIZE);

        try {
          // 3. Translate only unique texts
          const translatedTexts = await translateBatch(currentBatchTexts, config, addLog);

          // 4. Spread translations to ALL rows (duplicates included) matching the text
          setRows(prevRows => {
            const newRows = [...prevRows];
            
            // Create a lookup map for this batch
            const batchMap = new Map<string, string>();
            currentBatchTexts.forEach((original, idx) => {
              if (translatedTexts[idx]) {
                batchMap.set(original, translatedTexts[idx]);
              }
            });

            // Iterate over all rows (inefficient but safe) or just update known indices. 
            // Better: update all rows where original matches something in the batch
            return newRows.map(row => {
              if (batchMap.has(row.original)) {
                return {
                  ...row,
                  translation: batchMap.get(row.original)!,
                  status: RowStatus.TRANSLATED
                };
              }
              return row;
            });
          });

        } catch (err) {
          console.error(`Batch ${i} failed`, err);
        }

        setProgress(((i + 1) / totalBatches) * 100);
        if (i < totalBatches - 1) await new Promise(r => setTimeout(r, config.delay));
      }
    } finally {
      setIsTranslating(false);
      setProgress(0);
      abortRef.current = false;
      addLog('info', `Translation finished.`);
    }
  };

  // --- FILTERING ---
  const filteredRows = useMemo(() => {
    if (!searchQuery) return rows;
    const lowerQ = searchQuery.toLowerCase();
    return rows.filter(row => 
      row.original.toLowerCase().includes(lowerQ) ||
      row.translation.toLowerCase().includes(lowerQ) ||
      (row.context && row.context.toLowerCase().includes(lowerQ))
    );
  }, [rows, searchQuery]);

  const stats = {
    total: rows.length,
    translated: rows.filter(r => r.translation.length > 0).length,
    approved: rows.filter(r => r.status === RowStatus.APPROVED).length
  };

  // --- SELECTION HELPERS ---
  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredRows.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRows.map(r => r.id)));
    }
  };

  const handleExport = () => {
    let exportData: any;
    if (activeMapping && rows.some(r => r.originalObject)) {
      exportData = rows.map(row => {
        const obj = row.originalObject ? { ...row.originalObject } : {};
        obj[activeMapping.targetColumn] = row.translation || row.original;
        return obj;
      });
    } else {
      const exportObj: Record<string, string> = {};
      rows.forEach(row => {
        const key = row.context && row.context !== 'TXT' ? row.context : row.original;
        exportObj[key] = row.translation || row.original;
      });
      exportData = exportObj;
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `translated_${config.targetLanguage}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    addLog('info', 'Project exported.');
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 font-sans relative">
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center flex-col">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-200 font-medium">Processing...</p>
        </div>
      )}

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSave={setConfig}
      />

      <ImportMapper 
        isOpen={isMapperOpen}
        onClose={() => { setIsMapperOpen(false); setPendingImportData(null); }}
        sampleData={pendingImportData ? pendingImportData[0] : null}
        onConfirm={handleMapperConfirm}
      />

      <DebugPanel 
        isOpen={isDebugOpen}
        onClose={() => setIsDebugOpen(false)}
        logs={logs}
        onClear={() => setLogs([])}
      />

      {/* Sidebar */}
      <aside className="w-16 flex flex-col items-center py-4 bg-gray-900 border-r border-gray-800 space-y-6 z-20">
        <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 mb-4">
          <Bot size={24} />
        </div>
        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition" title="Project">
          <FileText size={20} />
        </button>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className={`p-2 rounded-lg transition ${isSettingsOpen ? 'bg-blue-900 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`} 
          title="Settings"
        >
          <Settings size={20} />
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <ProjectToolbar 
          onImport={handleImport}
          onExport={handleExport}
          onAutoTranslate={runAutoTranslate}
          isTranslating={isTranslating}
          progress={progress}
          fontSize={fontSize}
          setFontSize={setFontSize}
          textWrap={textWrap}
          setTextWrap={setTextWrap}
          selectedCount={selectedIds.size}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          toggleDebug={() => setIsDebugOpen(!isDebugOpen)}
          isDebugOpen={isDebugOpen}
        />

        {/* Filters / Sub-toolbar */}
        <div className="h-10 bg-gray-900 border-b border-gray-800 flex items-center px-4 text-xs space-x-4">
           <div className="flex items-center gap-2">
             <span className="text-gray-500 uppercase font-bold tracking-wider">Target:</span>
             <span className="text-blue-300 font-mono bg-blue-900/30 px-2 py-0.5 rounded border border-blue-800/50">
               {config.targetLanguage}
             </span>
           </div>
           
           <div className="flex-1"></div>
           
           {isTranslating && (
             <button 
               onClick={() => { abortRef.current = true; }}
               className="flex items-center gap-2 text-red-400 hover:text-red-300 px-3 py-1 mr-4 rounded bg-red-900/20 border border-red-900/50 transition"
             >
               <StopCircle size={14} /> Stop
             </button>
           )}

           <div className="flex space-x-3 text-gray-400">
             <span>Всего: <strong className="text-gray-200">{stats.total}</strong></span>
             <span>Дубли: <strong className="text-gray-500">{rows.filter(r => r.isDuplicate).length}</strong></span>
             <span>AI: <strong className="text-blue-400">{stats.translated - stats.approved}</strong></span>
           </div>
        </div>

        {/* Grid */}
        <TranslationGrid 
          rows={filteredRows}
          onUpdateRow={handleUpdateRow}
          onStatusChange={handleStatusChange}
          fontSize={fontSize}
          textWrap={textWrap}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
        />
      </div>
    </div>
  );
};

export default App;