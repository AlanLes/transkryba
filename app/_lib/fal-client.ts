import { fal } from "@fal-ai/client";

fal.config({
  proxyUrl: "/api/fal/proxy",
});

export { fal };

export interface WhisperOutput {
  text: string;
  chunks?: Array<{
    timestamp: [number, number];
    text: string;
  }>;
}
