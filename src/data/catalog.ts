// Static browsing taxonomies. Products and brands are stored in SQLite.

export const categories = [
  {
    slug: "women",
    name: "For her",
    description: "Soft florals & quiet confidence",
    tone: "rose",
  },
  {
    slug: "men",
    name: "For him",
    description: "Deep woods & fresh beginnings",
    tone: "olive",
  },
  {
    slug: "unisex",
    name: "For you",
    description: "A scent beyond convention",
    tone: "amber",
  },
  {
    slug: "niche",
    name: "Niche perfumery",
    description: "Unexpected. Unforgettable.",
    tone: "plum",
  },
  {
    slug: "arabic",
    name: "Arabic fragrances",
    description: "The warmth of a familiar ritual",
    tone: "sand",
  },
  {
    slug: "gifts",
    name: "The art of gifting",
    description: "Something beautifully personal",
    tone: "sage",
  },
] as const;

export const notes = [
  {
    slug: "oud",
    name: "Oud",
    description: "Deep, woody & evocative",
    family: "woody",
    tone: "wood",
  },
  {
    slug: "rose",
    name: "Rose",
    description: "Petal-soft & romantic",
    family: "floral",
    tone: "rose",
  },
  {
    slug: "vanilla",
    name: "Vanilla",
    description: "Warm, soft & comforting",
    family: "sweet",
    tone: "vanilla",
  },
  {
    slug: "citrus",
    name: "Citrus",
    description: "Bright, sparkling & fresh",
    family: "fresh",
    tone: "citrus",
  },
  {
    slug: "musk",
    name: "Musk",
    description: "Clean, delicate & intimate",
    family: "musky",
    tone: "musk",
  },
  {
    slug: "amber",
    name: "Amber",
    description: "Golden, rich & enveloping",
    family: "amber",
    tone: "amber",
  },
  {
    slug: "leather",
    name: "Leather",
    description: "Supple & distinctive",
    family: "leather",
    tone: "wood",
  },
  {
    slug: "bergamot",
    name: "Bergamot",
    description: "A luminous citrus opening",
    family: "fresh",
    tone: "citrus",
  },
  {
    slug: "jasmine",
    name: "Jasmine",
    description: "A luminous white floral",
    family: "floral",
    tone: "musk",
  },
  {
    slug: "sandalwood",
    name: "Sandalwood",
    description: "Creamy, soft woods",
    family: "woody",
    tone: "vanilla",
  },
];
