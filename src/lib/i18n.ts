import { ar } from "../data/ar.ts";
export type Language = "en" | "ar";
export function isLanguage(value: string): value is Language {
  return value === "en" || value === "ar";
}
export function translator(locale: string) {
  return function t<T>(value: T): T {
    if (locale !== "ar" || typeof value !== "string") return value;
    const key = value.replace(/\s+/g, " ").trim();
    if (Object.hasOwn(ar, key))
      return ((value.match(/^\s*/)?.[0] ?? "") +
        ar[key] +
        (value.match(/\s*$/)?.[0] ?? "")) as T;
    const patterns: [RegExp, (m: RegExpMatchArray) => string][] = [
      [/^Shopping bag, (\d+) items$/, (m) => `حقيبة التسوق، ${m[1]} منتجات`],
      [/^Wishlist, (\d+) items$/, (m) => `المفضلة، ${m[1]} منتجات`],
      [/^(\d+) fragrances?$/, (m) => `${m[1]} عطر`],
      [/^Show (\d+) fragrances$/, (m) => `عرض ${m[1]} عطر`],
      [/^Question (\d+) of (\d+)$/, (m) => `السؤال ${m[1]} من ${m[2]}`],
      [
        /^Close (.+)$/,
        (m) =>
          `إغلاق ${ar[m[1]] ?? ar[Object.keys(ar).find((k) => k.toLowerCase() === m[1]) ?? ""] ?? m[1]}`,
      ],
      [/^View image (\d+)$/, (m) => `عرض الصورة ${m[1]}`],
      [/^View (.+)$/, (m) => `عرض ${m[1]}`],
      [/^Remove (.+) from wishlist$/, (m) => `إزالة ${m[1]} من المفضلة`],
      [/^Remove (.+) filter$/, (m) => `إزالة فلتر ${m[1]}`],
      [/^Floor (.+)\.$/, (m) => `الدور ${m[1]}. `],
      [/^Apartment (.+)\.$/, (m) => `الشقة ${m[1]}.`],
      [/^(.+) scent family$/, (m) => `العائلة العطرية ${ar[m[1]] ?? m[1]}`],
      [/^suited to (.+)$/, (m) => `مناسب لـ${ar[m[1]] ?? m[1]}`],
      [/^(.+) projection$/, (m) => `انتشار ${ar[m[1]] ?? m[1]}`],
      [/^Save (.+) to wishlist$/, (m) => `إضافة ${m[1]} إلى المفضلة`],
      [/^Remove (.+)$/, (m) => `إزالة ${m[1]}`],
      [/^Decrease (.+)$/, () => "تقليل الكمية"],
      [/^Increase (.+)$/, () => "زيادة الكمية"],
      [/^(\d+) ml$/, (m) => `${m[1]} مل`],
    ];
    for (const [pattern, render] of patterns) {
      const match = key.match(pattern);
      if (match) return render(match) as T;
    }
    return value;
  };
}
