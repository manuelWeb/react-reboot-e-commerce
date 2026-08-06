import { useReducer, type ReactNode } from 'react'
import { CartContext, type CartContextValue } from './cart-context'
import { cartReducer } from './cart-reducer'
import { getCartItemCount, getCartTotalInCents } from './cart-selectors'
import type { CartState } from './cart'

const initialState: CartState = { lines: [] }

type CartProviderProps = {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  const value: CartContextValue = {
    lines: state.lines,
    itemCount: getCartItemCount(state),
    totalInCents: getCartTotalInCents(state),
    addItem: (product) => {
      dispatch({
        type: 'add-item',
        payload: product,
      })
    },
    removeItem: (id) => {
      dispatch({
        type: 'remove-item',
        payload: { id },
      })
    },
    increaseQuantity: (id) => {
      dispatch({
        type: 'increase-quantity',
        payload: { id },
      })
    },
    decreaseQuantity: (id) => {
      dispatch({
        type: 'decrease-quantity',
        payload: { id },
      })
    },
  }
  return <CartContext value={value}>{children}</CartContext>
}
