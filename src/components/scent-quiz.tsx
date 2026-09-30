"use client";
import { useTranslation } from "@/components/preferences";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Flower2 } from "lucide-react";
import { recommend, type QuizAnswers } from "@/lib/catalog-logic";
import { ProductCard } from "@/components/product-card";
import { ButtonLink } from "@/components/ui";
import type { Brand, Product } from "@/types/catalog";
const steps: {
  key: keyof QuizAnswers;
  title: string;
  options: [string, string][];
}[] = [
  {
    key: "gender",
    title: "Who is the fragrance for?",
    options: [
      ["women", "For her"],
      ["men", "For him"],
      ["unisex", "A shared fragrance"],
      ["any", "Keep it open"],
    ],
  },
  {
    key: "family",
    title: "What are you naturally drawn to?",
    options: [
      ["fresh", "Fresh & bright"],
      ["floral", "Soft florals"],
      ["woody", "Warm woods"],
      ["sweet", "Sweet & comforting"],
      ["amber", "Golden amber"],
      ["oud", "Deep oud"],
      ["musky", "Clean musk"],
    ],
  },
  {
    key: "occasion",
    title: "When will you wear it?",
    options: [
      ["daily", "Every day"],
      ["office", "At the office"],
      ["evening", "Evenings out"],
      ["special", "Special occasions"],
    ],
  },
  {
    key: "projection",
    title: "How would you like it to linger?",
    options: [
      ["soft", "Close to the skin"],
      ["moderate", "A gentle presence"],
      ["strong", "A lasting impression"],
    ],
  },
  {
    key: "budget",
    title: "What feels comfortable?",
    options: [
      ["2500", "Up to 2,500 EGP"],
      ["5000", "Up to 5,000 EGP"],
      ["8000", "Up to 8,000 EGP"],
      ["any", "No set budget"],
    ],
  },
];
const profiles: Record<
  string,
  { title: string; description: string; note: string }
> = {
  fresh: {
    title: "A brighter kind of energy.",
    description:
      "You’re drawn to crisp, uplifting scents. Start with citrus, bergamot and green notes for a fresh, easygoing fragrance.",
    note: "citrus",
  },
  floral: {
    title: "A softer kind of statement.",
    description:
      "You’re drawn to the expressive world of florals. Explore rose and jasmine, from light petals to richer floral compositions.",
    note: "rose",
  },
  woody: {
    title: "Quiet depth. Warm character.",
    description:
      "You’re drawn to grounding woody notes. Sandalwood and cedar are a lovely place to start your discovery.",
    note: "sandalwood",
  },
  sweet: {
    title: "Comfort, with a little intrigue.",
    description:
      "You’re drawn to enveloping, sweet compositions. Vanilla and warm gourmand notes could be the beginning of your scent story.",
    note: "vanilla",
  },
  amber: {
    title: "Your world has a golden glow.",
    description:
      "You’re drawn to warm, enveloping amber compositions. Explore rich resinous notes and softly spiced fragrances.",
    note: "amber",
  },
  oud: {
    title: "A distinctive presence.",
    description:
      "You’re drawn to depth and character. Explore oud and its many interpretations, from smooth woods to rich, smoky accords.",
    note: "oud",
  },
  musky: {
    title: "Something beautifully understated.",
    description:
      "You’re drawn to soft, intimate scents. Musk and delicate skin-like accords are a natural starting point.",
    note: "musk",
  },
};
export function ScentQuiz({
  products,
  brands,
  locale,
}: {
  products: Product[];
  brands: Brand[];
  locale: string;
}) {
  const t = useTranslation();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    gender: "",
    family: "",
    occasion: "",
    projection: "",
    budget: "",
  });
  const panel = useRef<HTMLDivElement>(null);
  const done = step === steps.length;
  const current = steps[step];
  const matches = done ? recommend(products, answers) : [];
  const profile = profiles[answers.family];
  const go = (next: number) => {
    setStep(next);
    requestAnimationFrame(() => panel.current?.focus());
  };
  return (
    <div className={done ? "quiz-result" : "quiz-layout"}>
      {!done && (
        <div className="quiz-intro">
          <Flower2 size={45} strokeWidth={1} />
          <h2>
            {t("A scent that feels ")}
            <br />
            {t("a little more like you. ")}
          </h2>
          <p>
            {t(
              "There’s no right answer. Just follow your instincts and we’ll help you discover your fragrance family. ",
            )}
          </p>
          <p>{t("Five questions. A moment for yourself.")}</p>
        </div>
      )}
      <div ref={panel} tabIndex={-1} className={done ? "" : "quiz-panel"}>
        {done ? (
          <>
            <span className="status-label">
              {t("Your fragrance direction")}
            </span>
            <h2>{t(profile.title)}</h2>
            <p className="muted">{t(profile.description)}</p>
            <p className="small-text muted">
              {t("Your preferences:")}
              {t(" ")}
              {t(
                steps
                  .map((item) =>
                    t(
                      item.options.find(
                        ([value]) => value === answers[item.key],
                      )?.[1],
                    ),
                  )
                  .join(" · "),
              )}
            </p>
            {matches.length ? (
              <div className="product-grid section">
                {matches.map(({ product, reasons }) => (
                  <div key={product.id}>
                    <ProductCard
                      product={product}
                      brand={brands.find(
                        (brand) => brand.id === product.brandId,
                      )}
                      locale={locale}
                    />
                    <p className="small-text muted">
                      {t("Matches your preference for ")}
                      {reasons.map((reason) => t(reason)).join(" · ")}
                      {t(". ")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="notice">
                {t(
                  products.length
                    ? "We don’t have a fragrance matching your preferences right now. Explore your favourite note or try a different direction."
                    : "Your fragrance profile is ready. Personal product recommendations will be available when our first collection arrives.",
                )}
              </div>
            )}
            <div className="form-actions">
              <button
                className="button button-secondary"
                onClick={() => {
                  setAnswers({
                    gender: "",
                    family: "",
                    occasion: "",
                    projection: "",
                    budget: "",
                  });
                  go(0);
                }}
              >
                {t("Start again ")}
              </button>
              <ButtonLink href={`/${locale}/perfumes?note=${profile.note}`}>
                {t("Explore ")}
                {t(profile.note)}
              </ButtonLink>
            </div>
          </>
        ) : (
          <>
            <p className="small-text muted">
              {t("Question ")}
              {step + 1}
              {t(" of ")}
              {steps.length}
            </p>
            <div className="quiz-progress" aria-hidden="true">
              {steps.map((item, index) => (
                <span key={item.key} className={index <= step ? "done" : ""} />
              ))}
            </div>
            <h2 id="quiz-question">{t(current.title)}</h2>
            <fieldset className="quiz-options" aria-labelledby="quiz-question">
              <legend className="sr-only">{t(current.title)}</legend>
              {current.options.map(([value, label]) => (
                <label className="quiz-option" key={value}>
                  <input
                    type="radio"
                    name={current.key}
                    value={value}
                    checked={answers[current.key] === value}
                    onChange={() =>
                      setAnswers((previous) => ({
                        ...previous,
                        [current.key]: value,
                      }))
                    }
                  />
                  {t(label)}
                </label>
              ))}
            </fieldset>
            <div className="form-actions">
              <button
                className="button button-secondary"
                disabled={step === 0}
                onClick={() => go(step - 1)}
              >
                <ArrowLeft size={15} />
                {t("Back ")}
              </button>
              <button
                className="button"
                disabled={!answers[current.key]}
                onClick={() => go(step + 1)}
              >
                {t(step === steps.length - 1 ? "Discover my profile" : "Next")}
                <ArrowRight size={15} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
