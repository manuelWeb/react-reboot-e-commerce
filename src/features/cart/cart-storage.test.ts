import { describe, expect, it, vi } from 'vitest'
import { loadCartState, saveCartState } from './cart-storage'
import type { CartState } from './cart'

describe('loadCartState', () => {
  it('returns an empty cart when no cart is stored', () => {
    // Arrange
    const storage = {
      getItem: vi.fn(() => null),
    }
    // Act
    const state = loadCartState(storage)
    // Assert
    expect(storage.getItem).toHaveBeenCalledWith('react-reboot-cart')
    expect(state).toEqual({ lines: [] })
  })

  it('returns a valid CartState from localStorage', () => {
    // Arrange
    const storedCart = {
      version: 1,
      lines: [
        {
          id: 'product-1',
          name: 'Long chair',
          imageUrl: 'long-chair.jpg',
          priceInCents: 2100,
          quantity: 2,
        },
      ],
    }
    const storage = {
      getItem: vi.fn(() => JSON.stringify(storedCart)),
    }
    // Act
    const state = loadCartState(storage)
    // Assert
    expect(state).toEqual({
      lines: storedCart.lines,
    })
  })

  it('returns an empty cart when stored JSON is malformed', () => {
    // Arrange
    const storage = {
      getItem: vi.fn(() => '{invalid json'),
    }
    // Act
    const state = loadCartState(storage)
    // Assert
    expect(state).toEqual({ lines: [] })
  })

  it('returns an empty cart when the stored one has an invalid structure', () => {
    // Arrange
    const storage = {
      getItem: vi.fn(() =>
        JSON.stringify({
          version: 1,
          lines: 'not-an-array',
        }),
      ),
    }
    // Act
    const state = loadCartState(storage)
    // Assert
    expect(state).toEqual({ lines: [] })
  })

  it('returns an empty cart when the stored one has an invalid quantity', () => {
    // Arrange
    const storage = {
      getItem: vi.fn(() =>
        JSON.stringify({
          version: 1,
          lines: [
            {
              id: 'product-1',
              name: 'Long chair',
              imageUrl: 'long-chair.jpg',
              priceInCents: 2100,
              quantity: -1,
            },
          ],
        }),
      ),
    }
    // Act
    const state = loadCartState(storage)
    // Assert
    expect(state).toEqual({ lines: [] })
  })
  it('returns an empty cart when the stored version is unsupported', () => {
    // Arrange
    const storage = {
      getItem: vi.fn(() =>
        JSON.stringify({
          version: 2,
          lines: [],
        }),
      ),
    }

    // Act
    const state = loadCartState(storage)

    // Assert
    expect(state).toEqual({
      lines: [],
    })
  })
})

describe('saveCartState', () => {
  it('stores a versioned cart as JSON', () => {
    // Arrange
    const state: CartState = {
      lines: [
        {
          id: 'product-1',
          name: 'Long chair',
          imageUrl: 'long-chair.jpg',
          priceInCents: 2100,
          quantity: 2,
        },
      ],
    }
    const storage = {
      setItem: vi.fn(),
    }
    // Act
    saveCartState(storage, state)
    // Assert
    expect(storage.setItem).toHaveBeenCalledWith(
      'react-reboot-cart',
      JSON.stringify({
        version: 1,
        lines: state.lines,
      }),
    )
  })
})
