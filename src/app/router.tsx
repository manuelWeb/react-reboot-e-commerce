import { createBrowserRouter, type RouteObject } from 'react-router'
import { RootLayout } from './layouts/root-layout'
import { HomePage } from '@/pages/home-page'
import { CataloguePage } from '@/features/products/pages/catalogue-page'
import { CartPage } from '@/pages/cart-page'
import { NotFoundPage } from '@/pages/not-found-page'

export const routes = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'catalogue',
        element: <CataloguePage />,
      },
      {
        path: 'cart',
        element: <CartPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
] satisfies RouteObject[]

export const router = createBrowserRouter(routes)
