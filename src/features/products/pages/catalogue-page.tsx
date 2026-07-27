import { ProductGrid } from '../components/product-grid'
import { useProducts } from '../hooks/use-products'

export function CataloguePage() {
  const productState = useProducts()

  switch (productState.status) {
    case 'loading':
      return <p>Loading the catalogue...</p>

    case 'empty':
      return <p>No products are available.</p>

    case 'error':
      return (
        <section>
          <p>Unable to load the catalogue.</p>
          <button
            type="button"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
            onClick={productState.retry}
          >
            Retry
          </button>
        </section>
      )

    case 'success':
      return (
        <section>
          <h1>Our catalogue</h1>
          <p className="mb-4">{productState.products.length} products</p>
          <ProductGrid products={productState.products} />
        </section>
      )
  }
}
