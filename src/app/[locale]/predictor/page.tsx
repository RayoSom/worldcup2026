import { setRequestLocale } from 'next-intl/server';
import { PredictorPageClient } from './PredictorPageClient';

export default async function PredictorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PredictorPageClient locale={locale} />;
}
