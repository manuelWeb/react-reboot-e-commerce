import { CatalogueContent } from '../components/catalogue-content'
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
          <h1 className="sm:text-6xl text-4xl font-extralight mb-8">
            Our catalogue
          </h1>
          <CatalogueContent products={productState.products} />
        </section>
      )
  }
}
