import { describe, expect, it } from 'vitest'

import { products } from './data/products'

describe('products handlers', () => {
  it('returns the mocked product catalogue', async () => {
    const url = new URL('/api/products', window.location.origin)

    const res = await fetch(url)

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual(products)
  })
})
