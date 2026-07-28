import type { Product } from '../product'

export type SortOrder = 'default' | 'price-ascending' | 'price-descending'

type FilterAndSortProductsParams = {
  products: readonly Product[]
  searchQuery: string
  selectedCategory: string
  sortOrder: SortOrder
}

export const ALL_CATEGORIES = 'all'

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase()
    .trim()

export function filterAndSortProducts({
  products,
  searchQuery,
  selectedCategory,
  sortOrder,
}: FilterAndSortProductsParams): Product[] {
  const normalizedQuery = normalize(searchQuery)
  const filteredProducts = products.filter((product) => {
    const matchesSearch = normalize(product.name).includes(normalizedQuery)
    const matchesCategory =
      selectedCategory === ALL_CATEGORIES ||
      product.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  switch (sortOrder) {
    case 'price-ascending':
      filteredProducts.sort((a, b) => a.priceInCents - b.priceInCents)
      break
    case 'price-descending':
      filteredProducts.sort((a, b) => b.priceInCents - a.priceInCents)
      break
    case 'default':
      break
  }

  return filteredProducts
}
