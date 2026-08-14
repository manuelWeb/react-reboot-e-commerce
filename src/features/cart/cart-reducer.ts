import type { CartProduct, CartState } from './cart'

export type CartAction =
  | {
      type: 'add-item'
      payload: CartProduct
    }
  | {
      type: 'remove-item'
      payload: {
        id: string
      }
    }
  | {
      type: 'increase-quantity'
      payload: {
        id: string
      }
    }
  | {
      type: 'decrease-quantity'
      payload: {
        id: string
      }
    }

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add-item': {
      const existingProductLine = state.lines.find(
        (product) => product.id === action.payload.id,
      )
      if (existingProductLine) {
        return {
          ...state,
          lines: state.lines.map((line) =>
            line.id === action.payload.id
              ? { ...line, quantity: line.quantity + 1 }
              : line,
          ),
        }
      }
      return {
        ...state,
        lines: [
          ...state.lines,
          {
            ...action.payload,
            quantity: 1,
          },
        ],
      }
    }
    case 'remove-item': {
      return {
        ...state,
        lines: state.lines.filter((line) => line.id !== action.payload.id),
      }
    }
    case 'increase-quantity': {
      return {
        ...state,
        lines: state.lines.map((line) => {
          if (line.id === action.payload.id) {
            return {
              ...line,
              quantity: line.quantity + 1,
            }
          }
          return line
        }),
      }
    }

    case 'decrease-quantity': {
      return {
        ...state,
        lines: state.lines.flatMap((line) => {
          if (line.id !== action.payload.id) {
            return [line]
          }

          if (line.quantity === 1) {
            return []
          }

          return [
            {
              ...line,
              quantity: line.quantity - 1,
            },
          ]
        }),
      }
    }
  }
}
