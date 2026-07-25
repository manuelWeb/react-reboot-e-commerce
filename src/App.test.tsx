import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import App from './App'

describe('App', () => {
  it('increments the counter when the user clicks the button', async () => {
    const user = userEvent.setup()

    render(<App />)

    const counter = screen.getByRole('button', { name: /count is 0/i })

    await user.click(counter)

    expect(counter).toHaveAccessibleName(/count is 1/i)
  })
})
