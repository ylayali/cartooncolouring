export type CreditPackage = {
  id: string
  name: string
  credits: number
  price: number // in cents
  priceDisplay: string
  savings?: number // percentage
  popular?: boolean
  description: string
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 10,
    price: 900, // $9.00
    priceDisplay: '$9',
    description: 'Perfect for trying out'
  },
  {
    id: 'value',
    name: 'Value Pack',
    credits: 25,
    price: 2000, // $20.00
    priceDisplay: '$20',
    savings: 11,
    popular: true,
    description: 'Most popular choice'
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    credits: 50,
    price: 3500, // $35.00
    priceDisplay: '$35',
    savings: 22,
    description: 'Best value for money'
  },
  {
    id: 'mega',
    name: 'Mega Pack',
    credits: 100,
    price: 6000, // $60.00
    priceDisplay: '$60',
    savings: 33,
    description: 'For power users'
  }
]

export function getPackageById(id: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find(pkg => pkg.id === id)
}

export function calculatePricePerCredit(price: number, credits: number): string {
  const perCredit = price / credits / 100
  return perCredit.toFixed(2)
}
