export type Presentation = {
  id: string;
  name: string;
  tags: string[];
  trainings: Training[];
  file_url?: string;
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

export type VisibilityMode = "solo" | "private";

export type DifficultyLevel = "easy" | "medium" | "hard";

export interface AudioScores {
  transcript: {
    full_text: string;
    words: { start: number; end: number; word: string }[];
  };
  wpm: number;
  avg_volume_dbfs: number;
  duration: number;
  volume_timeline: { t: number; rms: number; dbfs: number }[];
  fillers: {
    word: string;
    count: number;
    explanation: string;
    start?: number;
  }[];
  questions: string[];
  formulation_aids: {
    original: string;
    suggestion: string;
    explanation: string;
  }[];
}

export type SlideEvent = {
  timestamp: number;
  page: number;
};

export interface TrainingCreatePayload {
  presentation_id: string;
  duration_seconds: number;
  visibility_mode: VisibilityMode;
  difficulty: DifficultyLevel;
  eye_calibration: Record<string, unknown> | null;
  date?: string | null;
}

export interface Training {
  id: string;
  presentation_id?: string;
  duration_seconds?: number;
  visibility_mode?: VisibilityMode;
  difficulty?: DifficultyLevel;
  eye_calibration?: Record<string, unknown> | null;
  total_score: number;
  date: string;
  slide_events?: SlideEvent[];
  video_url?: string;
  training_results?: TrainingResult[];
}

export interface TrainingResult {
  id: string;
  audio_scores?: AudioScores;
  eye_tracking_scores?: EyeTrackingScore[];
  eye_tracking_total_score?: number;
}

export interface EyeTrackingScore {
  x: number;
  y: number;
  count: number;
}