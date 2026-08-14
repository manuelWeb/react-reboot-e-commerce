import { MinusIcon, PlusIcon, Trash } from 'lucide-react'
import { useCart } from '../cart-context'
import { Button } from '@/components/ui/button'
import { ButtonGroup, ButtonGroupText } from '@/components/ui/button-group'
import { useId } from 'react'

const priceFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'EUR',
})

export function CartSummary() {
  const headingId = useId()
  const {
    lines,
    itemCount,
    totalInCents,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
  } = useCart()

  if (lines.length === 0)
    return (
      <section aria-labelledby={headingId}>
        <h2 id={headingId} className="text-2xl">
          My basket is empty
        </h2>
      </section>
    )

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="text-2xl">
        My basket
      </h2>

      <ul>
        {lines.map((line) => (
          <li
            key={line.id}
            className="flex flex-wrap items-center justify-between gap-2 p-2 border-b-2"
          >
            <img width="96" src={line.imageUrl} alt={line.name} />

            <div className="block flex-1">
              <h3>{line.name}</h3>
              <Button
                variant="outline"
                size="icon"
                aria-label={`Remove ${line.name} from cart`}
                onClick={() => removeItem(line.id)}
              >
                <Trash />
              </Button>
            </div>

            <p>{priceFormatter.format(line.priceInCents / 100)}</p>

            <ButtonGroup
              orientation="horizontal"
              aria-label={`${line.name} quantity controls`}
            >
              <Button
                variant="outline"
                size="icon"
                aria-label={`Decrease ${line.name} quantity`}
                onClick={() => decreaseQuantity(line.id)}
              >
                {line.quantity === 1 ? <Trash /> : <MinusIcon />}
              </Button>

              <ButtonGroupText className="w-10 justify-center">
                <output aria-live="polite" aria-label={`${line.name} quantity`}>
                  {line.quantity}
                </output>
              </ButtonGroupText>

              <Button
                variant="outline"
                size="icon"
                aria-label={`Increase ${line.name} quantity`}
                onClick={() => increaseQuantity(line.id)}
              >
                <PlusIcon />
              </Button>
            </ButtonGroup>
          </li>
        ))}
      </ul>

      <div className="flex gap-2 justify-end text-right p-2">
        <p>
          {itemCount} article{itemCount !== 1 && 's'}
          <br />
          TOTAL {priceFormatter.format(totalInCents / 100)}
        </p>
      </div>
    </section>
  )
}
