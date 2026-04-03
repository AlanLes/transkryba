import { useState, useRef } from "react";
import { fal, type WhisperOutput } from "../_lib/fal-client";

export function useTranscription() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setTranscription(null);
    }
  };

  const handleTranscribe = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setTranscription(null);

    try {
      const audioUrl = await fal.storage.upload(file);

      const result = await fal.run("fal-ai/whisper", {
        input: {
          audio_url: audioUrl,
          language: "pl",
          task: "transcribe",
          chunk_level: "segment",
        },
      });

      const output = result.data as WhisperOutput;
      setTranscription(output.text);
    } catch (err) {
      console.error("Transcription error:", err);
      setError(
        err instanceof Error ? err.message : "Wystąpił błąd podczas transkrypcji"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setTranscription(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return {
    file,
    isLoading,
    transcription,
    error,
    fileInputRef,
    handleFileChange,
    handleTranscribe,
    handleReset,
  };
}
