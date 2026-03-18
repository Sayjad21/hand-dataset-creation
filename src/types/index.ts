export interface Box {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'hand' | 'target';
  label?: string;
  conf?: number;
}

export interface Fingertip {
  id: string;
  x: number;
  y: number;
}

export type InteractionMode = 'select' | 'draw_hand' | 'draw_target' | 'place_fingertip';
