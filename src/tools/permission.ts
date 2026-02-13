export type PermissionLevel = 'allow' | 'deny' | 'ask';

export interface PermissionConfig {
  [toolName: string]: PermissionLevel;
}

type AskHandler = (toolName: string, args: unknown) => Promise<boolean>;

const defaultAskHandler: AskHandler = async () => false;
const wildcardToken = '*';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function wildcardMatches(pattern: string, value: string): boolean {
  const source = `^${escapeRegex(pattern).replace(/\\\*/g, '.*')}$`;
  const matcher = new RegExp(source);
  return matcher.test(value);
}

function wildcardSpecificity(pattern: string): number {
  return pattern.replace(/\*/g, '').length;
}

export class PermissionManager {
  private readonly config: PermissionConfig;
  private readonly askHandler: AskHandler;

  constructor(config: PermissionConfig, askHandler: AskHandler = defaultAskHandler) {
    this.config = config;
    this.askHandler = askHandler;
  }

  private resolveLevel(toolName: string): PermissionLevel | undefined {
    const exact = this.config[toolName];
    if (exact !== undefined) {
      return exact;
    }

    let matchedLevel: PermissionLevel | undefined;
    let bestSpecificity = -1;

    for (const [pattern, level] of Object.entries(this.config)) {
      if (!pattern.includes(wildcardToken)) {
        continue;
      }

      if (!wildcardMatches(pattern, toolName)) {
        continue;
      }

      const specificity = wildcardSpecificity(pattern);
      if (specificity > bestSpecificity) {
        matchedLevel = level;
        bestSpecificity = specificity;
      }
    }

    return matchedLevel;
  }

  async check(toolName: string, args: unknown): Promise<boolean> {
    const level = this.resolveLevel(toolName) ?? 'deny';

    if (level === 'allow') {
      return true;
    }

    if (level === 'deny') {
      return false;
    }

    return this.askHandler(toolName, args);
  }
}
