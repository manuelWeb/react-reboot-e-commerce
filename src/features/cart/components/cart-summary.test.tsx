import userEvent from '@testing-library/user-event'
import { describe, expect, test } from 'vitest'
import { render, screen } from '@/test/test-utils'
import type { CartProduct } from '../cart'
import { AddToCartButton } from './add-to-cart-button'
import { CartSummary } from './cart-summary'

const product = {
  id: 'product-1',
  name: 'Super chair',
  imageUrl: '/chair.jpg',
  priceInCents: 800,
} satisfies CartProduct

describe('CartSummary', () => {
  test('displays an accessible empty cart', () => {
    render(<CartSummary />)

    expect(
      screen.getByRole('region', {
        name: 'My basket is empty',
      }),
    ).toBeInTheDocument()
  })

  test('updates and removes a cart line', async () => {
    const user = userEvent.setup()

    render(
      <>
        <AddToCartButton product={product} />
        <CartSummary />
      </>,
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Add to cart',
      }),
    )

    expect(
      screen.getByRole('region', {
        name: 'My basket',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        name: product.name,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('status', {
        name: `${product.name} quantity`,
      }),
    ).toHaveTextContent('1')

    await user.click(
      screen.getByRole('button', {
        name: `Increase ${product.name} quantity`,
      }),
    )

    expect(
      screen.getByRole('status', {
        name: `${product.name} quantity`,
      }),
    ).toHaveTextContent('2')

    await user.click(
      screen.getByRole('button', {
        name: `Decrease ${product.name} quantity`,
      }),
    )

    expect(
      screen.getByRole('status', {
        name: `${product.name} quantity`,
      }),
    ).toHaveTextContent('1')

    await user.click(
      screen.getByRole('button', {
        name: `Remove ${product.name} from cart`,
      }),
    )

    expect(
      screen.getByRole('region', {
        name: 'My basket is empty',
      }),
    ).toBeInTheDocument()
  })
})
