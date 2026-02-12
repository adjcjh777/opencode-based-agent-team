export function formatTaskListLines(lines: string[]): string[] {
  return ['=== Tasks ===', ...lines];
}
