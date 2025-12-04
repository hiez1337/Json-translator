import React, { useRef, useEffect, useState, useMemo } from 'react';
import { TranslationRow, RowStatus } from '../types';
import { Copy } from 'lucide-react';

interface TranslationGridProps {
  rows: TranslationRow[];
  onUpdateRow: (id: string, newText: string) => void;
  onStatusChange: (id: string, status: RowStatus) => void;
  fontSize: number;
  textWrap: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
}

const OVERSCAN = 5; // Buffer rows

const StatusBadge: React.FC<{ status: RowStatus }> = ({ status }) => {
  switch (status) {
    case RowStatus.NEW:
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-900/40 text-red-200 border border-red-800/50">NEW</span>;
    case RowStatus.DRAFT:
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-900/40 text-yellow-200 border border-yellow-800/50">DRAFT</span>;
    case RowStatus.TRANSLATED:
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-900/40 text-blue-200 border border-blue-800/50">AI</span>;
    case RowStatus.APPROVED:
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-900/40 text-green-200 border border-green-800/50">DONE</span>;
    default:
      return null;
  }
};

// Memoized Row Component
const VirtualRow = React.memo(({ 
  row, 
  index, 
  style, 
  isEditing, 
  startEditing, 
  saveEdit, 
  editValue, 
  setEditValue, 
  onStatusChange,
  handleKeyDown,
  fontSize,
  textWrap,
  isSelected,
  onToggleSelect
}: any) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
    }
  }, [isEditing]);

  const isDuplicate = row.isDuplicate;

  return (
    <div 
      style={style} 
      className={`absolute left-0 right-0 flex border-b border-gray-800 hover:bg-gray-800/50 transition-colors group ${isEditing ? 'bg-gray-800 z-10' : ''} ${isSelected ? 'bg-blue-900/20' : ''} ${isDuplicate ? 'bg-gray-900/50' : ''}`}
    >
      {/* Checkbox */}
      <div 
        className="w-10 flex-shrink-0 flex items-center justify-center border-r border-gray-800/50 cursor-pointer"
        onClick={() => onToggleSelect(row.id)}
      >
        <input 
          type="checkbox" 
          checked={isSelected} 
          onChange={() => {}} // handled by div click
          className="cursor-pointer w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-600 ring-offset-gray-800"
        />
      </div>

      {/* Index */}
      <div className={`w-12 flex-shrink-0 flex items-center justify-center text-xs font-mono border-r border-gray-800/50 ${isDuplicate ? 'text-gray-700' : 'text-gray-500'}`}>
        {isDuplicate ? <Copy size={12} className="opacity-50" /> : index + 1}
      </div>

      {/* Context */}
      <div className="w-[10%] flex-shrink-0 flex items-center px-3 text-xs text-gray-500 font-mono overflow-hidden whitespace-nowrap text-ellipsis border-r border-gray-800/50" title={row.context}>
        {row.context || 'TXT'}
      </div>

      {/* Original */}
      <div 
        className={`w-[38%] flex-shrink-0 flex items-center px-3 font-mono-editor border-r border-gray-800/50 overflow-hidden ${isDuplicate ? 'text-gray-500' : 'text-gray-300'}`}
        style={{ fontSize: `${fontSize}px` }}
      >
        <div 
            className={`w-full ${textWrap ? 'whitespace-pre-wrap break-words line-clamp-3' : 'truncate'}`} 
            title={row.original}
        >
          {row.original}
        </div>
      </div>

      {/* Translation (Editable) */}
      <div 
        className="w-[38%] flex-shrink-0 flex items-center px-3 text-gray-300 relative cursor-pointer"
        style={{ fontSize: `${fontSize}px` }}
        onClick={() => !isEditing && startEditing(row)}
      >
        {isEditing ? (
          <div className="w-full absolute top-0 left-0 p-1 z-20 h-auto min-h-full shadow-xl">
             <textarea
                ref={inputRef}
                value={editValue}
                onChange={(e) => {
                  setEditValue(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onBlur={saveEdit}
                onKeyDown={handleKeyDown}
                className="w-full bg-gray-700 text-white p-2 rounded border border-blue-500 focus:outline-none font-mono-editor resize-none overflow-hidden shadow-lg"
                style={{ fontSize: `${fontSize}px`, minHeight: style.height ? parseInt(style.height) - 8 : '44px' }}
              />
              <div className="text-[10px] text-gray-400 absolute right-2 bottom-[-18px] bg-gray-900 px-1 rounded z-30">Ctrl+Enter to save</div>
          </div>
        ) : (
          <div 
            className={`w-full font-mono-editor ${!row.translation ? 'text-gray-600 italic' : ''} ${textWrap ? 'whitespace-pre-wrap break-words line-clamp-3' : 'truncate'} ${isDuplicate && !row.translation ? 'opacity-50' : ''}`} 
            title={row.translation}
          >
            {row.translation || 'Click to translate...'}
          </div>
        )}
      </div>

      {/* Status */}
      <div className="w-[calc(14%-5.5rem)] flex-grow flex items-center justify-center">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange(row.id, row.status === RowStatus.APPROVED ? RowStatus.DRAFT : RowStatus.APPROVED);
          }}
          className="hover:opacity-80 transition active:scale-95"
        >
          <StatusBadge status={row.status} />
        </button>
      </div>
    </div>
  );
});

