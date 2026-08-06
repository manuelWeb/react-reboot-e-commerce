import { createContext, useContext } from 'react'
import type { CartLine, CartProduct } from './cart'

export type CartContextValue = {
  lines: readonly CartLine[]
  itemCount: number
  totalInCents: number
  addItem: (product: CartProduct) => void
  removeItem: (id: string) => void
  increaseQuantity: (id: string) => void
  decreaseQuantity: (id: string) => void
}

export const CartContext = createContext<CartContextValue | null>(null)

export function useCart() {
  const context = useContext(CartContext)

  if (context === null) {
    throw new Error('useCart must be used within CartProvider')
  }

  return context
}
