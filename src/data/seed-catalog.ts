import type { Product, Brand } from "../types/catalog.ts";
import { cutoutProductIds } from "./product-cutouts.ts";
import { suppliedBrands, suppliedProducts, suppliedCovers } from "./supplied-catalog.ts";
const houses: Record<string, string> = {
  ibrahim: "Ibrahim Al Qurashi",
  lattafa: "Lattafa",
  ysl: "Yves Saint Laurent",
  chanel: "Chanel",
  dior: "Dior",
  burberry: "Burberry",
  herrera: "Carolina Herrera",
  creed: "Creed",
  lancome: "Lancôme",
  tomford: "Tom Ford",
  assaf: "Assaf",
  laverne: "Laverne",
  hersh: "Hersh",
  review: "Asel Selection",
};
export const seedBrands: Brand[] = Object.entries(houses).map(([id, name]) => ({
  id,
  slug: id,
  name,
  description: "Discover the collection at Asel Cosmetics.",
})).concat(suppliedBrands);
// Names transcribed from supplied photographs. Prices and stock are editable test values.
// Unknown sizes, notes and exact versions are deliberately left unconfirmed.
const entries: [string, string, string, string, number[], number, boolean?][] =
  [
    [
      "nude-coral-diamond",
      "Nude Coral Diamond",
      "نود كورال دايموند",
      "ibrahim",
      [2, 5],
      650,
    ],
    ["balas-rose", "Balas Rose", "بالاس روز", "ibrahim", [3], 650],
    ["hersh-rouge", "Hersh Rouge", "هيرش روج", "hersh", [4], 450],
    ["libre", "Libre", "ليبر", "ysl", [26, 6, 25], 750],
    ["yara", "Yara", "يارا", "lattafa", [28, 7, 20], 500],
    [
      "gold-bottle",
      "Golden bottle — name to confirm",
      "زجاجة ذهبية — الاسم قيد التأكيد",
      "review",
      [8],
      600,
      false,
    ],
    ["black-opium", "Black Opium", "بلاك أوبيوم", "ysl", [9], 750],
    [
      "emerald-soul-diamond",
      "Emerald Soul Diamond",
      "إميرالد سول دايموند",
      "ibrahim",
      [10],
      650,
    ],
    [
      "red-bottle",
      "Red bottle — name to confirm",
      "زجاجة حمراء — الاسم قيد التأكيد",
      "review",
      [11],
      500,
      false,
    ],
    [
      "coco-mademoiselle",
      "Coco Mademoiselle",
      "كوكو مادموازيل",
      "chanel",
      [12, 14],
      750,
    ],
    ["burberry-her", "Burberry Her", "بربري هير", "burberry", [13], 700],
    ["jadore", "J’adore", "جادور", "dior", [15], 750],
    ["212-men", "212 Men NYC", "٢١٢ مين نيويورك", "herrera", [16], 650],
    ["aventus", "Aventus", "أفينتوس", "creed", [21], 850],
    [
      "la-vie-est-belle",
      "La Vie Est Belle",
      "لا في إي بيل",
      "lancome",
      [22],
      700,
    ],
    ["good-girl", "Good Girl", "جود جيرل", "herrera", [23], 700],
    ["black-orchid", "Black Orchid", "بلاك أوركيد", "tomford", [27], 800],
    [
      "pink-diamond-sakura",
      "Pink Diamond Sakura",
      "بينك دايموند ساكورا",
      "ibrahim",
      [43, 29],
      650,
    ],
    ["sense", "Sense", "سينس", "laverne", [30], 550],
    [
      "musk-pomegranate",
      "Musk Pomegranate",
      "مسك الرمان",
      "ibrahim",
      [35],
      450,
    ],
    ["musk-blue", "Blue Musk", "مسك أزرق", "ibrahim", [39], 450],
    [
      "bleu-de-chanel",
      "Bleu de Chanel",
      "بلو دي شانيل",
      "chanel",
      [40, 34],
      750,
    ],
    ["eclaire", "Eclaire", "إكلير", "lattafa", [36], 600],
    ["miss-dior", "Miss Dior", "ميس ديور", "dior", [37], 700],
    ["sauvage", "Sauvage", "سوفاج", "dior", [38], 750],
    ["pink-lady", "Pink Lady", "بينك ليدي", "assaf", [41], 550],
    ["miss-sakura", "Miss Sakura", "ميس ساكورا", "assaf", [42], 550],
    ["wild-colt", "Wild Colt", "وايلد كولت", "assaf", [44], 550],
    [
      "mini-set",
      "Mini fragrance set",
      "مجموعة عطور صغيرة",
      "review",
      [45],
      900,
    ],
  ];
export const seedProducts: Product[] = entries.map<Product>(
  ([id, name, nameAr, brandId, assets, price, published = true], index) => ({
    id,
    slug: id,
    name,
    nameAr,
    brandId,
    published,
    approved: false,
    revision: 0,
    gender: [
      "212-men",
      "aventus",
      "bleu-de-chanel",
      "sauvage",
      "wild-colt",
    ].includes(id)
      ? "men"
      : [
            "libre",
            "yara",
            "coco-mademoiselle",
            "burberry-her",
            "jadore",
            "la-vie-est-belle",
            "good-girl",
            "sense",
            "eclaire",
            "miss-dior",
            "pink-lady",
            "miss-sakura",
          ].includes(id)
        ? "women"
        : "unisex",
    concentration: "Unconfirmed",
    description:
      "From the supplied Asel collection. Size and fragrance details will be confirmed before launch.",
    descriptionAr:
      "من صور مجموعة أسيل المتاحة. سيتم تأكيد الحجم وتفاصيل العطر قبل فتح البيع.",
    scentFamilies: [],
    topNotes: [],
    heartNotes: [],
    baseNotes: [],
    occasions: [],
    seasons: [],
    projection: "moderate",
    categories:
      id === "mini-set"
        ? ["gifts"]
        : ["ibrahim", "lattafa", "assaf", "laverne"].includes(brandId)
          ? ["arabic"]
          : [],
    sizes: [
      { id: "standard", label: "Size to confirm", ml: 0, price, stock: 10 },
    ],
    images: [
      ...(suppliedCovers[id] ? [{ src: suppliedCovers[id], alt: name }] : []),
      ...(cutoutProductIds.includes(id)
        ? [{ src: `/products/${id}-cutout.png`, alt: name }]
        : []),
      ...assets.map((n) => ({
        src: `/products/asset-${String(n).padStart(3, "0")}.jpeg`,
        alt: name,
      })),
    ],
    isFeatured: [
      "libre",
      "yara",
      "bleu-de-chanel",
      "pink-diamond-sakura",
      "eclaire",
      "miss-dior",
      "sauvage",
      "nude-coral-diamond",
    ].includes(id),
    isNew: index > 20,
    createdAt: "2026-09-28T00:00:00.000Z",
  }),
).concat(suppliedProducts);
