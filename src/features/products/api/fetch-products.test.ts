import { describe, expect, it } from 'vitest'
import { fetchProducts } from './fetch-products'
import { products } from '@/mocks/data/products'

import { server } from '@/mocks/server'
import { http, HttpResponse } from 'msw'

describe('fetchProducts', () => {
  it('returns the product catalogue when the request succeeds', async () => {
    const res = await fetchProducts()
    expect(res).toEqual(products)
  })

  it('throws an error when the request fails', async () => {
    const status = 503
    const statusText = 'Service Unavailable'
    server.use(
      http.get('/api/products', () => {
        return new HttpResponse(null, {
          status,
          statusText,
        })
      }),
    )

    await expect(fetchProducts()).rejects.toThrow(
      `Failed to fetch products: ${status} ${statusText}`,
    )
  })
})
