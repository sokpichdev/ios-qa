// Subtle ambient glow behind all content. Neumorphism reads best on a near-flat
// surface, so we keep a single faint red radial rather than multi-color blobs.
export default function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div
        className="absolute -top-40 left-1/2 h-[45rem] w-[45rem] -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--bg-glow), transparent 70%)' }}
      />
    </div>
  );
}
