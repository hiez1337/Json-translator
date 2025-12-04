import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Table } from 'lucide-react';
import { ImportMapping } from '../types';

interface ImportMapperProps {
  isOpen: boolean;
  onClose: () => void;
  sampleData: any;
  onConfirm: (mapping: ImportMapping) => void;
}

export const ImportMapper: React.FC<ImportMapperProps> = ({ isOpen, onClose, sampleData, onConfirm }) => {
  const [keys, setKeys] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ImportMapping>({
    idColumn: '',
    sourceColumn: '',
    targetColumn: ''
  });

  useEffect(() => {
    if (sampleData && typeof sampleData === 'object') {
      const extractedKeys = Object.keys(sampleData);
      setKeys(extractedKeys);
      
      // Smart auto-detection
      const idKey = extractedKeys.find(k => k.toLowerCase() === 'id' || k.toLowerCase() === 'key' || k.includes('ID')) || extractedKeys[0];
      const sourceKey = extractedKeys.find(k => k === 'desc' || k === 'ch' || k === 'original' || k === 'text') || extractedKeys[1];
      const targetKey = extractedKeys.find(k => k === 'descEN' || k === 'en' || k === 'translation') || sourceKey; // Default target to source if not found (overwrite mode)

      setMapping({
        idColumn: idKey || '',
        sourceColumn: sourceKey || '',
        targetColumn: targetKey || ''
      });
    }
  }, [sampleData, isOpen]);

  if (!isOpen || !sampleData) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-lg flex flex-col">
        
        <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-850 rounded-t-lg">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Table size={18} className="text-blue-400" />
            Настройка колонок (JSON Import)
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-sm text-gray-400">
            Мы обнаружили сложную структуру JSON. Пожалуйста, укажите, какие поля использовать.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">ID / Context Column (Уникальный ключ)</label>
              <select 
                value={mapping.idColumn}
                onChange={(e) => setMapping(p => ({ ...p, idColumn: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 text-white p-2 rounded focus:border-blue-500 outline-none"
              >
                {keys.map(k => <option key={k} value={k}>{k} (Sample: {String(sampleData[k]).slice(0, 20)})</option>)}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-blue-300 mb-1">Source Text (Оригинал)</label>
                <select 
                  value={mapping.sourceColumn}
                  onChange={(e) => setMapping(p => ({ ...p, sourceColumn: e.target.value }))}
                  className="w-full bg-gray-800 border border-blue-900 text-white p-2 rounded focus:border-blue-500 outline-none"
                >
                  {keys.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>

              <div className="pt-5 text-gray-500">
                <ArrowRight size={20} />
              </div>

              <div className="flex-1">
                <label className="block text-xs font-medium text-green-300 mb-1">Target Text (Перевод)</label>
                <select 
                  value={mapping.targetColumn}
                  onChange={(e) => setMapping(p => ({ ...p, targetColumn: e.target.value }))}
                  className="w-full bg-gray-800 border border-green-900 text-white p-2 rounded focus:border-green-500 outline-none"
                >
                  {keys.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
            </div>
            
            <div className="p-3 bg-gray-800/50 rounded border border-gray-700 text-xs text-gray-400">
              <strong>Preview:</strong> Translating field <span className="text-blue-300 font-mono">"{mapping.sourceColumn}"</span> to field <span className="text-green-300 font-mono">"{mapping.targetColumn}"</span>.
              <br/>All other fields (like <i>group, trigger...</i>) will be preserved.
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-800 bg-gray-850 flex justify-end gap-2 rounded-b-lg">
          <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white text-sm">Cancel</button>
          <button 
            onClick={() => onConfirm(mapping)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded shadow-lg transition"
          >
            Import & Map
          </button>
        </div>

      </div>
    </div>
  );
};