import { useEffect, useReducer, type ReactNode } from 'react'
import { CartContext, type CartContextValue } from './cart-context'
import { cartReducer } from './cart-reducer'
import { getCartItemCount, getCartTotalInCents } from './cart-selectors'
import { loadCartState, saveCartState } from './cart-storage'

type CartProviderProps = {
  children: ReactNode
  storage?: Pick<Storage, 'getItem' | 'setItem'>
}

export function CartProvider({
  children,
  storage = window.localStorage,
}: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, storage, loadCartState)

  useEffect(() => {
    saveCartState(storage, state)
  }, [storage, state])

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
