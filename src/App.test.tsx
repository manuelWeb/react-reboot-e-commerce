import { render, screen } from '@/test/test-utils'
import { describe, expect, it } from 'vitest'

import App from './App'

describe('App', () => {
  it('displays the product catalogue', async () => {
    render(<App />)

    expect(
      await screen.findByRole('heading', {
        name: /our catalogue/i,
      }),
    ).toBeInTheDocument()

    expect(screen.getByText(/10 products/i)).toBeInTheDocument()

    const productHeadings = await screen.findAllByRole('heading', {
      level: 2,
    })

    expect(productHeadings).toHaveLength(10)
  })
})
