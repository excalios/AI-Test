import React from 'react';
import { RefreshCw, MessageSquare, Loader2 } from 'lucide-react';
import type { LogEntry } from '../../types';

interface LogViewerProps {
  logs: LogEntry[];
  onClear: () => void;
}

export const LogViewer: React.FC<LogViewerProps> = ({ logs, onClear }) => {
  return (
      <div className="flex-1 flex flex-col bg-white h-full">
        <div className="p-2 border-b border-gray-200 flex justify-between items-center bg-white">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Live Log</span>
          {logs.length > 0 && <button onClick={onClear} className="text-xs text-gray-400 hover:text-gray-700 flex gap-1 items-center"><RefreshCw className="w-3 h-3"/> Clear</button>}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-200">
              <MessageSquare className="w-12 h-12 mb-2"/>
              <p>Ready to start</p>
            </div>
          ) : logs.map((log, i) => (
            <div key={i} className={`flex w-full ${log.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] flex flex-col ${log.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className="text-[10px] text-gray-300 mb-1 uppercase font-bold">{log.role}</div>
                <div className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap shadow-sm border ${
                  log.role === 'user' ? 'bg-blue-600 text-white border-blue-600 rounded-br-sm' : 
                  log.error ? 'bg-red-50 text-red-800 border-red-100 rounded-bl-sm' : 'bg-gray-100 text-gray-800 border-gray-100 rounded-bl-sm'
                }`}>
                  {log.loading && !log.content ? <div className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin"/> Thinking...</div> : log.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
  );
};