export const TranslationGrid: React.FC<TranslationGridProps> = ({ 
    rows, 
    onUpdateRow, 
    onStatusChange,
    fontSize,
    textWrap,
    selectedIds,
    onToggleSelect,
    onSelectAll
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const currentRowHeight = textWrap ? 90 : 52;
  const isAllSelected = rows.length > 0 && selectedIds.size === rows.length;

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      setContainerHeight(entries[0].contentRect.height);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const totalHeight = rows.length * currentRowHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / currentRowHeight) - OVERSCAN);
  const endIndex = Math.min(
    rows.length,
    Math.ceil((scrollTop + containerHeight) / currentRowHeight) + OVERSCAN
  );

  const visibleRows = useMemo(() => {
    const visible = [];
    for (let i = startIndex; i < endIndex; i++) {
      visible.push(rows[i]);
    }
    return visible;
  }, [rows, startIndex, endIndex, currentRowHeight]); 

  const startEditing = (row: TranslationRow) => {
    setEditingId(row.id);
    setEditValue(row.translation);
  };

  const saveEdit = () => {
    if (editingId) {
      onUpdateRow(editingId, editValue);
      setEditingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      saveEdit();
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-900 relative">
      {/* Header */}
      <div className="flex bg-gray-800 border-b border-gray-700 shadow-md z-10 text-gray-400 text-xs font-medium uppercase tracking-wider">
        <div className="w-10 p-3 flex items-center justify-center border-r border-gray-700">
          <input 
            type="checkbox" 
            checked={isAllSelected}
            onChange={onSelectAll}
            className="cursor-pointer w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-600 ring-offset-gray-800"
            title="Select All"
          />
        </div>
        <div className="w-12 p-3 text-center">#</div>
        <div className="w-[10%] p-3">Context</div>
        <div className="w-[38%] p-3">Original</div>
        <div className="w-[38%] p-3">Translation</div>
        <div className="flex-grow p-3 text-center">Status</div>
      </div>

      {/* Virtual Scroll Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto relative"
        onScroll={handleScroll}
      >
        {rows.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
             <div className="p-4 bg-gray-800 rounded-full">
                <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
             </div>
             <p>No data found.</p>
          </div>
        ) : (
          <div style={{ height: totalHeight, position: 'relative' }}>
            {visibleRows.map((row) => {
               const index = rows.indexOf(row);
               return (
                <VirtualRow
                  key={row.id}
                  row={row}
                  index={index}
                  style={{ top: index * currentRowHeight, height: currentRowHeight }}
                  isEditing={editingId === row.id}
                  startEditing={startEditing}
                  saveEdit={saveEdit}
                  editValue={editValue}
                  setEditValue={setEditValue}
                  onStatusChange={onStatusChange}
                  handleKeyDown={handleKeyDown}
                  fontSize={fontSize}
                  textWrap={textWrap}
                  isSelected={selectedIds.has(row.id)}
                  onToggleSelect={onToggleSelect}
                />
               );
            })}
          </div>
        )}
      </div>
    </div>
  );
};