import { CartProvider } from '@/features/cart/cart-provider'
import {
  type RenderOptions,
  render as testingLibraryRender,
} from '@testing-library/react'
import type { PropsWithChildren, ReactElement } from 'react'

const testStorage: Pick<Storage, 'getItem' | 'setItem'> = {
  getItem: () => null,
  setItem: () => undefined,
}
function TestProviders({ children }: PropsWithChildren) {
  return <CartProvider storage={testStorage}>{children}</CartProvider>
}

function render(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return testingLibraryRender(ui, { ...options, wrapper: TestProviders })
}

export * from '@testing-library/react'
export { render }
