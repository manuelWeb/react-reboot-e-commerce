import type { Product } from '../products/product'

export type CartLine = Readonly<
  Pick<Product, 'id' | 'name' | 'imageUrl' | 'priceInCents'> & {
    quantity: number
  }
>

export type CartProduct = Omit<CartLine, 'quantity'>

export type CartState = Readonly<{
  lines: readonly CartLine[]
}>
