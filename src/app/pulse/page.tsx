import { PulseScreen } from "@/components/PulseScreen";

export const dynamic = "force-dynamic";

export default function PulsePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[900px] flex-col justify-center px-8 py-12">
      <div className="mb-8">
        <h1 className="m-0 text-[28px] font-semibold tracking-tight text-ink">Pulse</h1>
        <p className="mt-1.5 text-[14px] text-ink-3">30-second view. What matters right now.</p>
      </div>
      <PulseScreen />
    </main>
  );
}
