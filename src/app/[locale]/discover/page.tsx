import { translator } from "@/lib/i18n";
import { ScentQuiz } from "@/components/scent-quiz";
import { catalog } from "@/lib/catalog";
import { pageMetadata } from "@/lib/metadata";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMetadata(
    "Find your signature scent",
    "Discover your fragrance family with five simple questions.",
    `/${locale}/discover`,
  );
}
export default async function Discover({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = translator(locale);

  const [products, brands] = await Promise.all([
    catalog.all(),
    catalog.brands(),
  ]);
  return (
    <div className="container">
      <div className="page-heading">
        <h1>{t("Your signature starts here.")}</h1>
      </div>
      <div className="page-body">
        <ScentQuiz products={products} brands={brands} locale={locale} />
      </div>
    </div>
  );
}
