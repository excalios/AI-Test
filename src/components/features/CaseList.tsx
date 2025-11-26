import React from 'react';
import { Loader2, PlayCircle, Trash2, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useTestRunner } from '../../context/TestRunnerContext';
import { useTestApi } from '../../hooks/useTestApi';
import type { Suite } from '../../types';

export const CaseList: React.FC = () => {
  const { 
    suites, 
    setSuites, 
    selectedSuiteId, 
    setSelectedSuiteId,
    selectedCaseId,
    setSelectedCaseId,
    suiteStatus,
    setSuiteStatus,
    setExecutionLogs,
    config
  } = useTestRunner();

  const { executeTestCase, isRunning } = useTestApi({ url: config.url, headers: config.headers || [] });

  const selSuite = suites.find(s => s.id === selectedSuiteId);

  const updateSuite = (id: string, updates: Partial<Suite>) => {
    setSuites(s => s.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const addCase = (sId: string) => {
    const id = crypto.randomUUID();
    const suite = suites.find(s => s.id === sId);
    if (!suite) return;
    
    updateSuite(sId, { cases: [...suite.cases, { id, title: 'New Case', lang: 'EN-ID', messages: [''] }] });
    setSelectedCaseId(id);
  };

  const runSuite = async (suite: Suite) => {
    if (!suite || suite.cases.length === 0) return;
    
    // Reset statuses for this suite
    const newStatus = { ...suiteStatus };
    suite.cases.forEach(c => newStatus[c.id] = 'pending');
    setSuiteStatus(newStatus);

    for (const testCase of suite.cases) {
      setSelectedCaseId(testCase.id); // Auto-select UI
      
      // Mark as running
      setSuiteStatus(prev => ({ ...prev, [testCase.id]: 'running' }));

      const result = await executeTestCase(testCase, (logs) => {
         setExecutionLogs(prev => ({ ...prev, [testCase.id]: logs }));
      });
      
      setSuiteStatus(prev => ({ ...prev, [testCase.id]: result }));
      
      // Small delay for visual clarity
      await new Promise(r => setTimeout(r, 500));
    }
  };

  if (!selSuite) {
      return <div className="flex-1 flex items-center justify-center text-gray-300">Select Suite</div>;
  }

  return (
      <div className="flex flex-col h-full w-full">
        <div className="p-3 border-b border-gray-200 bg-gray-50/30 space-y-2">
            <Input value={selSuite.title} onChange={v => updateSuite(selSuite.id, {title: v})} label="Suite Name"/>
            <div className="flex justify-between items-center pt-1">
            <Button variant="outline" size="sm" onClick={() => runSuite(selSuite)} disabled={isRunning || selSuite.cases.length === 0} className="text-blue-600 border-blue-200 hover:bg-blue-50">
                {isRunning ? <Loader2 className="w-3 h-3 animate-spin mr-2"/> : <PlayCircle className="w-3 h-3 mr-2"/>}
                Run Suite
            </Button>
            <Button variant="danger" size="sm" onClick={() => {
                if(confirm('Delete?')) { setSuites(s => s.filter(x => x.id !== selSuite.id)); setSelectedSuiteId(null); }
            }}><Trash2 className="w-3 h-3"/></Button>
            </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
            <div className="flex justify-between items-center px-1 mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Test Cases</span>
            <button onClick={() => addCase(selSuite.id)} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Plus className="w-4 h-4"/></button>
            </div>
            {selSuite.cases.map(c => {
            const status = suiteStatus[c.id];
            return (
                <div key={c.id} onClick={() => setSelectedCaseId(c.id)}
                className={`p-3 rounded border cursor-pointer transition-all relative ${selectedCaseId === c.id ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-gray-200 hover:border-blue-300'}`}>
                <div className="flex justify-between mb-1 items-start">
                    <span className="font-medium truncate pr-6">{c.title}</span>
                    
                    {/* Status Icon */}
                    <div className="absolute top-3 right-3">
                    {status === 'running' && <Loader2 className="w-4 h-4 text-blue-500 animate-spin"/>}
                    {status === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500"/>}
                    {status === 'error' && <AlertCircle className="w-4 h-4 text-red-500"/>}
                    {!status && <div className="w-2 h-2 rounded-full bg-gray-200 mt-1"/>}
                    </div>
                </div>
                <div className="text-xs text-gray-400 flex gap-2 items-center">
                    <span className="font-mono bg-white px-1 rounded border">{c.lang}</span>
                    <span>{c.messages.length} msgs</span>
                </div>
                </div>
            );
            })}
        </div>
      </div>
  );
};
