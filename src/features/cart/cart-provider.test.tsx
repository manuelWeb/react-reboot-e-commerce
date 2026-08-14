import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCart } from './cart-context'
import type { PropsWithChildren } from 'react'
import { CartProvider } from './cart-provider'
import type { CartProduct } from './cart'

function Wrapper({ children }: PropsWithChildren) {
  return <CartProvider>{children}</CartProvider>
}

describe('CartProvider', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })
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

  it('restores the stored cart as its initial state', () => {
    // Arrange
    const storedCart = {
      version: 1,
      lines: [
        {
          id: 'product-1',
          name: 'chair',
          imageUrl: './chair.jpg',
          priceInCents: 1200,
          quantity: 1,
        },
      ],
    }
    const storage = {
      getItem: vi.fn(() => JSON.stringify(storedCart)),
      setItem: vi.fn(),
    }
    function StoredCartWrapper({ children }: PropsWithChildren) {
      return <CartProvider storage={storage}>{children}</CartProvider>
    }
    // Act
    const { result } = renderHook(() => useCart(), {
      wrapper: StoredCartWrapper,
    })
    // Assert
    expect(result.current.lines).toEqual(storedCart.lines)
    expect(result.current.itemCount).toBe(1)
    expect(result.current.totalInCents).toBe(1200)
  })

  it('persists the cart after its state change', () => {
    // Arrange
    const product: CartProduct = {
      id: 'product-1',
      name: 'chair',
      imageUrl: './chair.jpg',
      priceInCents: 1200,
    }
    const storage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
    }
    function PersistentCartWrapper({ children }: PropsWithChildren) {
      return <CartProvider storage={storage}>{children}</CartProvider>
    }
    const { result } = renderHook(() => useCart(), {
      wrapper: PersistentCartWrapper,
    })
    storage.setItem.mockClear()
    // Act
    act(() => {
      result.current.addItem(product)
    })
    // Assert
    expect(storage.setItem).toHaveBeenCalledWith(
      'react-reboot-cart',
      JSON.stringify({
        version: 1,
        lines: [{ ...product, quantity: 1 }],
      }),
    )
  })
})
