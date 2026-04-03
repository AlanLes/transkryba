import { RefObject } from "react";

interface FileUploadSectionProps {
  file: File | null;
  isLoading: boolean;
  hasTranscription: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTranscribe: () => void;
  onReset: () => void;
}

export default function FileUploadSection({
  file,
  isLoading,
  hasTranscription,
  fileInputRef,
  onFileChange,
  onTranscribe,
  onReset,
}: FileUploadSectionProps) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Wybierz plik audio
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept=".m4a,.mp3,.mp4,.wav,.webm,audio/*"
          onChange={onFileChange}
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
          onClick={onTranscribe}
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

        {(file || hasTranscription) && !isLoading && (
          <button
            onClick={onReset}
            className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors
              hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Wyczyść
          </button>
        )}
      </div>
    </section>
  );
}
