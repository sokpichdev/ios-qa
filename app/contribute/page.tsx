import Link from 'next/link';
import Icon from '@/components/Icon';

export const metadata = { title: 'Contribute — iOS Reference & Practice' };

export default function ContributePage() {
  return (
    <div className="py-20 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full" style={{ background: 'rgba(20,184,166,0.16)', color: '#2dd4bf' }}>
        <Icon name="sparkles" size={28} />
      </span>
      <h1 className="mt-4 text-2xl font-bold">Contribute Questions</h1>
      <p className="text-muted mx-auto mt-2 max-w-md">
        A way to submit your own interview questions is coming soon. For now, questions live as
        markdown files in <code className="surface-2 rounded px-1.5 py-0.5 text-xs">content/questions/</code> — open a PR to add yours.
      </p>
      <Link href="/browse" className="btn-ghost mt-6 inline-flex">Browse Questions <Icon name="arrow-right" size={15} /></Link>
    </div>
  );
}
