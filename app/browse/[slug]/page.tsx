import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import QuestionDetail from '@/components/QuestionDetail';
import { QUESTIONS, getBySlug, questionSlug } from '@/lib/questions';

export const dynamicParams = false;

export function generateStaticParams() {
  return QUESTIONS.map((question) => ({ slug: questionSlug(question.question) }));
}

type Props = { params: { slug: string } };

export function generateMetadata({ params }: Props): Metadata {
  const question = getBySlug(params.slug);
  if (!question) return {};

  return {
    title: question.question,
    description: `iOS ${question.topic} interview question and answer.`,
    alternates: { canonical: `/browse/${questionSlug(question.question)}` },
  };
}

export default function QuestionPage({ params }: Props) {
  const question = getBySlug(params.slug);
  if (!question) notFound();

  return <QuestionDetail question={question} />;
}
