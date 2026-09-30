import { translator } from "@/lib/i18n";
import { notFound } from "next/navigation";
import Link from "next/link";
import { catalog } from "@/lib/catalog";
import { ProductDetail } from "@/components/product-detail";
import { ProductGrid } from "@/components/product-card";
import { Breadcrumbs, SectionHeading } from "@/components/ui";
import { pageMetadata } from "@/lib/metadata";
import { productName, productDescription } from "@/lib/product-copy";
type Props = { params: Promise<{ locale: string; slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const product = await catalog.get(slug);
  return product
    ? pageMetadata(
        productName(product, locale),
        productDescription(product, locale),
        `/${locale}/perfumes/${slug}`,
      )
    : {};
}
export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;
  const t = translator(locale);

  const [product, brands, products] = await Promise.all([
    catalog.get(slug),
    catalog.brands(),
    catalog.all(),
  ]);
  if (!product) notFound();
  const related = products
    .filter(
      (other) =>
        other.id !== product.id &&
        (other.brandId === product.brandId ||
          other.scentFamilies.some((family) =>
            product.scentFamilies.includes(family),
          )),
    )
    .slice(0, 4);
  return (
    <div className="container">
      <div className="page-heading">
        <Breadcrumbs
          items={[
            { label: "Home", href: `/${locale}` },
            { label: "Fragrances", href: `/${locale}/perfumes` },
            { label: productName(product, locale) },
          ]}
        />
      </div>
      <ProductDetail
        product={product}
        brand={brands.find((brand) => brand.id === product.brandId)}
        locale={locale}
      />
      {product.topNotes.length +
        product.heartNotes.length +
        product.baseNotes.length >
        0 && (
        <section className="section">
          <SectionHeading
            title={t("A fragrance, in three chapters.")}
            description={t(
              "From the first impression to the notes that stay with you.",
            )}
          />
          <div className="fragrance-pyramid">
            {[
              ["Top notes", product.topNotes],
              ["Heart notes", product.heartNotes],
              ["Base notes", product.baseNotes],
            ].map(([name, values]) => (
              <div key={String(name)}>
                <h3>{t(name)}</h3>
                {(values as string[]).map((note) => (
                  <Link
                    className="text-link"
                    key={note}
                    href={`/${locale}/perfumes?note=${encodeURIComponent(note)}`}
                  >
                    {t(note)}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}
      {related.length > 0 && (
        <section className="section">
          <SectionHeading title={t("You might also be drawn to…")} />
          <ProductGrid products={related} brands={brands} locale={locale} />
        </section>
      )}
    </div>
  );
}
