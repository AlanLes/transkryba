import PageHeader from "./_components/page-header";
import TranscriptionWidget from "./_components/transcription-widget";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="flex flex-1 w-full max-w-2xl flex-col gap-8 py-12 px-6">
        <PageHeader />
        <TranscriptionWidget />
      </main>
    </div>
  );
}
