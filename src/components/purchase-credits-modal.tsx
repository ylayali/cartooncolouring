'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Coins, Check, Crown, Clock } from 'lucide-react'
import { CREDIT_PACKAGES, type CreditPackage } from '@/lib/credit-packages'

interface PurchaseCreditsModalProps {
  isOpen: boolean
  onCloseAction: () => void
  userId: string
}

export function PurchaseCreditsModal({ isOpen, onCloseAction, userId }: PurchaseCreditsModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePurchase = async (pkg: CreditPackage) => {
    setIsProcessing(true)
    setError(null)
    setSelectedPackage(pkg)

    try {
      console.log('Starting purchase for package:', pkg.id)
      console.log('User ID:', userId)
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          packageId: pkg.id,
        }),
      })

      console.log('Checkout API response status:', response.status)
      
      const data = await response.json()
      console.log('Checkout API response data:', data)

      if (!response.ok) {
        const errorMsg = data.error || `Server error: ${response.status}`
        console.error('Checkout API error:', errorMsg)
        throw new Error(errorMsg)
      }

      if (data.url) {
        console.log('Redirecting to Stripe checkout:', data.url)
        // Redirect to Stripe checkout
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received from server')
      }
    } catch (err) {
      console.error('Purchase error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to start checkout. Please try again.'
      setError(`Error: ${errorMessage}`)
      setIsProcessing(false)
      setSelectedPackage(null)
    }
  }

  const getPackageIcon = (type: string) => {
    switch (type) {
      case 'trial':
        return <Clock className="w-6 h-6 text-blue-400" />
      case 'subscription':
        return <Coins className="w-6 h-6 text-amber-400" />
      case 'upgrade':
        return <Crown className="w-6 h-6 text-purple-400" />
      default:
        return <Coins className="w-6 h-6 text-amber-400" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onCloseAction}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border-gray-700">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Coins className="w-8 h-8 text-amber-400" />
            Choose Your Credit Package
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-center text-lg mt-2">
            Select the perfect plan for your coloring page needs
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-4 rounded-lg bg-red-900/30 border-2 border-red-500 text-red-200 text-center font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {CREDIT_PACKAGES.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative p-8 cursor-pointer transition-all hover:scale-105 ${
                pkg.type === 'subscription'
                  ? 'bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-2 border-blue-400 shadow-2xl shadow-blue-500/20'
                  : pkg.type === 'upgrade'
                  ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-2 border-purple-400 shadow-xl shadow-purple-500/20'
                  : 'bg-gray-800/70 border-2 border-gray-600 hover:border-gray-500 shadow-lg'
              } ${selectedPackage?.id === pkg.id ? 'ring-4 ring-amber-400 scale-105' : ''}`}
              onClick={() => !isProcessing && handlePurchase(pkg)}
            >
              {pkg.type === 'subscription' && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold shadow-lg">
                    ⭐ RECOMMENDED
                  </span>
                </div>
              )}

              {pkg.type === 'upgrade' && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold shadow-lg">
                    <Crown className="w-4 h-4" />
                    BEST VALUE
                  </span>
                </div>
              )}

              <div className="text-center space-y-5 pt-2">
                <div className="flex justify-center mb-3">
                  <div className="p-3 rounded-full bg-gray-900/50">
                    {getPackageIcon(pkg.type)}
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white tracking-tight">{pkg.name}</h3>
                
                <div className="space-y-1 py-3">
                  <div className="text-4xl font-extrabold text-white tracking-tight">
                    {pkg.priceDisplay}
                  </div>
                  
                  <div className="text-base text-gray-300 font-medium">
                    {pkg.credits} credits{pkg.interval && ` / ${pkg.interval}`}
                  </div>
                </div>

                <p className="text-gray-300 text-base min-h-[50px] leading-relaxed px-2">{pkg.description}</p>

                {pkg.features && (
                  <div className="space-y-3 text-left pt-2 pb-4">
                    {pkg.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3 text-sm text-gray-200">
                        <div className="mt-0.5 p-0.5 rounded-full bg-green-500/20">
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                        </div>
                        <span className="leading-snug">{feature}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  className={`w-full mt-4 py-6 text-base font-bold shadow-lg transition-all ${
                    pkg.type === 'subscription'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-blue-500/50'
                      : pkg.type === 'upgrade'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:shadow-purple-500/50'
                      : 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500'
                  }`}
                  disabled={isProcessing}
                >
                  {isProcessing && selectedPackage?.id === pkg.id ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : pkg.type === 'trial' ? (
                    'Start Free Trial'
                  ) : pkg.type === 'upgrade' ? (
                    'Upgrade Now'
                  ) : (
                    'Subscribe Now'
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8 space-y-4 border-t border-gray-700 pt-6">
          <div className="p-5 rounded-xl bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-2 border-blue-500/40">
            <p className="text-base text-blue-100 text-center font-medium leading-relaxed">
              <strong className="text-lg">💳 Secure Payment by Stripe</strong>
              <br />
              <span className="text-sm text-blue-200 mt-1 block">
                1 Credit = 1 Coloring Page • Cancel Subscription Anytime
              </span>
            </p>
          </div>
          
          <div className="p-4 rounded-xl bg-amber-900/25 border border-amber-500/40">
            <p className="text-sm text-amber-100 text-center leading-relaxed">
              <strong>ℹ️ Trial Information:</strong> Trial converts to monthly subscription after 15 days. Cancel anytime during trial period to avoid charges.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
