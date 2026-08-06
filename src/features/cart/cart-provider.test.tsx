import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useCart } from './cart-context'
import type { PropsWithChildren } from 'react'
import { CartProvider } from './cart-provider'
import type { CartProduct } from './cart'

function Wrapper({ children }: PropsWithChildren) {
  return <CartProvider>{children}</CartProvider>
}

describe('CartProvider', () => {
  it('throws when useCart is used outside CartProvider', () => {
    expect(() => {
      renderHook(() => useCart())
    }).toThrow('useCart must be used within CartProvider')
  })

  it('exposes an empty cart as its initial value', () => {
    // Arrange
    const { result } = renderHook(() => useCart(), { wrapper: Wrapper })
    // Assert
    expect(result.current.lines).toEqual([])
    expect(result.current.itemCount).toBe(0)
    expect(result.current.totalInCents).toBe(0)
  })

  it('updates the cart when a product is added', () => {
    // Arrange
    const product: CartProduct = {
      id: 'product-1',
      name: 'Long chair',
      imageUrl: 'long-chair.jpg',
      priceInCents: 2100,
    }
    const { result } = renderHook(() => useCart(), { wrapper: Wrapper })
    // Act
    act(() => {
      result.current.addItem(product)
    })
    // Assert
    expect(result.current.lines).toEqual([
      {
        ...product,
        quantity: 1,
      },
    ])
    expect(result.current.itemCount).toBe(1)
    expect(result.current.totalInCents).toBe(2100)
  })

  it('exposes actions to update and remove a cart line', () => {
    // Arrange
    const product: CartProduct = {
      id: 'product-1',
      name: 'Long chair',
      imageUrl: 'long-chair.jpg',
      priceInCents: 2100,
    }
    const { result } = renderHook(() => useCart(), { wrapper: Wrapper })
    // Act add and increase
    act(() => {
      result.current.addItem(product)
    })
    act(() => {
      result.current.increaseQuantity(product.id)
    })
    // Assert
    expect(result.current.lines[0].quantity).toBe(2)
    expect(result.current.totalInCents).toBe(4200)
    // Act
    act(() => {
      result.current.decreaseQuantity(product.id)
    })
    // Assert
    expect(result.current.itemCount).toBe(1)
    // Act
    act(() => {
      result.current.removeItem(product.id)
    })
    // Assert
    expect(result.current.lines).toEqual([])
    expect(result.current.itemCount).toBe(0)
    expect(result.current.totalInCents).toBe(0)
  })
})
