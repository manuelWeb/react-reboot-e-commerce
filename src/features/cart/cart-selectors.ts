import type { CartState } from './cart'

export function getCartItemCount(state: CartState): number {
  return state.lines.reduce((acc, line) => acc + line.quantity, 0)
}

export function getCartTotalInCents(state: CartState): number {
  return state.lines.reduce(
    (acc, line) => acc + line.priceInCents * line.quantity,
    0,
  )
}
