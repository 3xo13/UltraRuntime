import { notFound } from "next/navigation";
import StudioSite from "@/components/StudioSite";

import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

type HomePageProps = {
  params: Promise<{ lang: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const dictionary = await getDictionary(lang);
  return <StudioSite locale={lang} dictionary={dictionary} />;
}
