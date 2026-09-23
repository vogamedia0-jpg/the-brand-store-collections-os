import type { Gender } from '@/lib/brand';

/** Client-side shapes for the catalogue API, plus demo fallbacks used when the API is unreachable. */

export type ProductImageRecord = {
  id: string;
  imagePath: string;
  isPrimary: boolean;
  sortOrder: number;
};

export type Product = {
  id: string;
  collectionId: string;
  gender: Gender;
  category: string;
  brand?: string | null;
  aiGender?: string | null;
  aiCategory?: string | null;
  aiBrand?: string | null;
  aiConfidence?: number | null;
  reviewed: boolean;
  isActive: boolean;
  isPublished: boolean;
  sortOrder: number;
  images: ProductImageRecord[];
};

export type Collection = {
  id: string;
  name: string;
  slug: string;
  startDate?: string | null;
  endDate?: string | null;
  isPublished: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export const fallbackCollection: Collection = {
  id: 'collection-week-36',
  name: 'Autumn / Winter 2026',
  slug: 'autumn-winter-2026',
  startDate: '2026-08-15',
  endDate: '2026-12-20',
  isPublished: true,
  publishedAt: '2026-08-14T10:00:00Z',
  createdAt: '2026-08-01T10:00:00Z',
  updatedAt: '2026-08-14T10:00:00Z',
};

/**
 * Demo records carry no photography — every image slot is intentionally empty
 * until real catalogue photography is uploaded through the admin portal.
 */
export const fallbackProducts: Product[] = [
  {
    id: 'look-01',
    collectionId: fallbackCollection.id,
    gender: 'women',
    category: 'women-bags',
    brand: 'Bottega Veneta',
    aiGender: 'women',
    aiCategory: 'women-bags',
    aiBrand: 'Bottega Veneta',
    aiConfidence: 0.98,
    reviewed: true,
    isActive: true,
    isPublished: true,
    sortOrder: 1,
    images: [],
  },
  {
    id: 'look-02',
    collectionId: fallbackCollection.id,
    gender: 'women',
    category: 'women-coats-jackets',
    brand: 'The Row',
    aiGender: 'women',
    aiCategory: 'women-coats-jackets',
    aiBrand: 'The Row',
    aiConfidence: 0.95,
    reviewed: true,
    isActive: true,
    isPublished: true,
    sortOrder: 2,
    images: [],
  },
  {
    id: 'look-03',
    collectionId: fallbackCollection.id,
    gender: 'men',
    category: 'men-watches',
    brand: 'Cartier',
    aiGender: 'men',
    aiCategory: 'men-watches',
    aiBrand: 'Cartier',
    aiConfidence: 0.92,
    reviewed: true,
    isActive: true,
    isPublished: true,
    sortOrder: 3,
    images: [],
  },
  {
    id: 'look-04',
    collectionId: fallbackCollection.id,
    gender: 'women',
    category: 'women-shoes',
    brand: 'Manolo Blahnik',
    aiGender: 'women',
    aiCategory: 'women-shoes',
    aiBrand: 'Manolo Blahnik',
    aiConfidence: 0.88,
    reviewed: false,
    isActive: true,
    isPublished: false,
    sortOrder: 4,
    images: [],
  },
  {
    id: 'look-05',
    collectionId: fallbackCollection.id,
    gender: 'unknown',
    category: 'luxury-accessories',
    brand: null,
    aiGender: 'unknown',
    aiCategory: 'luxury-accessories',
    aiBrand: null,
    aiConfidence: 0.61,
    reviewed: false,
    isActive: true,
    isPublished: false,
    sortOrder: 5,
    images: [],
  },
  {
    id: 'look-06',
    collectionId: fallbackCollection.id,
    gender: 'men',
    category: 'men-knitwear',
    brand: 'Loro Piana',
    aiGender: 'men',
    aiCategory: 'men-knitwear',
    aiBrand: 'Loro Piana',
    aiConfidence: 0.97,
    reviewed: true,
    isActive: true,
    isPublished: true,
    sortOrder: 6,
    images: [],
  },
];

export const collectionOptions = (collections?: Collection[] | null): Collection[] =>
  collections?.length ? collections : [fallbackCollection];
