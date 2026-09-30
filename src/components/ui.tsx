"use client";
import { useTranslation } from "@/components/preferences";
import Link from "next/link";
import { ArrowUpRight, Flower2 } from "lucide-react";
import type { ReactNode } from "react";

export function ButtonLink({
  href,
  children,
  secondary = false,
  className = "",
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
  className?: string;
}) {
  const t = useTranslation();

  return (
    <Link
      href={href}
      className={`button ${secondary ? "button-secondary" : ""} ${className}`}
    >
      {t(children)}
      <ArrowUpRight size={17} aria-hidden="true" />
    </Link>
  );
}
export function SectionHeading({
  title,
  description,
  href,
  link = "Explore the collection",
}: {
  title: string;
  description?: string;
  href?: string;
  link?: string;
}) {
  const t = useTranslation();

  return (
    <div className="section-heading">
      <div>
        <h2>{t(title)}</h2>
        {t(description && <p>{t(description)}</p>)}
      </div>
      {t(
        href && (
          <Link href={href} className="text-link">
            {t(link)}
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        ),
      )}
    </div>
  );
}
export function EmptyState({
  title,
  description,
  href,
  action = "Explore fragrance notes",
  compact = false,
}: {
  title: string;
  description: string;
  href?: string;
  action?: string;
  compact?: boolean;
}) {
  const t = useTranslation();

  return (
    <div className={`empty-state ${compact ? "compact" : ""}`}>
      <Flower2 size={32} strokeWidth={1} aria-hidden="true" />
      <h2>{t(title)}</h2>
      <p>{t(description)}</p>
      {t(
        href && (
          <ButtonLink href={href} secondary>
            {t(action)}
          </ButtonLink>
        ),
      )}
    </div>
  );
}
export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  const t = useTranslation();

  return (
    <nav aria-label={t("Breadcrumb")} className="breadcrumbs">
      <ol>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`}>
            {item.href ? (
              <Link href={item.href}>{t(item.label)}</Link>
            ) : (
              <span aria-current="page">{t(item.label)}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
