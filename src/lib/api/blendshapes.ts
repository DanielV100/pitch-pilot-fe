import { Blendshape, BlendshapeInput } from "@/types/blendshapes";
import { request } from "./core";
import { Category } from "@mediapipe/tasks-vision";

export async function getBlendshapes(trainingId: string) {
  return request<Blendshape[]>(`/v1//blendshapes/${trainingId}`);
}

let ws: WebSocket | null = null;

export function openBlendshapeSocket(
  onOpen?: () => void,
  onClose?: () => void,
  onError?: (err: Event) => void
) {
  if (ws && ws.readyState !== WebSocket.CLOSED) {
    ws.close();
  }

  ws = new WebSocket(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/blendshapes/ws/add`!
  );

  ws.onopen = () => onOpen?.();
  ws.onclose = () => onClose?.();
  ws.onerror = (e) => onError?.(e);
}

export function sendBlendshapes(frame: {
  training_id: string;
  timestamp: number;
  scores: Category[];
}) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(frame));
  } else {
    console.warn("[sendBlendshapeFrame] WebSocket not open.");
  }
}

export function closeBlendshapeSocket() {
  if (ws) {
    ws.close();
    ws = null;
  }
}
