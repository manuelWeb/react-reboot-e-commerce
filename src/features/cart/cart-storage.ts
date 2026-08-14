import type { CartLine, CartState } from './cart'

const CART_STORAGE_KEY = 'react-reboot-cart'

type StoredCart = {
  version: 1
  lines: readonly CartLine[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return true
  }
  return false
}

function isCartLine(value: unknown): value is CartLine {
  if (!isRecord(value)) return false

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.imageUrl === 'string' &&
    typeof value.quantity === 'number' &&
    Number.isInteger(value.quantity) &&
    value.quantity > 0 &&
    typeof value.priceInCents === 'number' &&
    Number.isInteger(value.priceInCents) &&
    value.priceInCents >= 0
  )
}

function isStoredCart(value: unknown): value is StoredCart {
  return (
    isRecord(value) &&
    value.version === 1 &&
    Array.isArray(value.lines) &&
    value.lines.every(isCartLine)
  )
}

export function saveCartState(
  storage: Pick<Storage, 'setItem'>,
  state: CartState,
): void {
  const storedCart: StoredCart = {
    version: 1,
    lines: state.lines,
  }
  const serializedCart = JSON.stringify(storedCart)

  storage.setItem(CART_STORAGE_KEY, serializedCart)
}

export function loadCartState(storage: Pick<Storage, 'getItem'>): CartState {
  const serializedCart = storage.getItem(CART_STORAGE_KEY)

  if (serializedCart === null) {
    return {
      lines: [],
    }
  }

  let parsedCart: unknown
  try {
    parsedCart = JSON.parse(serializedCart)
  } catch {
    return { lines: [] }
  }

  if (!isStoredCart(parsedCart)) {
    return {
      lines: [],
    }
  }

  return { lines: parsedCart.lines }
}
