interface TranscriptionResultProps {
  text: string;
}

export default function TranscriptionResult({ text }: TranscriptionResultProps) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Transkrypcja
        </h2>
        <button
          onClick={() => navigator.clipboard.writeText(text)}
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Kopiuj
        </button>
      </div>
      <div className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300 leading-relaxed">
        {text}
      </div>
    </section>
  );
}
