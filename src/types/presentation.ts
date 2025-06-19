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

export interface FindingEntry {
  id: string;
  total_score: number;
  cockpit_score: number;
  flight_path_score: number;
  altitude_score: number;
  preflight_check_score: number;
  is_active: boolean;
  findings: {
    slides: Array<{
      page: number;
      findings: Array<{
        type: number;
        importance: number;
        confidence: number;
        severity: number;
        text_excerpt: string;
        suggestion: string;
        explanation: string;
      }>;
    }>;
  };
}
