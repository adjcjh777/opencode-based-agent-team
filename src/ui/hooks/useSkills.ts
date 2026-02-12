export interface SkillState {
  skills: string[];
  activeSkill?: string;
}

export function createSkillState(skills: string[], activeSkill?: string): SkillState {
  return { skills: [...skills], activeSkill };
}

export function setActiveSkill(state: SkillState, activeSkill?: string): SkillState {
  if (activeSkill !== undefined && !state.skills.includes(activeSkill)) {
    return state;
  }

  return { ...state, activeSkill };
}
