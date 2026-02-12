import { describe, expect, it } from 'vitest';

import { resolveUiAction } from '../../../src/ui/keybindings.js';

describe('resolveUiAction', () => {
  it('maps Tab to agent switching', () => {
    expect(resolveUiAction({ name: 'tab' })).toBe('switch-agent');
  });

  it('maps Shift+Down/Up to teammate selection', () => {
    expect(resolveUiAction({ name: 'down', shift: true })).toBe('select-next-teammate');
    expect(resolveUiAction({ name: 'up', shift: true })).toBe('select-previous-teammate');
  });

  it('maps Ctrl+T to task list toggle', () => {
    expect(resolveUiAction({ name: 't', ctrl: true })).toBe('toggle-task-list');
  });

  it('returns undefined for unrelated keys', () => {
    expect(resolveUiAction({ name: 'enter' })).toBeUndefined();
  });
});
