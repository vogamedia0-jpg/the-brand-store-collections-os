/**
 * THE BRAND STORE — brand identity and catalogue taxonomy.
 * Single source of truth for naming, imagery and the data-driven
 * category / brand datasets used by filters, creation, editing and search.
 */

export const BRAND = {
  name: 'THE BRAND STORE',
  tagline: 'LUXURY LIVES HERE',
  shortName: 'THE BRAND STORE',
  positioning: 'A curated world of luxury',
  /** Approved hero visual — gold monogram on black. */
  heroImage: '/assets/brand-hero-monogram.png',
  /** Wordmark lockup on black (white type) — used on dark surfaces. */
  lockupLight: '/assets/brand-lockup-light.png',
  /** Wordmark lockup on black (navy type). */
  lockupNavy: '/assets/brand-lockup-navy.png',
  /** Monogram mark on black. */
  mark: '/assets/brand-mark-navy.png',
} as const;

export type Gender = 'men' | 'women' | 'unknown';

export const GENDER_LABELS: Record<Gender, string> = {
  men: 'Men',
  women: 'Women',
  unknown: 'Unsorted',
};

export type TaxonomyGroup = {
  id: string;
  label: string;
  categories: { slug: string; label: string }[];
};

/**
 * Luxury multi-brand taxonomy. Slugs are unique across every group so a
 * category is never duplicated in filters, creation or collection management.
 */
export const CATEGORY_TAXONOMY: TaxonomyGroup[] = [
  {
    id: 'women',
    label: 'Women',
    categories: [
      { slug: 'women-clothing', label: 'Clothing' },
      { slug: 'women-dresses', label: 'Dresses' },
      { slug: 'women-coats-jackets', label: 'Coats & Jackets' },
      { slug: 'women-knitwear', label: 'Knitwear' },
      { slug: 'women-tops', label: 'Tops' },
      { slug: 'women-trousers', label: 'Trousers' },
      { slug: 'women-skirts', label: 'Skirts' },
      { slug: 'women-bags', label: 'Bags' },
      { slug: 'women-shoes', label: 'Shoes' },
      { slug: 'women-accessories', label: 'Accessories' },
      { slug: 'women-jewellery', label: 'Jewellery' },
      { slug: 'women-watches', label: 'Watches' },
    ],
  },
  {
    id: 'men',
    label: 'Men',
    categories: [
      { slug: 'men-clothing', label: 'Clothing' },
      { slug: 'men-suits', label: 'Suits' },
      { slug: 'men-jackets', label: 'Jackets' },
      { slug: 'men-shirts', label: 'Shirts' },
      { slug: 'men-knitwear', label: 'Knitwear' },
      { slug: 'men-trousers', label: 'Trousers' },
      { slug: 'men-coats', label: 'Coats' },
      { slug: 'men-shoes', label: 'Shoes' },
      { slug: 'men-bags', label: 'Bags' },
      { slug: 'men-accessories', label: 'Accessories' },
      { slug: 'men-watches', label: 'Watches' },
    ],
  },
  {
    id: 'luxury',
    label: 'Luxury',
    categories: [
      { slug: 'luxury-handbags', label: 'Handbags' },
      { slug: 'luxury-fine-jewellery', label: 'Fine Jewellery' },
      { slug: 'luxury-watches', label: 'Watches' },
      { slug: 'luxury-footwear', label: 'Footwear' },
      { slug: 'luxury-leather-goods', label: 'Leather Goods' },
      { slug: 'luxury-accessories', label: 'Accessories' },
      { slug: 'luxury-travel', label: 'Travel' },
      { slug: 'luxury-gifts', label: 'Gifts' },
    ],
  },
];

export const ALL_CATEGORIES = CATEGORY_TAXONOMY.flatMap((group) => group.categories);

const CATEGORY_BY_SLUG = new Map(ALL_CATEGORIES.map((category) => [category.slug, category]));

export const categoryLabel = (slug?: string | null): string => {
  if (!slug) return 'Uncategorised';
  const known = CATEGORY_BY_SLUG.get(slug);
  if (known) return known.label;
  return slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
};

export const categoryGroup = (slug?: string | null): string | null => {
  if (!slug) return null;
  const group = CATEGORY_TAXONOMY.find((entry) => entry.categories.some((category) => category.slug === slug));
  return group?.label ?? null;
};

/** The house list available for filtering, creation and collections. */
export const BRANDS: string[] = [
  'Alaïa',
  'Alexander McQueen',
  'Audemars Piguet',
  'Balenciaga',
  'Bottega Veneta',
  'Brunello Cucinelli',
  'Bulgari',
  'Burberry',
  'Cartier',
  'Celine',
  'Chanel',
  'Chloé',
  'Dior',
  'Dolce & Gabbana',
  'Fendi',
  'Giorgio Armani',
  'Givenchy',
  'Gucci',
  'Hermès',
  'Jacquemus',
  'Loewe',
  'Loro Piana',
  'Louis Vuitton',
  'Maison Margiela',
  'Moncler',
  'Omega',
  'Patek Philippe',
  'Prada',
  'Rolex',
  'Saint Laurent',
  'The Row',
  'Tiffany & Co.',
  'Tom Ford',
  'Vacheron Constantin',
  'Valentino',
  'Van Cleef & Arpels',
  'Versace',
].sort((a, b) => a.localeCompare(b));

/** House names present in the catalogue, merged with the reference list. */
export const brandOptions = (extra: (string | null | undefined)[] = []): string[] => {
  const merged = new Set<string>(BRANDS);
  extra.forEach((name) => {
    if (name && name.trim()) merged.add(name.trim());
  });
  return [...merged].sort((a, b) => a.localeCompare(b));
};

export const formatDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
    : 'Not set';
