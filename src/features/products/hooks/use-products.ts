import { useEffect, useState } from 'react'
import { fetchProducts } from '../api/fetch-products'
import type { Product } from '../product'

type ProductsState =
  | { status: 'loading' }
  | { status: 'success'; products: Product[] }
  | { status: 'empty' }
  | { status: 'error'; error: Error }

type UseProductsResult = ProductsState & { retry: () => void }

export function useProducts(): UseProductsResult {
  const [state, setState] = useState<ProductsState>({ status: 'loading' })
  const [requestId, setRequestId] = useState(0)

  const retry = () => {
    setState({ status: 'loading' })
    setRequestId((current) => current + 1)
  }

  useEffect(() => {
    const controller = new AbortController()

    async function loadProducts() {
      try {
        const products = await fetchProducts(controller.signal)

        if (products.length === 0) {
          setState({ status: 'empty' })
          return
        }

        setState({ status: 'success', products })
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return

        setState({
          status: 'error',
          error:
            error instanceof Error
              ? error
              : new Error('useProducts: An unknown error occurred'),
        })
      }
    }
    void loadProducts()

    return () => {
      controller.abort()
    }
  }, [requestId])

  return {
    ...state,
    retry,
  }
}
