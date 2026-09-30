import type { Brand, Product } from "../types/catalog.ts";

// Transcribed from owner-supplied JPGs. These photographs have opaque backgrounds.
export const suppliedBrands: Brand[] = Object.entries({
  victoriassecret: "Victoria's Secret", versace: "Versace", armani: "Armani",
  givenchy: "Givenchy", narciso: "Narciso Rodriguez", kayali: "Kayali", rabanne: "Rabanne",
}).map(([id, name]) => ({ id, slug: id, name, description: "Discover the collection at Asel Cosmetics." }));

export const suppliedCovers: Record<string, string> = {
  "bleu-de-chanel": "/products/supplied-cc4f87ed-f92e-4d68-a9fc-62f238a523f5.jpg",
};

type Entry = [string, string, string, string, string, number, boolean?];
const entries: Entry[] = [
  ["tease", "Tease", "تيز", "victoriassecret", "0a170722-534e-40d5-89e3-72fe0c58fb60", 650],
  ["scandal-purple", "Scandal — purple bottle, version to confirm", "سكاندال البنفسجي — الإصدار قيد التأكيد", "review", "198da9af-1bc0-40c3-b472-19c96f9dfa70", 700, false],
  ["bahila", "Bahila — brand to confirm", "باهلة — الماركة قيد التأكيد", "review", "1a740e13-078c-4f32-8655-c5d6f1994788", 550, false],
  ["crystal-noir", "Crystal Noir", "كريستال نوار", "versace", "4e99bcde-5819-4fe5-a92c-39987375b6fe", 700],
  ["si-passione", "Si Passione", "سي باشون", "armani", "5c63ad2b-4d44-4618-8e14-c1e0d71518bb", 700],
  ["212-sexy", "212 Sexy", "٢١٢ سيكسي", "herrera", "839da37d-a904-42ed-bc04-90d8be0774d6", 650],
  ["si-gold-bottle", "Si — gold bottle, version to confirm", "سي الزجاجة الذهبية — الإصدار قيد التأكيد", "armani", "8c8b69b6-3d6a-476f-a2c7-26c49e6a663a", 700, false],
  ["stronger-with-you-absolutely", "Stronger With You Absolutely", "سترونجر ويذ يو أبسولوتلي", "armani", "8f239a3f-c121-44bb-96f3-17e8721ec21c", 750],
  ["ange-ou-demon-le-secret", "Ange ou Demon Le Secret", "أنج أو ديمون لو سيكريت", "givenchy", "92483bf7-d128-4451-95d3-9a1390e531aa", 700],
  ["si", "Si", "سي", "armani", "a5182933-ecfd-4ad3-a179-4f8a2b77ddc9", 700],
  ["narciso-pink", "Narciso — pink bottle, version to confirm", "نارسيسو الوردي — الإصدار قيد التأكيد", "narciso", "bd0fc7d5-c50b-4309-a504-5b451b08ef88", 700, false],
  ["kayali-vanilla-oud-36", "Oudgasm Vanilla Oud 36", "عودغاسم فانيلا عود ٣٦", "kayali", "cb2a62f0-099f-457c-adf8-9cd3ded3acbd", 800],
  ["musc-noir-for-her", "Musc Noir For Her", "مسك نوار فور هير", "narciso", "cc44fd27-8699-4450-be47-13b6a3368446", 700],
  ["one-million", "1 Million", "وان مليون", "rabanne", "d6b8f2a4-4e51-48c7-b7e1-f559ca1a3e97", 750],
  ["bahila-burgundy", "Bahila — burgundy bottle, name to confirm", "باهلة العنابي — الاسم قيد التأكيد", "review", "e4506b0f-5385-4cd0-a0f6-fe6c754420eb", 550, false],
  ["ange-ou-demon", "Ange ou Demon", "أنج أو ديمون", "givenchy", "e8f86a44-cfc1-4843-86bb-4afb4a5557e7", 700],
  ["tease-candy-noir", "Tease Candy Noir", "تيز كاندي نوار", "victoriassecret", "f7cdfcd0-e53f-4be3-b47b-2de798083974", 650],
  ["stronger-with-you-sandalwood", "Stronger With You Sandalwood", "سترونجر ويذ يو ساندلوود", "armani", "f82b0462-6d01-46aa-ba4c-02cc27c95d90", 750],
  ["narciso-white", "Narciso — white bottle, version to confirm", "نارسيسو الأبيض — الإصدار قيد التأكيد", "narciso", "ff8e759b-070f-4db6-8f08-454d94ae3223", 700, false],
];

export const suppliedProducts: Product[] = entries.map(([id, name, nameAr, brandId, photo, price, published = true]) => ({
  id, slug: id, name, nameAr, brandId, published, approved: false, revision: 0,
  gender: ["one-million", "stronger-with-you-absolutely", "stronger-with-you-sandalwood"].includes(id) ? "men" : ["kayali-vanilla-oud-36", "bahila", "bahila-burgundy"].includes(id) ? "unisex" : "women",
  concentration: "Unconfirmed",
  description: "From the supplied Asel collection. Size and fragrance details will be confirmed before launch.",
  descriptionAr: "من صور مجموعة أسيل المتاحة. سيتم تأكيد الحجم وتفاصيل العطر قبل فتح البيع.",
  scentFamilies: [], topNotes: [], heartNotes: [], baseNotes: [], occasions: [], seasons: [],
  projection: "moderate", categories: [],
  sizes: [{ id: "standard", label: "Size to confirm", ml: 0, price, stock: 10 }],
  images: [{ src: `/products/supplied-${photo}.jpg`, alt: name }],
  isNew: true, createdAt: "2026-09-30T00:00:00.000Z",
}));
