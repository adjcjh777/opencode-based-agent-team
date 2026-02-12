import React from 'react';
import { Text } from 'ink';

export function formatSkillPanelLine(skills: string[], activeSkill?: string): string {
  const rendered = skills.map((skill) => (skill === activeSkill ? `${skill}*` : skill));
  return `Skills: ${rendered.join(' | ')}`;
}

export interface SkillPanelProps {
  skills: string[];
  activeSkill?: string;
}

export function SkillPanel({ skills, activeSkill }: SkillPanelProps): React.ReactElement {
  return <Text>{formatSkillPanelLine(skills, activeSkill)}</Text>;
}
