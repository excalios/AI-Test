import React, { useState, useCallback } from 'react';
import { ResizeHandle } from './components/ui/ResizeHandle';
import { SuiteList } from './components/features/SuiteList';
import { CaseList } from './components/features/CaseList';
import { RunnerPanel } from './components/features/RunnerPanel';
import { TestRunnerProvider } from './context/TestRunnerContext';

const TestRunnerLayout = () => {
  // --- Layout State (Resizing) ---
  const [col1Width, setCol1Width] = useState(280);
  const [col2Width, setCol2Width] = useState(320);

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

  return (
    <div className="flex h-screen w-full bg-white text-gray-900 font-sans text-sm overflow-hidden">
      
      {/* COLUMN 1: SUITES */}
      <div style={{ width: col1Width }} className="flex-shrink-0 flex flex-col border-r border-gray-200 bg-gray-50/50">
        <SuiteList />
      </div>

      <ResizeHandle onMouseDown={(e) => startResizing(e, setCol1Width)} />

      {/* COLUMN 2: CASES */}
      <div style={{ width: col2Width }} className="flex-shrink-0 flex flex-col border-r border-gray-200 bg-white">
        <CaseList />
      </div>

      <ResizeHandle onMouseDown={(e) => startResizing(e, setCol2Width)} />

      {/* COLUMN 3: RUNNER */}
      <div className="flex-1 flex flex-col bg-white min-w-[400px]">
        <RunnerPanel />
      </div>
    </div>
  );
};

export default function TestRunner() {
  return (
    <TestRunnerProvider>
      <TestRunnerLayout />
    </TestRunnerProvider>
  );
}
