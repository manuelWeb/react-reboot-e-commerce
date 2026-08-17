import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, test } from 'vitest'
import { routes } from './router'
import { render, screen } from '@/test/test-utils'

describe('application routing', () => {
  test('renders the home page at the root URL', () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ['/'],
    })

    render(<RouterProvider router={router} />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'React Reboot E-commerce',
      }),
    ).toBeInTheDocument()
  })

  test('renders the catalogue page at the /catalogue URL', async () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ['/catalogue'],
    })

    render(<RouterProvider router={router} />)

    const heading = await screen.findByRole('heading', {
      level: 1,
      name: 'Our catalogue',
    })
    expect(heading).toBeInTheDocument()
  })

  test('renders the cart page at the /cart URL', async () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ['/cart'],
    })

    render(<RouterProvider router={router} />)

    const heading = await screen.findByRole('heading', {
      level: 1,
      name: 'Your cart',
    })
    expect(heading).toBeInTheDocument()
  })

  test('renders the 404 page at the /unknown URL', async () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ['/unknown'],
    })

    render(<RouterProvider router={router} />)

    const heading = await screen.findByRole('heading', {
      level: 1,
      name: 'Page not found',
    })
    expect(heading).toBeInTheDocument()
  })
})
