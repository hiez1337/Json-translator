import React from 'react';
import { Download, Upload, Play, ZoomIn, ZoomOut, WrapText, Search, Bug } from 'lucide-react';

interface ProjectToolbarProps {
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  onAutoTranslate: () => void;
  isTranslating: boolean;
  progress: number;
  fontSize: number;
  setFontSize: (size: number) => void;
  textWrap: boolean;
  setTextWrap: (wrap: boolean) => void;
  selectedCount: number;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  toggleDebug: () => void;
  isDebugOpen: boolean;
}

export const ProjectToolbar: React.FC<ProjectToolbarProps> = ({
  onImport,
  onExport,
  onAutoTranslate,
  isTranslating,
  progress,
  fontSize,
  setFontSize,
  textWrap,
  setTextWrap,
  selectedCount,
  searchQuery,
  setSearchQuery,
  toggleDebug,
  isDebugOpen
}) => {
  return (
    <div className="h-16 bg-gray-850 border-b border-gray-700 flex items-center px-4 justify-between select-none">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mr-2">
          Translator++
        </h1>
        
        <div className="h-8 w-px bg-gray-700 mx-2"></div>

        <label className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded cursor-pointer transition text-sm text-gray-300">
          <Upload size={16} className="text-blue-400" />
          <span className="hidden lg:inline">Импорт</span>
          <input type="file" accept=".json" onChange={onImport} className="hidden" />
        </label>

        <button 
          onClick={onExport}
          className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded cursor-pointer transition text-sm text-gray-300"
        >
          <Download size={16} className="text-green-400" />
          <span className="hidden lg:inline">Экспорт</span>
        </button>

        <div className="h-8 w-px bg-gray-700 mx-2"></div>

        {/* Search */}
        <div className="relative group">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition" />
          <input 
            type="text" 
            placeholder="Поиск..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-full pl-9 pr-4 py-1.5 text-sm w-40 focus:w-64 transition-all outline-none focus:border-blue-500 text-gray-200"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        
        {/* View Controls */}
        <div className="flex items-center bg-gray-900 rounded-lg p-1 border border-gray-700">
           <button 
             onClick={() => setFontSize(Math.max(10, fontSize - 1))}
             className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition"
             title="Уменьшить текст"
           >
             <ZoomOut size={16} />
           </button>
           <span className="text-xs font-mono w-8 text-center text-gray-300">{fontSize}</span>
           <button 
             onClick={() => setFontSize(Math.min(24, fontSize + 1))}
             className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition"
             title="Увеличить текст"
           >
             <ZoomIn size={16} />
           </button>
           
           <div className="w-px h-4 bg-gray-700 mx-2"></div>

           <button 
             onClick={() => setTextWrap(!textWrap)}
             className={`p-1.5 rounded transition flex items-center gap-1 ${textWrap ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
             title="Перенос строк"
           >
             <WrapText size={16} />
           </button>
        </div>

        <button 
          onClick={toggleDebug}
          className={`p-2 rounded-lg transition ${isDebugOpen ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          title="Debug Console"
        >
          <Bug size={20} />
        </button>

        {isTranslating ? (
           <div className="flex items-center space-x-3 bg-blue-900/30 px-4 py-2 rounded border border-blue-800">
             <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
             <span className="text-sm text-blue-200 whitespace-nowrap">{Math.round(progress)}%</span>
           </div>
        ) : (
          <button 
            onClick={onAutoTranslate}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded shadow-lg transition text-sm font-medium"
          >
            <Play size={16} fill="currentColor" />
            <span>
              {selectedCount > 0 
                ? `Перевод (${selectedCount})` 
                : 'AI Перевод'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};