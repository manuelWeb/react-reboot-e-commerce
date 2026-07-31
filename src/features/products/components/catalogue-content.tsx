import { useState } from 'react'
import type { Product } from '../product'
import {
  ALL_CATEGORIES,
  filterAndSortProducts,
  type SortOrder,
} from '../utils/filter-and-sort-products'
import { getProductCategories } from '../utils/get-product-categories'
import { ProductGrid } from './product-grid'
import { CatalogueControls } from './catalogue-controls'

type CatalogueContentProps = {
  products: Product[]
}

export function CatalogueContent({ products }: CatalogueContentProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES)
  const [sortOrder, setSortOrder] = useState<SortOrder>('default')

  const categories = getProductCategories(products)

  const visibleProducts = filterAndSortProducts({
    products,
    searchQuery,
    selectedCategory,
    sortOrder,
  })

  const productLabel = visibleProducts.length === 1 ? 'product' : 'products'

  return (
    <>
      <CatalogueControls
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}

        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}

        sortOrder={sortOrder}
        onSortChange={setSortOrder}
      />

      <p role="status" className="mb-8">
        {visibleProducts.length} {productLabel}
      </p>

      {visibleProducts.length === 0 ? (
        <p>No products match your criteria.</p>
      ) : (
        <ProductGrid products={visibleProducts} />
      )}
    </>
  )
}
