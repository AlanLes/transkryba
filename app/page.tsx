"use client";

import { useState, useRef } from "react";
import { fal } from "@fal-ai/client";

fal.config({
  proxyUrl: "/api/fal/proxy",
});

interface WhisperOutput {
  text: string;
  chunks?: Array<{
    timestamp: [number, number];
    text: string;
  }>;
}

export default function Home() {
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

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="flex flex-1 w-full max-w-2xl flex-col gap-8 py-12 px-6">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Transkryba
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Transkrypcja audio do tekstu
          </p>
        </header>

        <section className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Wybierz plik audio
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".m4a,.mp3,.mp4,.wav,.webm,audio/*"
              onChange={handleFileChange}
              disabled={isLoading}
              className="block w-full text-sm text-zinc-600 dark:text-zinc-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-medium
                file:bg-zinc-100 file:text-zinc-700
                hover:file:bg-zinc-200
                dark:file:bg-zinc-800 dark:file:text-zinc-300
                dark:hover:file:bg-zinc-700
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </label>

          {file && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Wybrany plik: <span className="font-medium">{file.name}</span>
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleTranscribe}
              disabled={!file || isLoading}
              className="flex-1 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors
                hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed
                dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Transkrybuję...
                </span>
              ) : (
                "Transkrybuj"
              )}
            </button>

            {(file || transcription) && !isLoading && (
              <button
                onClick={handleReset}
                className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors
                  hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Wyczyść
              </button>
            )}
          </div>
        </section>

        {error && (
          <section className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </section>
        )}

        {transcription && (
          <section className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Transkrypcja
              </h2>
              <button
                onClick={() => navigator.clipboard.writeText(transcription)}
                className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Kopiuj
              </button>
            </div>
            <div className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {transcription}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
