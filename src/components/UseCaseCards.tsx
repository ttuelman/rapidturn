import { USE_CASE_DISCLAIMER, USE_CASES } from "@/config/useCases";
import { configPath } from "@/lib/share";

export function UseCaseCards() {
  return (
    <section id="use-cases" className="mt-16 border-t border-steel-200 pt-12">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-rapid-600">
          From Chief Delphi
        </p>
        <h2 className="mt-2 text-2xl font-bold text-steel-900 sm:text-3xl">
          Built for how FRC actually retains hex
        </h2>
        <p className="mt-3 text-steel-600">
          Open a preset into the configurator, then edit the controls or the URL params. No
          login.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {USE_CASES.map((uc) => (
          <article
            key={uc.id}
            className="flex flex-col rounded-2xl border border-steel-200 bg-white p-5 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-steel-900">{uc.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-steel-600">{uc.story}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a
                href={configPath(uc.config)}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.assign(configPath(uc.config));
                }}
                className="inline-flex rounded-lg bg-rapid-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-rapid-700"
              >
                Open this config
              </a>
              <a
                href={uc.threadUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-rapid-700 underline-offset-2 hover:underline"
              >
                Discussed on Chief Delphi
              </a>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-6 text-xs text-steel-500">{USE_CASE_DISCLAIMER}</p>
    </section>
  );
}
