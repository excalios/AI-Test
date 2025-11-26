export interface TestCase {
  id: string;
  title: string;
  lang: string;
  messages: string[];
}

export interface Suite {
  id: string;
  title: string;
  cases: TestCase[];
}

export interface LogEntry {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  loading?: boolean;
  error?: boolean;
}

export interface ExecutionLogs {
  [caseId: string]: LogEntry[];
}

export interface Header {
  key: string;
  value: string;
}

export interface Config {
  url: string;
  headers: Header[];
}

export type TestCaseStatus = 'pending' | 'running' | 'success' | 'error';

export interface SuiteStatus {
  [caseId: string]: TestCaseStatus;
}
