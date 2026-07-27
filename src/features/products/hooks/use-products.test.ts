import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useProducts } from './use-products'
import { products } from '@/mocks/data/products'
import { server } from '@/mocks/server'
import { http, HttpResponse } from 'msw'

describe('useProducts', () => {
  it('loads and expose catalogue products', async () => {
    const { result } = renderHook(() => useProducts())

    expect(result.current.status).toBe('loading')

    await waitFor(() => {
      expect(result.current.status).toBe('success')
    })

    if (result.current.status === 'success') {
      expect(result.current.products).toEqual(products)
    }
  })

  it('expose empty state when catalogue contains no products', async () => {
    server.use(
      http.get('/api/products', () => {
        return HttpResponse.json([])
      }),
    )
    const { result } = renderHook(() => useProducts())
    expect(result.current.status).toBe('loading')
    await waitFor(() => {
      expect(result.current.status).toBe('empty')
    })
  })

  it('thrown an error when request fails', async () => {
    server.use(
      http.get('/api/products', () => {
        return new HttpResponse(null, {
          status: 503,
          statusText: 'Service Unavailable',
        })
      }),
    )
    const { result } = renderHook(() => useProducts())
    await waitFor(() => {
      expect(result.current.status).toBe('error')
    })

    if (result.current.status === 'error') {
      expect(result.current.error.message).toContain(503)
    }
  })

  it('retries request after an error', async () => {
    let attempts = 0
    server.use(
      http.get('/api/products', () => {
        attempts += 1
        if (attempts === 1) {
          return new HttpResponse(null, {
            status: 503,
            statusText: 'Service Unavailable',
          })
        }
        return HttpResponse.json(products)
      }),
    )

    const { result } = renderHook(() => useProducts())

    await waitFor(() => {
      expect(result.current.status).toBe('error')
    })

    act(() => {
      result.current.retry()
    })
    await waitFor(() => {
      expect(result.current.status).toBe('success')
    })

    expect(attempts).toBe(2)
  })
})
