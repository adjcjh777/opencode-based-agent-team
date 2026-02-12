export function formatSkillPanelLine(skills: string[], activeSkill?: string): string {
  const rendered = skills.map((skill) => (skill === activeSkill ? `${skill}*` : skill));
  return `Skills: ${rendered.join(' | ')}`;
}
