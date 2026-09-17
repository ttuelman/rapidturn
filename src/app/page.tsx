import { Configurator } from "@/components/Configurator";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-rapid-600">
          Free FRC configurator
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-steel-900 sm:text-5xl">
          0.5&quot; hex shafts, configured for the robot
        </h1>
        <p className="mt-4 text-base text-steel-600 sm:text-lg">
          Cut length, tap each end, drop E-clip grooves, and turn a journal. Instant 3D
          preview and a price estimate — download a STEP that matches. Nothing is for sale
          yet.
        </p>
      </div>
      <div className="mt-8">
        <Configurator />
      </div>
    </div>
  );
}
