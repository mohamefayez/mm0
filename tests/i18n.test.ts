import { test } from "node:test";
import assert from "node:assert/strict";
import { translator } from "../src/lib/i18n.ts";

test("Arabic copy preserves names, spacing and dynamic accessible labels", () => {
  const t = translator("ar");
  assert.equal(t("Asel Cosmetics"), "Asel Cosmetics");
  assert.equal(t("  For her "), "  لها ");
  assert.equal(t("Shopping bag, 3 items"), "حقيبة التسوق، 3 منتجات");
  assert.equal(t("Question 2 of 5"), "السؤال 2 من 5");
  assert.equal(t("Floor 2. "), "الدور 2. ");
  assert.equal(translator("en")("For her"), "For her");
});
