import { useCart } from '../cart-context'
import type { CartProduct } from '../cart'
import { Button } from '@/components/ui/button'
import type { ComponentProps } from 'react'

type AddToCartButtonProps = {
  product: CartProduct
} & Omit<ComponentProps<typeof Button>, 'onClick'>

export function AddToCartButton({
  product,
  children = 'Add to cart',
  ...buttonProps
}: AddToCartButtonProps) {
  const { addItem } = useCart()

  return (
    <Button {...buttonProps} onClick={() => addItem(product)}>
      {children}
    </Button>
  )
}
