import React from 'react';
import { TranslationConfig, DEFAULT_CONFIG } from '../types';
import { X, RotateCcw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TranslationConfig;
  onSave: (config: TranslationConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onSave }) => {
  if (!isOpen) return null;

  const handleChange = (key: keyof TranslationConfig, value: any) => {
    onSave({ ...config, [key]: value });
  };

  const handleReset = () => {
    onSave(DEFAULT_CONFIG);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-850 rounded-t-lg">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Настройки перевода (Engine Config)
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* General Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Target Language</label>
              <input 
                type="text" 
                value={config.targetLanguage}
                onChange={(e) => handleChange('targetLanguage', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white p-2 rounded focus:border-blue-500 outline-none"
                placeholder="e.g. Russian, Japanese"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Batch Size (Rows per Request)</label>
              <input 
                type="number" 
                min={1}
                max={50}
                value={config.batchSize}
                onChange={(e) => handleChange('batchSize', parseInt(e.target.value) || 1)}
                className="w-full bg-gray-800 border border-gray-700 text-white p-2 rounded focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Temperature (Creativity)</label>
              <input 
                type="number" 
                min={0}
                max={2}
                step={0.1}
                value={config.temperature}
                onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 text-white p-2 rounded focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Batch Delay (ms)</label>
              <input 
                type="number" 
                min={0}
                step={100}
                value={config.delay}
                onChange={(e) => handleChange('delay', parseInt(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 text-white p-2 rounded focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* System Prompt */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-xs font-medium text-gray-400">System Message Template</label>
              <span className="text-[10px] text-gray-500">Available: {'${TARGET_LANG}'}</span>
            </div>
            <textarea 
              value={config.systemPrompt}
              onChange={(e) => handleChange('systemPrompt', e.target.value)}
              className="w-full h-40 bg-gray-950 border border-gray-700 text-gray-300 p-3 rounded font-mono text-sm focus:border-blue-500 outline-none leading-relaxed"
              placeholder="Enter system prompt..."
            />
            <p className="text-[10px] text-gray-500 mt-2">
              Tip: Use strict instructions to preserve game specific tags like \V[1] or &lt;br&gt;.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-850 flex justify-between items-center rounded-b-lg">
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition px-3 py-2 rounded hover:bg-gray-700"
          >
            <RotateCcw size={14} /> Reset Defaults
          </button>
          <div className="flex gap-2">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
