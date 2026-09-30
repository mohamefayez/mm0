import { translator } from "@/lib/i18n";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Flower2, ScanHeart, Sparkles } from "lucide-react";
import { StillLife } from "@/components/still-life";
import { ButtonLink, SectionHeading } from "@/components/ui";
import { ProductGrid } from "@/components/product-card";
import { RecentlyViewed } from "@/components/shop";
import { categories, notes } from "@/data/catalog";
import { catalog } from "@/lib/catalog";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMetadata(
    "The art of feeling unforgettable",
    "A considered world of fragrance. Explore scent families, discover your signature, and meet Asel Cosmetics.",
    `/${locale}`,
  );
}
export default async function Home({
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
  const bestsellers = products
    .filter((product) => product.isBestSeller)
    .slice(0, 4);
  const newProducts = products.filter((product) => product.isNew).slice(0, 4);
  return (
    <>
      <section className="hero signature-scene">
        <div className="hero-copy">
          <div className="hero-intro">
            <span className="tiny-rule" />
            {t("The Asel collection ")}
          </div>
          <h1>{t("The art of feeling unforgettable.")}</h1>
          <p>
            {t("A fragrance is more than a finishing touch. ")}
            <br className="desktop-break" />
            {t(" It’s a little of who you are, left in the air. ")}
          </p>
          <div className="hero-actions">
            <ButtonLink href={`/${locale}/perfumes`}>
              {t("Explore fragrances ")}
            </ButtonLink>
            <Link className="text-link" href={`/${locale}/discover`}>
              {t("Find your signature ")}
              <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="hero-footnote">
            <Flower2 size={20} strokeWidth={1} />
            <span>{t("A world of scent, thoughtfully discovered.")}</span>
          </div>
        </div>
        <div className="hero-art signature-art">
          <div className="signature-halo" aria-hidden="true" />
          <Image
            src="/products/libre-cutout.png"
            alt="Libre — Yves Saint Laurent"
            fill
            priority
            sizes="(max-width: 767px) 100vw, 50vw"
            className="signature-bottle"
          />
          <span className="hero-art-note">
            {t("The beauty of a lasting impression ")}
          </span>
        </div>
      </section>
      <div className="brand-ribbon">
        <span>{t("Personal by nature.")}</span>
        <Flower2 size={17} strokeWidth={1} />
        <span>{t("Memorable by design.")}</span>
        <Flower2 size={17} strokeWidth={1} />
        <span>{t("Beautifully Asel.")}</span>
      </div>
      <section className="section container">
        <SectionHeading
          title={t("A scent for every side of you.")}
          description={t("Follow your mood. Find your fragrance.")}
        />
        <div className="category-grid">
          {categories.slice(0, 4).map((category) => (
            <Link
              className={`category-card tone-${category.tone}`}
              key={category.slug}
              href={`/${locale}/perfumes?${["women", "men", "unisex"].includes(category.slug) ? "gender" : "category"}=${category.slug}`}
            >
              <div className="category-art">
                <StillLife small tone={category.tone} />
              </div>
              <div className="category-info">
                <h3>{t(category.name)}</h3>
                <ArrowUpRight size={20} />
                <p>{t(category.description)}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="category-extra">
          <Link href={`/${locale}/perfumes?category=arabic`}>
            {t("Discover Arabic fragrances ")}
            <ArrowUpRight size={15} />
          </Link>
          <Link href={`/${locale}/perfumes?category=gifts`}>
            {t("Explore the art of gifting ")}
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>
      <section className="section container collection-section">
        <SectionHeading
          title={t(
            bestsellers.length
              ? "The most loved."
              : "Selected for your discovery.",
          )}
          description={t(
            bestsellers.length
              ? "Fragrances worth returning to."
              : "Explore the fragrances in the Asel collection.",
          )}
          href={`/${locale}/perfumes`}
          link={t("View the collection")}
        />
        {products.length ? (
          <ProductGrid
            products={
              bestsellers.length
                ? bestsellers
                : products.filter((p) => p.isFeatured).slice(0, 8)
            }
            brands={brands}
            locale={locale}
          />
        ) : (
          <div className="collection-preview">
            <div className="collection-symbol">
              <Flower2 size={70} strokeWidth={0.65} />
            </div>
            <div>
              <span className="status-label">
                {t("The first collection · Coming soon ")}
              </span>
              <h3>{t("Good things are worth discovering.")}</h3>
              <p>
                {t(
                  "While we prepare the collection, get to know the notes you’re naturally drawn to. ",
                )}
              </p>
              <Link className="text-link" href={`/${locale}/discover`}>
                {t("Start with your senses ")}
                <ArrowUpRight size={17} />
              </Link>
            </div>
            <span className="collection-script" aria-hidden="true">
              {t("Asel ")}
            </span>
          </div>
        )}
      </section>
      <section className="editorial container">
        <div className="editorial-art">
          <StillLife small tone="olive" />
        </div>
        <div className="editorial-copy">
          <span className="editorial-kicker">{t("Beyond the familiar")}</span>
          <h2>
            {t("Some scents don’t follow a story. ")}
            <br />
            {t("They start one. ")}
          </h2>
          <p>
            {t(
              "Discover the world of niche perfumery. Unexpected notes, distinctive compositions, and a character entirely their own. ",
            )}
          </p>
          <ButtonLink href={`/${locale}/perfumes?category=niche`} secondary>
            {t("Explore niche perfumery ")}
          </ButtonLink>
        </div>
      </section>
      <section className="section container" id="notes">
        <SectionHeading
          title={t("Let your senses lead.")}
          description={t("A single note can take you somewhere.")}
          href={`/${locale}/notes`}
          link={t("Explore all notes")}
        />
        <div className="notes-grid">
          {notes.slice(0, 6).map((note) => (
            <Link
              key={note.slug}
              className="note-card"
              href={`/${locale}/perfumes?note=${note.slug}`}
            >
              <div className={`note-art note-${note.tone}`} aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
              <h3>{t(note.name)}</h3>
              <p>{t(note.description)}</p>
            </Link>
          ))}
        </div>
      </section>
      {brands.length > 0 && (
        <section className="section container">
          <SectionHeading
            title={t("The houses behind the scents.")}
            href={`/${locale}/brands`}
            link={t("All houses")}
          />
          <div className="brand-grid">
            {brands.map((brand) => (
              <Link href={`/${locale}/brands/${brand.slug}`} key={brand.id}>
                {t(brand.name)}
              </Link>
            ))}
          </div>
        </section>
      )}
      {newProducts.length > 0 && (
        <section className="section container">
          <SectionHeading
            title={t("A fresh introduction.")}
            description={t("The latest additions to our fragrance world.")}
            href={`/${locale}/perfumes?collection=new`}
          />
          <ProductGrid products={newProducts} brands={brands} locale={locale} />
        </section>
      )}
      <section className="quiz-banner container">
        <div className="quiz-flower" aria-hidden="true">
          <Flower2 strokeWidth={0.45} />
        </div>
        <div>
          <span className="status-label">
            {t("A little discovery, just for you")}
          </span>
          <h2>
            {t("Your signature is ")}
            <br />
            {t("waiting to be found. ")}
          </h2>
          <p>
            {t("A few simple questions. A clearer sense of what you love.")}
          </p>
          <ButtonLink href={`/${locale}/discover`}>
            {t("Find my scent")}
          </ButtonLink>
        </div>
        <span className="quiz-note">
          {t("Personal. Intuitive. ")}
          <br />
          {t("Entirely you. ")}
        </span>
      </section>
      <RecentlyViewed products={products} brands={brands} locale={locale} />
      <section
        className="values-strip container"
        aria-label={t("The Asel approach")}
      >
        <div>
          <Flower2 size={27} strokeWidth={1} />
          <h3>{t("A considered collection")}</h3>
          <p>{t("Room for scents with character.")}</p>
        </div>
        <div>
          <ScanHeart size={27} strokeWidth={1} />
          <h3>{t("A personal discovery")}</h3>
          <p>{t("Find the notes that feel like you.")}</p>
        </div>
        <div>
          <Sparkles size={27} strokeWidth={1} />
          <h3>{t("A little everyday luxury")}</h3>
          <p>{t("Make an ordinary moment your own.")}</p>
        </div>
      </section>
    </>
  );
}
