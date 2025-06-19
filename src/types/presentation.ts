export type Training = {
  id: string;
  date: string;
  total_score: number;
};

export type Presentation = {
  id: string;
  name: string;
  tags: string[];
  trainings: Training[];
};
