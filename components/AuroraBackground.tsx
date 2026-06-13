// Fixed decorative gradient blobs behind all content.
export default function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div
        className="absolute -top-32 left-1/4 h-[40rem] w-[40rem] rounded-full blur-3xl animate-float"
        style={{ background: 'radial-gradient(circle, var(--bg-grad-1), transparent 70%)' }}
      />
      <div
        className="absolute top-1/3 -right-32 h-[32rem] w-[32rem] rounded-full blur-3xl animate-float"
        style={{ background: 'radial-gradient(circle, var(--bg-grad-2), transparent 70%)', animationDelay: '3s' }}
      />
      <div
        className="absolute bottom-0 left-0 h-[28rem] w-[28rem] rounded-full blur-3xl animate-float"
        style={{ background: 'radial-gradient(circle, var(--bg-grad-3), transparent 70%)', animationDelay: '6s' }}
      />
    </div>
  );
}
