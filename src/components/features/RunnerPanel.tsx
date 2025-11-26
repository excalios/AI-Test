import React, { useState, useCallback } from 'react';
import { Loader2, Play } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ResizeHandle } from '../ui/ResizeHandle';
import { MessageEditor } from './MessageEditor';
import { LogViewer } from './LogViewer';
import { useTestRunner } from '../../context/TestRunnerContext';
import { useTestApi } from '../../hooks/useTestApi';

export const RunnerPanel: React.FC = () => {
  const { 
    suites, 
    setSuites, 
    selectedSuiteId, 
    selectedCaseId, 
    executionLogs, 
    setExecutionLogs, 
    runningCaseId, 
    setRunningCaseId, 
    setSuiteStatus,
    config 
  } = useTestRunner();

  const { executeTestCase, isRunning } = useTestApi({ url: config.url, headers: config.headers || [] });
  const [msgPanelWidth, setMsgPanelWidth] = useState(350);

  const startResizing = useCallback((mouseDownEvent: React.MouseEvent, setWidthFn: React.Dispatch<React.SetStateAction<number>>) => {
    const startX = mouseDownEvent.clientX;
    const startWidth = (mouseDownEvent.target as HTMLElement).previousElementSibling?.clientWidth || 300;

    const onMouseMove = (mouseMoveEvent: MouseEvent) => {
      requestAnimationFrame(() => {
        const newWidth = startWidth + (mouseMoveEvent.clientX - startX);
        if (newWidth > 150 && newWidth < 1000) setWidthFn(newWidth);
      });
    };

    const onMouseUp = () => {
      document.body.style.cursor = 'default';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.body.style.cursor = 'col-resize';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, []);

  const selSuite = suites.find(s => s.id === selectedSuiteId);
  const selCase = selSuite?.cases.find(c => c.id === selectedCaseId);
  const activeLogs = selCase ? (executionLogs[selCase.id] || []) : [];

  const updateCase = (updates: Partial<typeof selCase>) => {
      if (selSuite && selCase) {
          const newCases = selSuite.cases.map(c => c.id === selCase.id ? { ...c, ...updates } : c);
          setSuites(suites.map(s => s.id === selSuite.id ? { ...s, cases: newCases } : s));
      }
  };

  const runTest = async () => {
    if (!selCase) return;
    setRunningCaseId(selCase.id);
    setSuiteStatus(prev => ({ ...prev, [selCase.id]: 'running' }));
    
    const result = await executeTestCase(selCase, (logs) => {
        setExecutionLogs(prev => ({ ...prev, [selCase.id]: logs }));
    });

    setSuiteStatus(prev => ({ ...prev, [selCase.id]: result }));
    setRunningCaseId(null);
  };

  if (!selCase) {
      return <div className="flex-1 flex items-center justify-center text-gray-300">Select a test case</div>;
  }

  return (
      <div className="flex flex-col h-full w-full bg-white">
            {/* Runner Header */}
            <div className="p-3 border-b border-gray-200 flex justify-between items-start bg-white shadow-sm z-20">
              <div className="flex gap-3 w-full max-w-2xl">
                <div className="flex-1"><Input value={selCase.title} onChange={v => updateCase({title: v})} label="Case Title"/></div>
                <div className="w-24"><Input value={selCase.lang} onChange={v => updateCase({lang: v})} label="Lang Code"/></div>
              </div>
              <div className="flex gap-2 items-end h-full pb-0.5">
                <Button onClick={runTest} disabled={isRunning || selCase.messages.length === 0} className="w-24">
                  {isRunning && runningCaseId === selCase.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Play className="w-4 h-4 mr-2 fill-current"/>}
                  {isRunning && runningCaseId === selCase.id ? '' : 'Run'}
                </Button>
              </div>
            </div>

            {/* Runner Split View */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* Input Config */}
              <div style={{ width: msgPanelWidth }} className="flex-shrink-0 border-r border-gray-200">
                 <MessageEditor messages={selCase.messages} onUpdate={m => updateCase({messages: m})} />
              </div>

              <ResizeHandle onMouseDown={(e) => startResizing(e, setMsgPanelWidth)} />

              {/* Chat Preview */}
              <LogViewer logs={activeLogs} onClear={() => setExecutionLogs(p => ({...p, [selCase.id]: []}))} />
            </div>
      </div>
  );
};
