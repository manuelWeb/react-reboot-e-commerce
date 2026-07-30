import { describe, expect, it } from 'vitest'
import { getProductCategories } from './get-product-categories'
import type { Product } from '../product'

describe('getProductCategories', () => {
  it('returns an empty array for an empty catalogue', () => {
    expect(getProductCategories([])).toEqual([])
  })

  it('returns unique categories in alphabetical order', () => {
    const products: Product[] = [
      {
        id: '1',
        name: 'lip stick',
        category: 'beauty',
        availability: 'available',
        imageUrl: 'https://url-image',
        priceInCents: 854,
      },
      {
        id: '2',
        name: 'chair',
        category: 'furniture',
        availability: 'available',
        imageUrl: 'https://url-image',
        priceInCents: 123,
      },
      {
        id: '3',
        name: 'chair cushion',
        category: 'accessories',
        availability: 'available',
        imageUrl: 'https://url-image',
        priceInCents: 543,
      },
    ]
    const result = getProductCategories(products)
    expect(result).toEqual(['accessories', 'beauty', 'furniture'])
  })
})
