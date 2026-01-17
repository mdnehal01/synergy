"use client"

import { Check } from 'lucide-react'

const pricingPlans = [
  {
    name: 'Starter',
    description: 'Perfect for individuals',
    price: 'Free',
    features: [
      'Up to 100 documents',
      'Basic AI suggestions',
      'Standard collaboration',
      '2GB storage'
    ]
  },
  {
    name: 'Professional',
    description: 'For growing teams',
    price: '$12',
    period: '/month',
    features: [
      'Unlimited documents',
      'Advanced AI features',
      'Priority collaboration',
      '100GB storage',
      'Team analytics',
      'API access'
    ],
    highlighted: true
  },
  {
    name: 'Enterprise',
    description: 'For large organizations',
    price: 'Custom',
    features: [
      'Everything in Professional',
      'Dedicated support',
      'Custom integrations',
      'Advanced security',
      'SSO & SAML',
      'SLA guarantee'
    ]
  }
]

export function Pricing() {
  return (
    <section className='w-full py-24 px-6'>
      <div className='max-w-6xl mx-auto'>
        <div className='text-center mb-16'>
          <h2 className='text-4xl md:text-5xl font-bold mb-4'>
            Simple, Transparent <span className='bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent'>Pricing</span>
          </h2>
          <p className='text-lg text-gray-600 dark:text-gray-400'>
            Choose the perfect plan for your needs
          </p>
        </div>

        <div className='grid md:grid-cols-3 gap-8'>
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-2xl transition-all duration-300 ${
                plan.highlighted
                  ? 'md:scale-105 bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl'
                  : 'bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-blue-500/50 dark:hover:border-purple-500/50'
              }`}
            >
              {plan.highlighted && (
                <div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
                  <span className='bg-gradient-to-r from-amber-400 to-orange-400 text-black px-4 py-1 rounded-full text-sm font-semibold'>
                    Most Popular
                  </span>
                </div>
              )}

              <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-foreground'}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mb-6 ${plan.highlighted ? 'text-blue-100' : 'text-gray-600 dark:text-gray-400'}`}>
                {plan.description}
              </p>

              <div className='mb-6'>
                <span className={`text-5xl font-bold ${plan.highlighted ? 'text-white' : 'text-foreground'}`}>
                  {plan.price}
                </span>
                {plan.period && (
                  <span className={`text-sm ${plan.highlighted ? 'text-blue-100' : 'text-gray-600 dark:text-gray-400'}`}>
                    {plan.period}
                  </span>
                )}
              </div>

              <button
                className={`w-full py-3 rounded-lg font-semibold mb-8 transition-colors ${
                  plan.highlighted
                    ? 'bg-white text-blue-600 hover:bg-gray-100'
                    : 'bg-gray-100 dark:bg-gray-700 text-foreground hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Get Started
              </button>

              <ul className='space-y-4'>
                {plan.features.map((feature, i) => (
                  <li key={i} className='flex items-center gap-3'>
                    <Check className={`h-5 w-5 ${plan.highlighted ? 'text-white' : 'text-blue-600'}`} />
                    <span className={plan.highlighted ? 'text-white' : 'text-gray-700 dark:text-gray-300'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
