import { translator } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { catalog } from "@/lib/catalog";
import { getStore } from "@/lib/commerce-store";
import { StoreMotion } from "@/components/store-motion";
export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = translator(locale);

  if (locale !== "en" && locale !== "ar") notFound();
  const [products, brands] = await Promise.all([
    catalog.all(),
    catalog.brands(),
  ]);
  return (
    <>
      <a className="skip-link" href="#main">
        {t("Skip to content ")}
      </a>
      <Header
        locale={locale}
        products={products}
        brands={brands}
        storeMode={getStore().settings().mode}
      />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer locale={locale} />
      <StoreMotion />
    </>
  );
}
