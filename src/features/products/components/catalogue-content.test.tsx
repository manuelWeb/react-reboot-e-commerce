import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { CatalogueContent } from './catalogue-content'
import { products } from '@/mocks/data/products'
import { ALL_CATEGORIES } from '../utils/filter-and-sort-products'

describe('CatalogueContent', () => {
  it('displays all products by default', () => {
    render(<CatalogueContent products={products} />)

    expect(screen.getByRole('status')).toHaveTextContent(
      String(products.length),
    )

    const renderedProductNames = screen
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent)

    expect(renderedProductNames).toEqual(
      products.map((product) => product.name),
    )
  })

  it('filters products when the user searches by name', async () => {
    const user = userEvent.setup()

    render(<CatalogueContent products={products} />)

    const searchInput = screen.getByRole('searchbox', {
      name: /search/i,
    })

    await user.type(searchInput, 'mascara')

    expect(searchInput).toHaveValue('mascara')
    expect(screen.getByRole('status')).toHaveTextContent('1 product')
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Essence Mascara Lash Princess',
      }),
    ).toBeInTheDocument()
  })

  it('filters products by category', async () => {
    const user = userEvent.setup()

    render(<CatalogueContent products={products} />)

    const categorySelect = screen.getByRole('combobox', {
      name: /category/i,
    })

    await user.selectOptions(categorySelect, 'furniture')

    expect(categorySelect).toHaveValue('furniture')

    expect(screen.getByRole('status')).toHaveTextContent('2')

    const renderedProductNames = screen
      .getAllByRole('heading', { level: 2 })
      .map((h2) => h2.textContent)
    expect(renderedProductNames).toEqual([
      'Annibale Colombo Bed',
      'Annibale Colombo Sofa',
    ])
  })

  it('sorts products by price', async () => {
    const user = userEvent.setup()
    render(<CatalogueContent products={products} />)

    const sortSelect = screen.getByRole('combobox', {
      name: /sort by price/i,
    })

    await user.selectOptions(sortSelect, 'price-ascending')

    const renderedProductNames = screen
      .getAllByRole('heading', { level: 2 })
      .map((h) => h.textContent)
    expect(renderedProductNames[0]).toBe('Black Aluminium Cup')

    await user.selectOptions(sortSelect, 'price-descending')
    const renderedProductNamesDesc = screen
      .getAllByRole('heading', { level: 2 })
      .map((h) => h.textContent)
    expect(renderedProductNamesDesc[0]).toBe('Annibale Colombo Sofa')
  })

  it('updates results as the user refines and clears filters', async () => {
    const user = userEvent.setup()

    render(<CatalogueContent products={products} />)

    const searchInput = screen.getByRole('searchbox', {
      name: /search/i,
    })

    const categorySelect = screen.getByRole('combobox', {
      name: /category/i,
    })

    await user.selectOptions(categorySelect, 'furniture')

    expect(screen.getByRole('status')).toHaveTextContent('2 products')

    await user.type(searchInput, 'sofa')

    expect(screen.getByRole('status')).toHaveTextContent('1 product')
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Annibale Colombo Sofa',
      }),
    ).toBeInTheDocument()

    await user.clear(searchInput)

    expect(screen.getByRole('status')).toHaveTextContent('2 products')
    expect(categorySelect).toHaveValue('furniture')

    await user.selectOptions(categorySelect, ALL_CATEGORIES)

    expect(screen.getByRole('status')).toHaveTextContent(
      `${products.length} products`,
    )

    await user.type(searchInput, 'nonexistent product')

    expect(screen.getByRole('status')).toHaveTextContent('0 products')
    expect(
      screen.getByText('No products match your criteria.'),
    ).toBeInTheDocument()

    expect(screen.queryAllByRole('heading', { level: 2 })).toHaveLength(0)

    expect(searchInput).toBeInTheDocument()
    expect(categorySelect).toBeInTheDocument()
  })
})
