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

export type FindingBar = {
  type: "Pre flight" | "Altitude" | "Flight path" | "Cockpit";
  importance: number;
  confidence: number;
  severity: number;
};
