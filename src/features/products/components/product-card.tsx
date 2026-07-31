import type { Product } from '../product'

const priceFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'EUR',
})

type ProductCardProps = { product: Product }

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="h-full rounded-sm border bg-card text-left border-gray-300">
      <img
        className="aspect-square w-full rounded-t-sm object-cover"
        src={product.imageUrl}
        alt={product.name}
        loading="lazy"
      />
      <div className="product-details p-4">
        <h2 className="text-xl font-semibold">{product.name}</h2>
        <p>{product.category}</p>
        <p>{priceFormatter.format(product.priceInCents / 100)}</p>
        <p>
          {product.availability === 'available' ? 'Available' : 'Unavailable'}
        </p>
      </div>
    </article>
  )
}
