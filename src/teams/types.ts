export interface TeamConfig {
  name: string;
  leader: string;
  members: TeammateConfig[];
  taskListPath?: string;
  displayMode: 'in-process';
}

export interface TeammateConfig {
  id: string;
  name: string;
  role: string;
  model?: string;
  prompt: string;
  requirePlanApproval?: boolean;
}

export interface TeamMessage {
  id: string;
  from: string;
  to: string | 'broadcast';
  content: string;
  timestamp: number;
  type: 'message' | 'notification' | 'task-update';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'blocked';
  assignee?: string;
  dependsOn?: string[];
  result?: string;
}
