import { expect, test } from 'vitest'
import type { CartProduct } from '../cart'
import { useCart } from '../cart-context'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@/test/test-utils'
import { AddToCartButton } from './add-to-cart-button'

const product: CartProduct = {
  id: 'product-1',
  name: 'super chair',
  imageUrl: '/chair.jpg',
  priceInCents: 800,
}

function CartItemCount() {
  const { itemCount } = useCart()

  return <output aria-label="Cart items">{itemCount}</output>
}

test('adds the product to the cart when clicked', async () => {
  const user = userEvent.setup()

  render(
    <>
      <AddToCartButton product={product} />
      <CartItemCount />
    </>,
  )

  expect(screen.getByLabelText('Cart items')).toHaveTextContent('0')

  await user.click(screen.getByRole('button', { name: 'Add to cart' }))

  expect(screen.getByLabelText('Cart items')).toHaveTextContent('1')
})

test('does not add the product when disabled', async () => {
  const user = userEvent.setup()
  render(
    <>
      <AddToCartButton product={product} disabled />
      <CartItemCount />
    </>,
  )

  const button = screen.getByRole('button', { name: 'Add to cart' })
  expect(button).toBeDisabled()

  await user.click(button)
  expect(screen.getByLabelText('Cart items')).toHaveTextContent('0')
})
