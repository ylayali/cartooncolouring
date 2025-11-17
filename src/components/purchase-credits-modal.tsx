'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Coins, Check, Sparkles } from 'lucide-react'
import { CREDIT_PACKAGES, calculatePricePerCredit, type CreditPackage } from '@/lib/credit-packages'

interface PurchaseCreditsModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

export function PurchaseCreditsModal({ isOpen, onClose, userId }: PurchaseCreditsModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePurchase = async (pkg: CreditPackage) => {
    setIsProcessing(true)
    setError(null)
    setSelectedPackage(pkg)

    try {
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

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (err) {
      console.error('Purchase error:', err)
      setError(err instanceof Error ? err.message : 'Failed to start checkout')
      setIsProcessing(false)
      setSelectedPackage(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Coins className="w-6 h-6 text-amber-400" />
            Purchase Credits
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose a credit package to continue creating amazing coloring pages
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-4 rounded-lg bg-red-900/20 border border-red-500/50 text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {CREDIT_PACKAGES.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative p-6 cursor-pointer transition-all ${
                pkg.popular
                  ? 'bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-2 border-blue-500/50'
                  : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
              } ${selectedPackage?.id === pkg.id ? 'ring-2 ring-amber-500' : ''}`}
              onClick={() => !isProcessing && handlePurchase(pkg)}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500 text-white text-xs font-bold">
                    <Sparkles className="w-3 h-3" />
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="text-center space-y-4">
                <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-amber-400">
                    {pkg.credits}
                    <span className="text-lg text-gray-400 ml-2">credits</span>
                  </div>
                  
                  <div className="text-3xl font-bold text-white">
                    {pkg.priceDisplay}
                  </div>
                  
                  <div className="text-sm text-gray-400">
                    ${calculatePricePerCredit(pkg.price, pkg.credits)} per credit
                  </div>
                </div>

                {pkg.savings && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-900/30 border border-green-500/50">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm font-medium">
                      Save {pkg.savings}%
                    </span>
                  </div>
                )}

                <p className="text-gray-400 text-sm">{pkg.description}</p>

                <Button
                  className={`w-full ${
                    pkg.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  disabled={isProcessing}
                >
                  {isProcessing && selectedPackage?.id === pkg.id ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    'Buy Now'
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-blue-900/20 border border-blue-500/30">
          <p className="text-sm text-blue-200 text-center">
            <strong>💳 Secure checkout powered by Stripe</strong>
            <br />
            Single photo = 1 credit • Multiple photos = 2 credits
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
