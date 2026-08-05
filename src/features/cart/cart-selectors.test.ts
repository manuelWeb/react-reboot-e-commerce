import { describe, expect, it } from 'vitest'
import type { CartState } from './cart'
import { getCartItemCount, getCartTotalInCents } from './cart-selectors'

describe('getCartItemCount', () => {
  it('returns the total number of cart items', () => {
    // Arrange
    const cartState: CartState = {
      lines: [
        {
          id: 'product-1',
          name: 'Chair',
          imageUrl: './chair.jpg',
          priceInCents: 1500,
          quantity: 2,
        },
        {
          id: 'product-5',
          name: 'Light',
          imageUrl: './light.jpg',
          priceInCents: 680,
          quantity: 3,
        },
      ],
    }
    const cartBefore = structuredClone(cartState)
    // Act
    const result = getCartItemCount(cartState)
    // Assert
    expect(cartState).toEqual(cartBefore)
    expect(result).toBe(5)
  })
})

describe('getCartTotalInCents', () => {
  it('returns the total cart value in cents', () => {
    // Arrange
    const cartState: CartState = {
      lines: [
        {
          id: 'product-1',
          name: 'Chair',
          imageUrl: './chair.jpg',
          priceInCents: 1500,
          quantity: 2,
        },
        {
          id: 'product-5',
          name: 'Light',
          imageUrl: './light.jpg',
          priceInCents: 680,
          quantity: 3,
        },
      ],
    }
    const cartBefore = structuredClone(cartState)
    // Act
    const result = getCartTotalInCents(cartState)
    // Assert
    expect(cartState).toEqual(cartBefore)
    expect(result).toBe(5040)
  })
})
