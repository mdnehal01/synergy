"use client"

import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Product Manager',
    company: 'Tech Startup',
    avatar: '👩‍💼',
    content: 'Synergie completely transformed how our team collaborates. The AI suggestions save us hours every week.',
    rating: 5
  },
  {
    name: 'Mike Chen',
    role: 'Team Lead',
    company: 'Fortune 500',
    avatar: '👨‍💻',
    content: 'The best note-taking and collaboration tool we\'ve ever used. Highly recommended!',
    rating: 5
  },
  {
    name: 'Emma Davis',
    role: 'Content Creator',
    company: 'Creative Agency',
    avatar: '👩‍🎨',
    content: 'Finally a tool that keeps up with my creative process. Love the real-time collaboration features.',
    rating: 5
  }
]

export function Testimonials() {
  return (
    <section className='w-full py-24 px-6 bg-gray-50 dark:bg-gray-900/50'>
      <div className='max-w-6xl mx-auto'>
        <div className='text-center mb-16'>
          <h2 className='text-4xl md:text-5xl font-bold mb-4'>
            Loved by <span className='bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent'>Teams Worldwide</span>
          </h2>
          <p className='text-lg text-gray-600 dark:text-gray-400'>
            See what our users have to say about their Synergie experience
          </p>
        </div>

        <div className='grid md:grid-cols-3 gap-8'>
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className='p-8 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-purple-500/10 transition-all'
            >
              {/* Rating */}
              <div className='flex gap-1 mb-4'>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className='h-4 w-4 fill-amber-400 text-amber-400' />
                ))}
              </div>

              {/* Content */}
              <p className='text-gray-700 dark:text-gray-300 mb-6 italic'>
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className='flex items-center gap-3'>
                <span className='text-3xl'>{testimonial.avatar}</span>
                <div>
                  <p className='font-semibold text-foreground'>{testimonial.name}</p>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>{testimonial.role}</p>
                  <p className='text-xs text-gray-500 dark:text-gray-500'>{testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
