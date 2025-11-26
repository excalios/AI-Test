import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Suite, ExecutionLogs, SuiteStatus, Config } from '../types';

interface TestRunnerContextType {
  suites: Suite[];
  setSuites: React.Dispatch<React.SetStateAction<Suite[]>>;
  executionLogs: ExecutionLogs;
  setExecutionLogs: React.Dispatch<React.SetStateAction<ExecutionLogs>>;
  config: Config;
  setConfig: React.Dispatch<React.SetStateAction<Config>>;
  selectedSuiteId: string | null;
  setSelectedSuiteId: (id: string | null) => void;
  selectedCaseId: string | null;
  setSelectedCaseId: (id: string | null) => void;
  suiteStatus: SuiteStatus;
  setSuiteStatus: React.Dispatch<React.SetStateAction<SuiteStatus>>;
  runningCaseId: string | null;
  setRunningCaseId: (id: string | null) => void;
}

const TestRunnerContext = createContext<TestRunnerContextType | undefined>(undefined);

export const TestRunnerProvider = ({ children }: { children: ReactNode }) => {
  // --- App Logic State (Lazy Initializers) ---
  
  const [config, setConfig] = useState<Config>(() => {
    try {
      const saved = localStorage.getItem('llm-test-runner-config');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure headers exist for older saved configs
        return { 
          url: parsed.url || 'http://localhost:3000/api/chat',
          headers: parsed.headers || []
        };
      }
      return { 
        url: 'http://localhost:3000/api/chat',
        headers: []
      };
    } catch { 
      return { 
        url: 'http://localhost:3000/api/chat',
        headers: []
      }; 
    }
  });

  const [suites, setSuites] = useState<Suite[]>(() => {
    try {
      const saved = localStorage.getItem('llm-test-suites');
      return saved ? JSON.parse(saved) : [
        {
          id: 'suite-indo-immigration', 
          title: 'Indonesia Immigration Tests', 
          cases: [
            {
              id: 'c1-digital-nomad', 
              title: 'Digital Nomad (EN-ID)', 
              lang: 'EN-ID', 
              messages: [
                "I heard Indonesia has a new remote worker visa. Can I apply for it offshore?",
                "Does it require a sponsor in Jakarta?",
                "Ok, terima kasih infonya."
              ]
            }
          ]
        }
      ];
    } catch { return []; }
  });

  const [executionLogs, setExecutionLogs] = useState<ExecutionLogs>(() => {
    try {
      const saved = localStorage.getItem('llm-test-execution-logs');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const [selectedSuiteId, setSelectedSuiteId] = useState<string | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  
  const [runningCaseId, setRunningCaseId] = useState<string | null>(null);
  const [suiteStatus, setSuiteStatus] = useState<SuiteStatus>({});

  // --- Persistence ---

  useEffect(() => {
    localStorage.setItem('llm-test-runner-config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('llm-test-suites', JSON.stringify(suites));
  }, [suites]);

  useEffect(() => {
    localStorage.setItem('llm-test-execution-logs', JSON.stringify(executionLogs));
  }, [executionLogs]);

  return (
    <TestRunnerContext.Provider value={{
      suites, setSuites,
      executionLogs, setExecutionLogs,
      config, setConfig,
      selectedSuiteId, setSelectedSuiteId,
      selectedCaseId, setSelectedCaseId,
      suiteStatus, setSuiteStatus,
      runningCaseId, setRunningCaseId
    }}>
      {children}
    </TestRunnerContext.Provider>
  );
};

export const useTestRunner = () => {
  const context = useContext(TestRunnerContext);
  if (!context) {
    throw new Error('useTestRunner must be used within a TestRunnerProvider');
  }
  return context;
};
