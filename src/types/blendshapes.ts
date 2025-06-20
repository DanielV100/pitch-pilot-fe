export type BlendshapeEntry = {
  index: number;
  score: number;
  categoryName: string;
  displayName: string;
};

export type Blendshape = {
  id: string;
  training_id: string;
  timestamp: number;
  scores: BlendshapeEntry[];
};

export type BlendshapeInput = {
  training_id: string;
  timestamp: number;
  scores: BlendshapeEntry[];
};
