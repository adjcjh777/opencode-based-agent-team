export type PermissionLevel = 'allow' | 'deny' | 'ask';

export interface PermissionConfig {
  [toolName: string]: PermissionLevel;
}

type AskHandler = (toolName: string, args: unknown) => Promise<boolean>;

const defaultAskHandler: AskHandler = async () => false;

export class PermissionManager {
  private readonly config: PermissionConfig;
  private readonly askHandler: AskHandler;

  constructor(config: PermissionConfig, askHandler: AskHandler = defaultAskHandler) {
    this.config = config;
    this.askHandler = askHandler;
  }

  async check(toolName: string, args: unknown): Promise<boolean> {
    const level = this.config[toolName] ?? 'deny';

    if (level === 'allow') {
      return true;
    }

    if (level === 'deny') {
      return false;
    }

    return this.askHandler(toolName, args);
  }
}
