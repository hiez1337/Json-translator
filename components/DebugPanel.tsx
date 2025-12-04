import React, { useEffect, useRef } from 'react';
import { X, Terminal, Copy, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { LogEntry } from '../types';

interface DebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
  logs: LogEntry[];
  onClear: () => void;
}

const LogItem: React.FC<{ entry: LogEntry }> = ({ entry }) => {
  const [expanded, setExpanded] = React.useState(false);

  const getColor = (type: string) => {
    switch (type) {
      case 'request': return 'text-blue-400';
      case 'response': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="border-b border-gray-800 font-mono text-xs">
      <div 
        className={`flex items-center p-2 hover:bg-gray-800 cursor-pointer ${getColor(entry.type)}`}
        onClick={() => setExpanded(!expanded)}
      >
        <span className="w-20 text-gray-600 shrink-0">{entry.timestamp.toLocaleTimeString()}</span>
        <span className="w-20 font-bold uppercase shrink-0">{entry.type}</span>
        <span className="flex-1 truncate">{entry.message}</span>
        {entry.details && (
          expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
        )}
      </div>
      {expanded && entry.details && (
        <div className="p-2 bg-gray-900 overflow-x-auto">
          <pre className="text-gray-400 whitespace-pre-wrap">
            {typeof entry.details === 'string' ? entry.details : JSON.stringify(entry.details, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export const DebugPanel: React.FC<DebugPanelProps> = ({ isOpen, onClose, logs, onClear }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-64 bg-gray-950 border-t border-gray-700 shadow-2xl z-40 flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-200">
          <Terminal size={16} />
          <span>Debug Console</span>
          <span className="bg-gray-800 text-gray-400 px-2 rounded-full text-xs">{logs.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onClear} className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-red-400" title="Clear Logs">
            <Trash2 size={14} />
          </button>
          <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-gray-600 italic">No logs generated yet...</div>
        ) : (
          logs.map(log => <LogItem key={log.id} entry={log} />)
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
};