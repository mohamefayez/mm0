import { translator } from "@/lib/i18n";
import { BrandMark } from "@/components/brand-mark";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getStore } from "@/lib/commerce-store";
export function Footer({ locale }: { locale: string }) {
  const t = translator(locale);
  const contact = getStore().settings();

  return (
    <footer className="footer">
      <div className="container footer-main">
        <div className="footer-brand">
          <BrandMark />
          <p>
            {t("For the moments that become memories. ")}
            <br />
            {t("Find a little of yourself in every scent. ")}
          </p>
        </div>
        <div>
          <h3>{t("Explore")}</h3>
          <Link href={`/${locale}/perfumes`}>{t("All fragrances")}</Link>
          <Link href={`/${locale}/perfumes?gender=women`}>{t("For her")}</Link>
          <Link href={`/${locale}/perfumes?gender=men`}>{t("For him")}</Link>
          <Link href={`/${locale}/brands`}>{t("Fragrance houses")}</Link>
          <Link href={`/${locale}/discover`}>{t("Find your scent")}</Link>
        </div>
        <div>
          <h3>{t("Here to help")}</h3>
          <Link href={`/${locale}/about`}>{t("Our story")}</Link>
          <Link href={`/${locale}/contact`}>{t("Contact & FAQ")}</Link>
          <Link href={`/${locale}/shipping`}>{t("Delivery & returns")}</Link>
          <Link href={`/${locale}/privacy`}>{t("Privacy")}</Link>
          <Link href={`/${locale}/terms`}>{t("Terms")}</Link>
          {contact.whatsapp && (
            <a
              href={`https://wa.me/${contact.whatsapp}`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
          )}
          {contact.phone && (
            <a href={`tel:${contact.phone}`} dir="ltr">
              {contact.phone}
            </a>
          )}
        </div>
        <div className="footer-invitation">
          <h3>{t("A scent that feels like you.")}</h3>
          <p>
            {t(
              "Fresh, floral, woody or wonderfully unexpected. Discover where your senses take you. ",
            )}
          </p>
          <Link className="text-link" href={`/${locale}/discover`}>
            {t("Find your fragrance family ")}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          {t("© ")}
          {new Date().getFullYear()}
          {t(" Asel Cosmetics")}
        </span>
        <span>{t("Egypt · Prices in EGP")}</span>
        <span>{t("Made for the love of fragrance.")}</span>
      </div>
    </footer>
  );
}
