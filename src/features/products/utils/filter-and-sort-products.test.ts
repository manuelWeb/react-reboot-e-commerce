import { describe, expect, it } from 'vitest'
import {
  ALL_CATEGORIES,
  filterAndSortProducts,
} from './filter-and-sort-products'
import type { Product } from '../product'

describe('filterAndSortProducts', () => {
  const products = [
    {
      id: '1',
      name: 'Crème visage',
      category: 'beauty',
      priceInCents: 3000,
      imageUrl: '/cream.jpg',
      availability: 'available',
    },
    {
      id: '2',
      name: 'Dining Chair',
      category: 'furniture',
      priceInCents: 1500,
      imageUrl: '/chair.jpg',
      availability: 'available',
    },
    {
      id: '3',
      name: 'Office Chair',
      category: 'furniture',
      priceInCents: 4500,
      imageUrl: '/office-chair.jpg',
      availability: 'unavailable',
    },
  ] satisfies Product[]

  it('returns all products in their original order by default', () => {
    const result = filterAndSortProducts({
      products,
      searchQuery: '',
      selectedCategory: ALL_CATEGORIES,
      sortOrder: 'default',
    })
    expect(result).toEqual(products)
  })

  it('matches names regardless of case, accents, and surrounding whitespace', () => {
    const result = filterAndSortProducts({
      products,
      searchQuery: '  CREME  ',
      selectedCategory: ALL_CATEGORIES,
      sortOrder: 'default',
    })

    expect(result).toEqual([products[0]])
  })

  it('sorts products by price in ascending and descending order', () => {
    const ascending = filterAndSortProducts({
      products,
      searchQuery: '',
      selectedCategory: ALL_CATEGORIES,
      sortOrder: 'price-ascending',
    })
    const descending = filterAndSortProducts({
      products,
      searchQuery: '',
      selectedCategory: ALL_CATEGORIES,
      sortOrder: 'price-descending',
    })

    expect(ascending.map((p) => p.id)).toEqual(['2', '1', '3'])
    expect(descending.map((p) => p.id)).toEqual(['3', '1', '2'])
  })

  it('returns only products from the selected category', () => {
    const result = filterAndSortProducts({
      products,
      searchQuery: '',
      selectedCategory: 'furniture',
      sortOrder: 'default',
    })
    expect(result).toEqual([products[1], products[2]])
  })

  it('combines search and category filters', () => {
    const result = filterAndSortProducts({
      products,
      searchQuery: 'chair',
      selectedCategory: 'furniture',
      sortOrder: 'default',
    })
    const noResult = filterAndSortProducts({
      products,
      searchQuery: 'chair',
      selectedCategory: 'beauty',
      sortOrder: 'default',
    })
    expect(result).toEqual([products[1], products[2]])
    expect(noResult).toEqual([])
  })

  it('returns an empty array when no product matches', () => {
    const result = filterAndSortProducts({
      products,
      searchQuery: "don't find me",
      selectedCategory: ALL_CATEGORIES,
      sortOrder: 'default',
    })

    expect(result).toEqual([])
  })

  it('preserves the original products array when sorting', () => {
    const originalOrder = products.map((p) => p.id)
    const result = filterAndSortProducts({
      products,
      searchQuery: '',
      selectedCategory: ALL_CATEGORIES,
      sortOrder: 'price-ascending',
    })
    expect(result.map((p) => p.id)).toEqual(['2', '1', '3'])
    expect(products.map((p) => p.id)).toEqual(originalOrder)
    expect(result).not.toBe(products)
  })
})
