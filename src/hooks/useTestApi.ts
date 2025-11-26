import { useState } from 'react';
import type { TestCase, LogEntry, Header } from '../types';

interface UseTestApiProps {
  url: string;
  headers: Header[];
}

export const useTestApi = ({ url, headers }: UseTestApiProps) => {
  const [isRunning, setIsRunning] = useState(false);

  const executeTestCase = async (
    testCase: TestCase, 
    onLogUpdate: (logs: LogEntry[]) => void
  ): Promise<'success' | 'error'> => {
    setIsRunning(true);
    
    const logs: LogEntry[] = [];
    
    // Helper to update external state
    const notify = () => onLogUpdate([...logs]);

    // Clear logs implicitly by starting fresh (local variable is empty)
    notify();
    
    let sessId: string | null = null;
    let hasError = false;

    try {
      for (const msg of testCase.messages) {
        // 1. User Message
        logs.push({ role: 'user', content: msg, timestamp: new Date().toISOString() });
        notify();
        
        // 2. Assistant Placeholder
        logs.push({ role: 'assistant', content: '', loading: true, timestamp: new Date().toISOString() });
        const asstLogIndex = logs.length - 1;
        notify();

        try {
          const reqHeaders: Record<string, string> = {
            'Content-Type': 'application/json'
          };
          
          headers.forEach(h => {
            if (h.key && h.value) reqHeaders[h.key] = h.value;
          });

          const res = await fetch(url, {
            method: 'POST',
            headers: reqHeaders,
            body: JSON.stringify({ message: msg, lang: testCase.lang, session_id: sessId })
          });

          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          if (!res.body) throw new Error('No response body');

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          
          while(true) {
            const { value, done } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmedLine = line.trim();
              if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;
              const dataContent = trimmedLine.slice(6).trim(); 
              if (dataContent === '[DONE]') continue;

              try {
                const json = JSON.parse(dataContent);
                if (json.session_id) sessId = json.session_id;
                if (json.response) {
                  const currentLog = logs[asstLogIndex];
                  if (currentLog) {
                    logs[asstLogIndex] = { ...currentLog, content: json.response, loading: false };
                    notify();
                  }
                }
              } catch (e) { console.warn("Parse error", dataContent); }
            }
          }
          const finalLog = logs[asstLogIndex];
          if (finalLog) {
            logs[asstLogIndex] = { ...finalLog, loading: false };
            notify();
          }

        } catch (err: any) {
          const currentLog = logs[asstLogIndex];
          if (currentLog) {
             logs[asstLogIndex] = { ...currentLog, content: `Error: ${err.message}`, loading: false, error: true };
             notify();
          }
          hasError = true;
          break; 
        }
      }
    } catch (e) {
      hasError = true;
    } finally {
      setIsRunning(false);
    }
    
    return hasError ? 'error' : 'success';
  };

  return {
    isRunning,
    executeTestCase
  };
};