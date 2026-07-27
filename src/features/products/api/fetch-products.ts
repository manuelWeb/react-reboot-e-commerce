import type { Product } from '../product'

const PRODUCT_ENDPOINT = '/api/products'

export async function fetchProducts(signal?: AbortSignal): Promise<Product[]> {
  const res = await fetch(PRODUCT_ENDPOINT, { signal })

  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`)
  }

  const data: unknown = await res.json()

  return data as Product[]
}
