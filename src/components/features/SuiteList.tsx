import React from 'react';
import { Terminal, FilePlus, Upload, Download, Plus, Settings, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTestRunner } from '../../context/TestRunnerContext';

export const SuiteList: React.FC = () => {
  const { 
    suites, 
    setSuites, 
    executionLogs,
    setExecutionLogs, 
    setSelectedSuiteId, 
    setSelectedCaseId, 
    selectedSuiteId, 
    setSuiteStatus,
    config,
    setConfig
  } = useTestRunner();

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear ALL test suites and logs? This cannot be undone.")) {
      setSuites([]);
      setExecutionLogs({});
      setSelectedSuiteId(null);
      setSelectedCaseId(null);
      setSuiteStatus({});
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const result = ev.target?.result as string;
        const data = JSON.parse(result);
        if (data.config?.url) setConfig({ ...data.config }); // Ensure config structure is preserved
        if (data.suites) setSuites(data.suites);
        if (data.logs) setExecutionLogs(data.logs);
        alert('Import successful!');
      } catch (err) { 
        alert("Invalid JSON file format"); 
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExport = () => {
    const exportData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      config: config,
      suites: suites,
      logs: executionLogs
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `agent_tests_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const addSuite = () => {
    const id = crypto.randomUUID();
    setSuites([...suites, { id, title: 'New Suite', cases: [] }]);
    setSelectedSuiteId(id); setSelectedCaseId(null);
  };

  const updateHeader = (index: number, key: string, value: string) => {
    const newHeaders = [...(config.headers || [])];
    newHeaders[index] = { key, value };
    setConfig({ ...config, headers: newHeaders });
  };

  const addHeader = () => {
    setConfig({ ...config, headers: [...(config.headers || []), { key: '', value: '' }] });
  };

  const removeHeader = (index: number) => {
    const newHeaders = [...(config.headers || [])];
    newHeaders.splice(index, 1);
    setConfig({ ...config, headers: newHeaders });
  };

  return (
     <div className="flex-shrink-0 flex flex-col h-full w-full">
        {/* Header */}
        <div className="p-3 border-b border-gray-200 bg-white z-10 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-gray-800">
             <Terminal className="w-4 h-4 text-blue-600"/> AgentRunner
          </div>
          <div className="flex items-center gap-1">
             <Button variant="ghost" size="icon" onClick={handleClearAll} title="New / Clear All">
               <FilePlus className="w-4 h-4 text-gray-500"/>
             </Button>
             <label className="cursor-pointer inline-flex">
               <Button variant="ghost" size="icon" as="div" title="Import JSON" onClick={() => document.getElementById('file-upload')?.click()}>
                 <Upload className="w-4 h-4 text-gray-500"/>
               </Button>
               <input id="file-upload" type="file" className="hidden" accept=".json" onChange={handleImport}/>
             </label>
             <Button variant="ghost" size="icon" onClick={handleExport} title="Export JSON">
               <Download className="w-4 h-4 text-gray-500"/>
             </Button>
          </div>
        </div>

        {/* Suites List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {suites.map(s => (
            <div key={s.id} onClick={() => {setSelectedSuiteId(s.id); setSelectedCaseId(null)}}
              className={`p-2 rounded-md cursor-pointer flex justify-between group ${selectedSuiteId === s.id ? 'bg-blue-50 text-blue-700 font-medium shadow-sm ring-1 ring-blue-100' : 'hover:bg-gray-100'}`}>
              <span className="truncate">{s.title}</span>
              <span className="text-xs bg-gray-200 px-1.5 rounded-full text-gray-600 self-center">{s.cases.length}</span>
            </div>
          ))}
          <button onClick={addSuite} className="w-full mt-2 p-2 text-gray-400 border border-dashed rounded-md hover:text-blue-600 hover:border-blue-300 flex items-center justify-center gap-2 text-xs transition-colors">
            <Plus className="w-3 h-3"/> Add Suite
          </button>
        </div>

        <div className="p-3 border-t border-gray-200 bg-white space-y-3">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase mb-1">
              <Settings className="w-3 h-3"/> Global Target
            </div>
            <input 
              value={config.url} onChange={e => setConfig({ ...config, url: e.target.value })}
              placeholder="API URL"
              className="w-full text-xs font-mono bg-gray-50 border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
             <div className="flex justify-between items-center mb-1">
               <span className="text-[10px] font-bold text-gray-400 uppercase">Headers</span>
               <button onClick={addHeader} className="text-[10px] text-blue-600 hover:underline flex items-center gap-1">
                 <Plus className="w-3 h-3"/> Add
               </button>
             </div>
             <div className="space-y-1 max-h-32 overflow-y-auto">
               {config.headers?.map((h, i) => (
                 <div key={i} className="flex gap-1 items-center">
                   <input 
                     value={h.key} onChange={e => updateHeader(i, e.target.value, h.value)}
                     placeholder="Key"
                     className="flex-1 w-0 text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                   />
                   <input 
                     value={h.value} onChange={e => updateHeader(i, h.key, e.target.value)}
                     placeholder="Value"
                     className="flex-1 w-0 text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                   />
                   <button onClick={() => removeHeader(i)} className="text-gray-400 hover:text-red-500 p-1">
                     <Trash2 className="w-3 h-3"/>
                   </button>
                 </div>
               ))}
               {(!config.headers || config.headers.length === 0) && (
                 <div className="text-xs text-gray-300 italic text-center py-1">No custom headers</div>
               )}
             </div>
          </div>
        </div>
     </div>
  );
};
