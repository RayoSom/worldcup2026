import { setRequestLocale } from 'next-intl/server';
import { PartidoClient } from './PartidoClient';

export default async function PartidoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PartidoClient locale={locale} />;
}
