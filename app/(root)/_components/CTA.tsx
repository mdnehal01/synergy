"use client"

export function CTA() {
  return (
    <section className='w-full py-24 px-6'>
      <div className='max-w-4xl mx-auto'>
        <div className='relative rounded-3xl overflow-hidden'>
          {/* Gradient background */}
          <div className='absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-500 dark:via-purple-500 dark:to-pink-500'></div>
          
          {/* Content */}
          <div className='relative px-8 md:px-16 py-16 md:py-24 text-center text-white'>
            <h2 className='text-4xl md:text-5xl font-bold mb-6'>
              Ready to Transform Your Workflow?
            </h2>
            <p className='text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto'>
              Join thousands of teams already using Synergie to work smarter, collaborate faster, and create better
            </p>
            
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <button className='px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors'>
                Start Free Trial
              </button>
              <button className='px-8 py-3 bg-white/20 backdrop-blur text-white font-semibold rounded-lg border border-white/30 hover:bg-white/30 transition-colors'>
                Learn More
              </button>
            </div>

            <p className='mt-8 text-sm text-white/80'>
              ✨ No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
