import type { Product } from '@/features/products/product'

export const products = [
  {
    id: '1',
    name: 'Essence Mascara Lash Princess',
    category: 'beauty',
    imageUrl:
      'https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp',
    priceInCents: 999,
    availability: 'available',
  },
  {
    id: '2',
    name: 'Eyeshadow Palette with Mirror',
    category: 'beauty',
    imageUrl:
      'https://cdn.dummyjson.com/product-images/beauty/eyeshadow-palette-with-mirror/thumbnail.webp',
    priceInCents: 1999,
    availability: 'available',
  },
  {
    id: '3',
    name: 'Powder Canister',
    category: 'beauty',
    imageUrl:
      'https://cdn.dummyjson.com/product-images/beauty/powder-canister/thumbnail.webp',
    priceInCents: 1499,
    availability: 'available',
  },
  {
    id: '4',
    name: 'Red Lipstick',
    category: 'beauty',
    imageUrl:
      'https://cdn.dummyjson.com/product-images/beauty/red-lipstick/thumbnail.webp',
    priceInCents: 1299,
    availability: 'available',
  },
  {
    id: '5',
    name: 'Red Nail Polish',
    category: 'beauty',
    imageUrl:
      'https://cdn.dummyjson.com/product-images/beauty/red-nail-polish/thumbnail.webp',
    priceInCents: 899,
    availability: 'unavailable',
  },
  {
    id: '6',
    name: 'Calvin Klein CK One',
    category: 'fragrances',
    imageUrl:
      'https://cdn.dummyjson.com/product-images/fragrances/calvin-klein-ck-one/thumbnail.webp',
    priceInCents: 4999,
    availability: 'available',
  },
  {
    id: '11',
    name: 'Annibale Colombo Bed',
    category: 'furniture',
    imageUrl:
      'https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-bed/thumbnail.webp',
    priceInCents: 189999,
    availability: 'available',
  },
  {
    id: '12',
    name: 'Annibale Colombo Sofa',
    category: 'furniture',
    imageUrl:
      'https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-sofa/thumbnail.webp',
    priceInCents: 249999,
    availability: 'unavailable',
  },
  {
    id: '48',
    name: 'Bamboo Spatula',
    category: 'kitchen-accessories',
    imageUrl:
      'https://cdn.dummyjson.com/product-images/kitchen-accessories/bamboo-spatula/thumbnail.webp',
    priceInCents: 799,
    availability: 'available',
  },
  {
    id: '49',
    name: 'Black Aluminium Cup',
    category: 'kitchen-accessories',
    imageUrl:
      'https://cdn.dummyjson.com/product-images/kitchen-accessories/black-aluminium-cup/thumbnail.webp',
    priceInCents: 599,
    availability: 'unavailable',
  },
] satisfies Product[]

// Product data adapted from https://dummyjson.com/products
