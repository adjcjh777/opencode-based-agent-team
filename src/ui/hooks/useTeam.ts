export interface TeamState {
  teamName: string;
  teammates: string[];
  selectedTeammate?: string;
}

export function createTeamState(
  teamName: string,
  teammates: string[] = [],
  selectedTeammate?: string
): TeamState {
  return {
    teamName,
    teammates: [...teammates],
    selectedTeammate
  };
}

export function selectNextTeammate(state: TeamState): TeamState {
  if (state.teammates.length === 0) {
    return state;
  }

  const currentIndex = state.selectedTeammate ? state.teammates.indexOf(state.selectedTeammate) : -1;
  const nextIndex = (currentIndex + 1 + state.teammates.length) % state.teammates.length;

  return {
    ...state,
    selectedTeammate: state.teammates[nextIndex]
  };
}

export function selectPreviousTeammate(state: TeamState): TeamState {
  if (state.teammates.length === 0) {
    return state;
  }

  const currentIndex = state.selectedTeammate ? state.teammates.indexOf(state.selectedTeammate) : 0;
  const previousIndex = (currentIndex - 1 + state.teammates.length) % state.teammates.length;

  return {
    ...state,
    selectedTeammate: state.teammates[previousIndex]
  };
}
