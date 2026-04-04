"use client";

import { useTranscription } from "../_hooks/use-transcription";
import FileUploadSection from "./file-upload-section";
import TranscriptionResult from "./transcription-result";
import ErrorAlert from "./error-alert";

export default function TranscriptionWidget() {
  const {
    file,
    isLoading,
    transcription,
    error,
    fileInputRef,
    handleFileChange,
    handleTranscribe,
    handleReset,
  } = useTranscription();

  return (
    <>
      <FileUploadSection
        file={file}
        isLoading={isLoading}
        hasTranscription={!!transcription}
        fileInputRef={fileInputRef}
        onFileChange={handleFileChange}
        onTranscribe={handleTranscribe}
        onReset={handleReset}
      />
      {error && <ErrorAlert message={error} />}
      {transcription !== null && <TranscriptionResult text={transcription} />}
    </>
  );
}
