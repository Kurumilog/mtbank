export interface RemoteLevelProgress {
  userId: string;
  levelId: number;
  stars: number;
  bestTimeMs: number | null;
  completedAt: string;
}

export interface SaveProgressInput {
  userId: string;
  levelId: number;
  stars: number;
  timeSeconds: number;
}
