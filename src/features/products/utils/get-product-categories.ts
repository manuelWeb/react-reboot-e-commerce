import type { Product } from '../product'

export function getProductCategories(products: readonly Product[]): string[] {
  return [...new Set(products.map((product) => product.category))].sort(
    (a, b) => a.localeCompare(b),
  )
}
