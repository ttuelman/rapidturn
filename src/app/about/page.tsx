export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold text-steel-900">About Rapid Turn</h1>
      <p className="mt-4 text-steel-600 leading-relaxed">
        Rapid Turn machines bar-fed lathe parts for FRC teams. The first production cell
        is a Haas CL-1. This site is a free configurator for 0.5&quot; 7075-T6 hex shafts —
        the part teams cut, tap, groove, and turn all season.
      </p>
      <p className="mt-4 text-steel-600 leading-relaxed">
        v1 is CAD and an estimate only. There is no checkout, waitlist, or payment. Download
        the STEP, drop it in your robot CAD, and treat the number on screen as a placeholder
        until ordering opens.
      </p>
      <p className="mt-4 text-steel-600 leading-relaxed">
        Rapid Turn machines shafts up to 8.00 in. Longer configs stay available here for CAD
        or another shop — preview, estimate, and STEP still work; Buy stays off above 8 in.
      </p>
      <p className="mt-4 text-steel-600 leading-relaxed">
        Out of this release: snap-ring / axial circlip paths, cross-drill, anodize, 3/8&quot;
        hex, steel, keyways, and live checkout.
      </p>
    </div>
  );
}
