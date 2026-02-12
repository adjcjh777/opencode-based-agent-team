export interface ToolExecutionContext {
  cwd?: string;
}

export interface ToolDefinition<TArgs = unknown, TResult = unknown> {
  name: string;
  description: string;
  execute: (args: TArgs, context?: ToolExecutionContext) => Promise<TResult>;
}
