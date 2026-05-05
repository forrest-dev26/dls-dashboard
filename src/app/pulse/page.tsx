import { PulseScreen } from "@/components/PulseScreen";

export const dynamic = "force-dynamic";

export default function PulsePage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-48px)] max-w-[800px] flex-col justify-center px-6 py-12">
      <div className="mb-6">
        <h1 className="m-0 font-display text-2xl font-semibold tracking-tight">Pulse</h1>
        <p className="mt-1 text-[13px] text-ink-3">30-second view. What matters right now.</p>
      </div>
      <PulseScreen />
    </main>
  );
}
