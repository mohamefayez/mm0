import { translator } from "@/lib/i18n";
import Link from "next/link";
import { notes } from "@/data/catalog";
import { pageMetadata } from "@/lib/metadata";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMetadata(
    "A world of fragrance notes",
    "Get to know oud, rose, vanilla, musk and the notes that give fragrance its character.",
    `/${locale}/notes`,
  );
}
export default async function Notes({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = translator(locale);

  return (
    <div className="container">
      <div className="page-heading">
        <h1>{t("Let your senses lead.")}</h1>
        <p>{t("A fragrance starts with a note. Which one speaks to you?")}</p>
      </div>
      <div className="page-body notes-grid">
        {notes.map((note) => (
          <Link
            className="note-card"
            href={`/${locale}/perfumes?note=${note.slug}`}
            key={note.slug}
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
    </div>
  );
}
