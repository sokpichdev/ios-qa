import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { QUESTIONS, getById, getAdjacentQuestions, getRelatedQuestions } from '@/lib/questions';
import QuestionDetailView from '@/components/QuestionDetailView';

interface PageProps {
  params: { id: string };
}

export async function generateStaticParams() {
  return QUESTIONS.map((q) => ({
    id: q.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const question = getById(params.id);
  if (!question) {
    return {
      title: 'Question Not Found | iOS Reference & Practice',
    };
  }

  const title = `${question.question} | iOS Reference & Practice`;
  const cleanSnippet = question.answer
    .replace(/[#*`_~[\]()]/g, '')
    .replace(/^Answer:\s*/i, '')
    .slice(0, 160)
    .trim();
  const description = `${question.topic} (${question.difficulty.toUpperCase()} level): ${cleanSnippet}…`;

  return {
    title,
    description,
    alternates: {
      canonical: `/questions/${question.id}`,
    },
    openGraph: {
      type: 'article',
      url: `/questions/${question.id}`,
      siteName: 'iOS Reference & Practice',
      title,
      description,
      images: [{ url: '/og.png', width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og.png'],
    },
  };
}

export default function QuestionPage({ params }: PageProps) {
  const question = getById(params.id);
  if (!question) {
    notFound();
  }

  const { prev, next } = getAdjacentQuestions(question.id);
  const related = getRelatedQuestions(question, 3);

  return (
    <QuestionDetailView
      question={question}
      prevQuestion={prev}
      nextQuestion={next}
      relatedQuestions={related}
    />
  );
}
