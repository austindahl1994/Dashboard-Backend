export interface Team {
  teamNumber: number;
  tileCounts: Map<number, number>;
  completedTiles: Set<number>;
  rowCounts: Array<number>;
  colCounts: Array<number>;
  completedRows: Set<number>; // used to calc row points, store completed row indices
  completedCols: Set<number>; // used to calc col points, store completed col indices
  tilePoints: number;
}

/*
 {
    tileCounts: new Map(),
    completedTiles: new Set(),
    rowCounts: Array(10).fill(0),
    colCounts: Array(10).fill(0),
    completedRows: new Set(),
    completedCols: new Set(),
    score: 0,
  };

  function createTeamState(): TeamState {
  return {
    tileCounts: new Map(),
    completedTiles: new Set(),
    rowCounts: Array(10).fill(0),
    colCounts: Array(10).fill(0),
    completedRows: new Set(),
    completedCols: new Set(),
    score: 0,
  };
}

 */
