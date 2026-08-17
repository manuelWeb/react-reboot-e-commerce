import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { CartProvider } from './features/cart/cart-provider.tsx'
import { RouterProvider } from 'react-router'
import { router } from './app/router.tsx'

async function enableMocking() {
  const shouldEnableMocking =
    import.meta.env.DEV || import.meta.env.VITE_ENABLE_MOCKS === 'true'
  if (!shouldEnableMocking) {
    return
  }
  const { worker } = await import('./mocks/browser')

  return worker.start({
    onUnhandledRequest: 'bypass',
  })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </StrictMode>,
  )
})
