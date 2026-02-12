export function formatTeammateViewLines(selected: string | undefined, lines: string[]): string[] {
  return ['=== Teammate ===', `Selected: ${selected ?? 'none'}`, ...lines];
}
