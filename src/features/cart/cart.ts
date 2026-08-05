import type { Product } from '../products/product'

// Readonly avoid immutability
export type CartLine = Readonly<
  Pick<Product, 'id' | 'name' | 'imageUrl' | 'priceInCents'> & {
    quantity: number
  }
>

export type CartProduct = Omit<CartLine, 'quantity'>

export type CartState = {
  lines: CartLine[]
  // lines: Readonly<CartLine[]>
}
