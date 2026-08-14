import { describe, expect, it } from 'vitest'
import type { CartProduct, CartState } from './cart'
import { cartReducer } from './cart-reducer'

describe('cartReducer', () => {
  it('adds new product with quantity one', () => {
    // Arrange
    const initialState: CartState = {
      lines: [],
    }
    const product: CartProduct = {
      id: 'product-1',
      name: 'Dining Chair',
      imageUrl: '/chair.jpg',
      priceInCents: 1500,
    }
    // Act
    const result = cartReducer(initialState, {
      type: 'add-item',
      payload: product,
    })
    // Assert
    expect(result).toEqual({
      lines: [{ ...product, quantity: 1 }],
    })
  })

  it('increments the quantity when the product already exists', () => {
    // Arrange
    const product: CartProduct = {
      id: 'product-1',
      name: 'Dining Chair',
      imageUrl: '/chair.jpg',
      priceInCents: 1500,
    }
    const initialState: CartState = {
      lines: [
        {
          ...product,
          quantity: 1,
        },
      ],
    }
    // Act
    const result = cartReducer(initialState, {
      type: 'add-item',
      payload: product,
    })
    // Assert
    expect(result).toEqual({
      lines: [{ ...product, quantity: 2 }],
    })
  })

  it('removes selected product from the cart', () => {
    // Arrange
    const product: CartProduct = {
      id: 'product-1',
      name: 'Dining Chair',
      imageUrl: '/chair.jpg',
      priceInCents: 1500,
    }
    const initialState: CartState = {
      lines: [
        {
          ...product,
          quantity: 1,
        },
        {
          id: 'product-2',
          name: 'Design chair',
          imageUrl: '/design-chair.jpg',
          priceInCents: 2500,
          quantity: 2,
        },
      ],
    }
    // Act
    const result = cartReducer(initialState, {
      type: 'remove-item',
      payload: { id: product.id },
    })
    // Assert
    expect(result).toEqual({
      lines: [
        {
          id: 'product-2',
          name: 'Design chair',
          imageUrl: '/design-chair.jpg',
          priceInCents: 2500,
          quantity: 2,
        },
      ],
    })
  })

  it('increases the line product quantity', () => {
    // Arrange
    const product: CartProduct = {
      id: 'product-1',
      name: 'Dining Chair',
      imageUrl: '/chair.jpg',
      priceInCents: 1500,
    }
    const initialState: CartState = {
      lines: [
        { ...product, quantity: 1 },
        {
          id: 'product-6',
          name: 'The six',
          imageUrl: '/six-image.webp',
          priceInCents: 543,
          quantity: 1,
        },
      ],
    }
    // Act
    const result = cartReducer(initialState, {
      type: 'increase-quantity',
      payload: { id: product.id },
    })
    // Assert
    // Check immutable state
    expect(initialState.lines[0].quantity).toBe(1)

    expect(result).toEqual({
      lines: [
        { ...product, quantity: 2 },
        {
          id: 'product-6',
          name: 'The six',
          imageUrl: '/six-image.webp',
          priceInCents: 543,
          quantity: 1,
        },
      ],
    })
  })

  it('decreases the selected line quantity', () => {
    // Arrange
    const product: CartProduct = {
      id: 'product-1',
      name: 'Dining Chair',
      imageUrl: '/chair.jpg',
      priceInCents: 1500,
    }
    const initialState: CartState = {
      lines: [
        {
          ...product,
          quantity: 2,
        },
        {
          id: 'product-2',
          name: 'Design chair',
          imageUrl: '/design-chair.jpg',
          priceInCents: 2500,
          quantity: 2,
        },
      ],
    }
    const stateBefore = structuredClone(initialState)
    // Act
    const result = cartReducer(initialState, {
      type: 'decrease-quantity',
      payload: { id: product.id },
    })

    // Assert
    expect(initialState).toEqual(stateBefore)
    expect(result).toEqual({
      lines: [
        {
          id: 'product-1',
          name: 'Dining Chair',
          imageUrl: '/chair.jpg',
          priceInCents: 1500,
          quantity: 1,
        },
        {
          id: 'product-2',
          name: 'Design chair',
          imageUrl: '/design-chair.jpg',
          priceInCents: 2500,
          quantity: 2,
        },
      ],
    })
  })
  it('removes the cart line when decreasing a quantity of one', () => {
    // Arrange
    const product: CartProduct = {
      id: 'product-1',
      name: 'Dining Chair',
      imageUrl: '/chair.jpg',
      priceInCents: 1500,
    }
    const initialState: CartState = {
      lines: [
        {
          ...product,
          quantity: 1,
        },
        {
          id: 'product-2',
          name: 'Design chair',
          imageUrl: '/design-chair.jpg',
          priceInCents: 2500,
          quantity: 1,
        },
      ],
    }
    const stateBefore = structuredClone(initialState)
    // Act
    const result = cartReducer(initialState, {
      type: 'decrease-quantity',
      payload: { id: product.id },
    })
    // Assert
    expect(initialState).toEqual(stateBefore)
    expect(result).toEqual({
      lines: [
        {
          id: 'product-2',
          name: 'Design chair',
          imageUrl: '/design-chair.jpg',
          priceInCents: 2500,
          quantity: 1,
        },
      ],
    })
  })
})
