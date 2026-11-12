export interface SubtitleWord {
  word: string;
  start: number; // in seconds
  end: number;   // in seconds
  duration: number; // in seconds
}

export interface WordChunk {
  words: SubtitleWord[];
  start: number;
  end: number;
  index: number;
}

export interface VideoMetadata {
  voice: string;
  wordCount: number;
  speechDurationSeconds: number;
  totalDurationSeconds: number;
  totalFrames: number;
  fps: number;
  width: number;
  height: number;
}

export interface ShortCompositionProps extends Record<string, unknown> {
  genre?: "style-advisor" | "data-detective" | "tech-fact" | "kurzgesagt-explainer";
  hookBadge?: string;
  subtitles?: SubtitleWord[];
}
