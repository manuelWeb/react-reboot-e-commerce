export type Product = {
  id: string
  name: string
  category: string
  imageUrl: string
  priceInCents: number
  availability: 'available' | 'unavailable'
}
