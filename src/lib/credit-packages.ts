export type CreditPackage = {
  id: string
  name: string
  credits: number
  price: number // in cents
  priceDisplay: string
  type: 'trial' | 'subscription' | 'upgrade'
  interval?: 'month' | 'year'
  trialDays?: number
  description: string
  features?: string[]
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'trial',
    name: 'Get Started',
    credits: 5,
    price: 799, // $7.99
    priceDisplay: '$7.99',
    type: 'trial',
    trialDays: 15,
    description: '5 credits valid for 15 days',
    features: [
      '5 coloring page credits',
      'Valid for 15 days',
      'Automatically converts to monthly subscription',
      'Cancel anytime during trial'
    ]
  },
  {
    id: 'monthly',
    name: 'Monthly Subscription',
    credits: 10,
    price: 1499, // $14.99
    priceDisplay: '$14.99/month',
    type: 'subscription',
    interval: 'month',
    description: '10 credits every month',
    features: [
      '10 coloring page credits per month',
      'Unused credits roll over for 1 month',
      'Cancel anytime',
      'Automatic renewal'
    ]
  },
  {
    id: 'premium-annual',
    name: 'Premium Annual Package',
    credits: 120, // 10 per month equivalent
    price: 24900, // $249.00
    priceDisplay: '$249/year',
    type: 'upgrade',
    interval: 'year',
    description: '"Don\'t Worry About It" DFY package',
    features: [
      'Done-for-you coloring pages',
      'Automatically delivered with your grandchild each month',
      '120 credits per year',
      'Premium support',
      'Best value - Save over 50%'
    ]
  }
]

export function getPackageById(id: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find(pkg => pkg.id === id)
}

export function calculatePricePerCredit(price: number, credits: number): string {
  const perCredit = price / credits / 100
  return perCredit.toFixed(2)
}

export function getTrialPackage(): CreditPackage {
  return CREDIT_PACKAGES[0] // trial package
}

export function getMonthlySubscription(): CreditPackage {
  return CREDIT_PACKAGES[1] // monthly subscription
}

export function getPremiumAnnual(): CreditPackage {
  return CREDIT_PACKAGES[2] // premium annual
}
