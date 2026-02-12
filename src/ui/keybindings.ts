export interface UiKeyInput {
  name: string;
  shift?: boolean;
  ctrl?: boolean;
}

export type UiAction =
  | 'switch-agent'
  | 'select-next-teammate'
  | 'select-previous-teammate'
  | 'toggle-task-list';

export function resolveUiAction(input: UiKeyInput): UiAction | undefined {
  if (input.name === 'tab') {
    return 'switch-agent';
  }

  if (input.shift && input.name === 'down') {
    return 'select-next-teammate';
  }

  if (input.shift && input.name === 'up') {
    return 'select-previous-teammate';
  }

  if (input.ctrl && input.name.toLowerCase() === 't') {
    return 'toggle-task-list';
  }

  return undefined;
}
