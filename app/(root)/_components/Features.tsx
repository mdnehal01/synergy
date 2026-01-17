"use client"

import { Zap, Users, Brain, Lock, Zap as ZapIcon, BarChart3 } from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI-Powered',
    description: 'Intelligent suggestions and content generation powered by advanced AI'
  },
  {
    icon: Users,
    title: 'Real-time Collaboration',
    description: 'Work together seamlessly with instant synchronization'
  },
  {
    icon: Lock,
    title: 'Secure & Private',
    description: 'Your data is encrypted and protected with enterprise-grade security'
  },
  {
    icon: BarChart3,
    title: 'Analytics & Insights',
    description: 'Track productivity and get actionable insights from your work'
  },
  {
    icon: ZapIcon,
    title: 'Lightning Fast',
    description: 'Optimized performance for seamless note-taking experience'
  },
  {
    icon: Zap,
    title: 'Smart Organization',
    description: 'Intelligent tagging and categorization for better workflow'
  }
]

export function Features() {
  return (
    <section className='w-full py-24 px-6'>
      <div className='max-w-6xl mx-auto'>
        <div className='text-center mb-16'>
          <h2 className='text-4xl md:text-5xl font-bold mb-4'>
            Powerful Features for <span className='bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent'>Modern Teams</span>
          </h2>
          <p className='text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto'>
            Everything you need to work smarter, collaborate faster, and create better
          </p>
        </div>

        <div className='grid md:grid-cols-3 gap-8'>
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className='group p-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:shadow-lg dark:hover:shadow-purple-500/10 transition-all duration-300 hover:border-blue-500/50 dark:hover:border-purple-500/50'
              >
                <div className='mb-4 inline-block p-3 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 group-hover:scale-110 transition-transform'>
                  <Icon className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                </div>
                <h3 className='text-xl font-semibold mb-2 text-foreground'>{feature.title}</h3>
                <p className='text-gray-600 dark:text-gray-400'>{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
