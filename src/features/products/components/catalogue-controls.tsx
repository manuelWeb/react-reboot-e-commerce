import { ChevronDown } from 'lucide-react'
import {
  ALL_CATEGORIES,
  type SortOrder,
} from '../utils/filter-and-sort-products'

type CatalogueControlsProps = {
  searchQuery: string
  selectedCategory: string
  sortOrder: SortOrder
  categories: string[]
  onSearchChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onSortChange: (value: SortOrder) => void
}

export function CatalogueControls({
  searchQuery,
  selectedCategory,
  sortOrder,
  categories,
  onSearchChange,
  onCategoryChange,
  onSortChange,
}: CatalogueControlsProps) {
  return (
    <div
      role="group"
      aria-label="Catalogue filters"
      className="grid grid-cols-1 sm:grid-cols-6 gap-4 text-left mb-8"
    >
      <div className="sm:col-span-2">
        <label htmlFor="search" className="block mb-1 font-medium">
          Search
        </label>
        <div className="grid grid-cols-1">
          <input
            type="search"
            id="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search for a product by name"
            className="col-start-1 row-start-1 w-full appearance-none rounded-md py-2 px-4 text-base outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
          />
        </div>
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="category" className="block mb-1 font-medium">
          Category
        </label>
        <div className="grid grid-cols-1">
          <select
            name="category"
            id="category"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="col-start-1 row-start-1 w-full appearance-none rounded-md py-2 px-4 text-base outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
          >
            <option value={ALL_CATEGORIES}>All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" />
        </div>
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="sort" className="block mb-1 font-medium">
          Sort by price
        </label>
        <div className="grid grid-cols-1">
          <select
            name="sort"
            id="sort"
            value={sortOrder}
            onChange={(e) => onSortChange(e.target.value as SortOrder)}
            className="col-start-1 row-start-1 w-full appearance-none rounded-md py-2 px-4 text-base outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
          >
            <option value="default">Default</option>
            <option value="price-ascending">Low to High (ASC)</option>
            <option value="price-descending">High to Low (DESC)</option>
          </select>
          <ChevronDown className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" />
        </div>
      </div>
    </div>
  )
}
