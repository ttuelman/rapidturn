import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-rapid-600">
          Instant Quote · Automated Production
        </p>
        <h1 className="mt-4 text-5xl font-bold tracking-tight text-steel-900 sm:text-6xl">
          Lathe parts in{" "}
          <span className="text-rapid-600">minutes</span>, not meetings
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-steel-600">
          Configure turned parts from limited materials and features. Get a real-time quote,
          buy now, and your G-code is generated and sent to our Haas CL-1 — no back-and-forth
          with a salesperson.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/shop"
            className="rounded-xl bg-rapid-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-rapid-200 hover:bg-rapid-700"
          >
            Configure a Part
          </Link>
          <Link
            href="/machine"
            className="rounded-xl border border-steel-200 bg-white px-8 py-4 text-lg font-semibold text-steel-700 hover:bg-steel-50"
          >
            View Machine Queue
          </Link>
        </div>
      </div>

      <div className="mt-24 grid gap-8 sm:grid-cols-3">
        {[
          {
            title: "Limited, fast choices",
            body: "6061 aluminum or 1018 steel. Up to 0.5\" bar. Single-setup OD profiles, chamfers, and part-off.",
          },
          {
            title: "Real-time pricing",
            body: "Quote updates as you configure. Material, machining time, and quantity discounts calculated instantly.",
          },
          {
            title: "Lights-out ready",
            body: "Buy now triggers Haas-compatible G-code generation. Program number routes straight to the CL-1.",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-steel-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-steel-900">{card.title}</h3>
            <p className="mt-2 text-sm text-steel-600">{card.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-2xl border border-steel-200 bg-steel-900 p-8 text-center text-white">
        <h2 className="text-2xl font-bold">Haas CL-1 Chucker Lathe</h2>
        <p className="mx-auto mt-3 max-w-xl text-steel-300">
          MVP production on a single machine: 0.5&quot; max diameter bar stock, one setup per part,
          automated program dispatch from order to spindle.
        </p>
      </div>
    </div>
  );
}
