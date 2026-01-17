"use client"
import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import { Zap, Brain, Share2, CheckCircle, Layout, FileText } from 'lucide-react'

const Heros = () => {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const features = [
    { icon: Brain, label: 'AI-Powered', color: 'from-blue-500 to-blue-600' },
    { icon: Share2, label: 'Collaborative', color: 'from-purple-500 to-purple-600' },
    { icon: Zap, label: 'Lightning Fast', color: 'from-pink-500 to-pink-600' },
  ]

  return (
    <div className='flex flex-col items-center justify-center max-w-6xl w-full gap-12'>
      {/* Main Hero Showcase */}
      <div className='relative w-full'>
        {/* Animated gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-pink-500/20 rounded-3xl blur-3xl transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}></div>
        
        {/* Animated floating particles */}
        <div className='absolute top-0 left-10 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 dark:opacity-10 animate-pulse'></div>
        <div className='absolute bottom-0 right-10 w-32 h-32 bg-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 dark:opacity-10 animate-pulse' style={{ animationDelay: '2s' }}></div>
        <div className='absolute -left-8 bottom-20 w-32 h-32 bg-pink-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 dark:opacity-10 animate-pulse' style={{ animationDelay: '4s' }}></div>
        
        {/* Main content container */}
        <div className='relative backdrop-blur-sm bg-white/40 dark:bg-slate-900/40 border border-white/20 dark:border-slate-700/20 rounded-3xl p-8 md:p-12 lg:p-16 shadow-2xl'>
          {/* Feature badges */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-12'>
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br ${feature.color} bg-opacity-10 dark:bg-opacity-20 border border-current border-opacity-20 transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                  style={{ transitionDelay: `${idx * 100}ms` }}
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${feature.color} text-white`}>
                    <Icon className='h-5 w-5' />
                  </div>
                  <span className='font-semibold text-gray-700 dark:text-gray-200'>{feature.label}</span>
                </div>
              )
            })}
          </div>

          {/* Visual showcase area - Screenshots side by side */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 items-center'>
            {/* Left - Dashboard Screenshot */}
            <div className={`relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-1000 hover:shadow-3xl hover:scale-105 ${isLoaded ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
              <div className='relative w-full aspect-video'>
                <Image
                  src="/images/editor2.png"
                  alt="Dashboard Overview"
                  fill
                  className='object-cover'
                  priority
                />
              </div>
              <div className='absolute inset-0 rounded-2xl ring-1 ring-white/20'></div>
            </div>

            {/* Right - Editor Screenshot */}
            <div className={`relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-1000 hover:shadow-3xl hover:scale-105 ${isLoaded ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`} style={{ transitionDelay: '100ms' }}>
              <div className='relative w-full aspect-video'>
                <Image
                  src="/images/Editor.png"
                  alt="Rich Editor"
                  fill
                  className='object-cover'
                  priority
                />
              </div>
              <div className='absolute inset-0 rounded-2xl ring-1 ring-white/20'></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom accent bar */}
      <div className='w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-50'></div>
    </div>
  )
}

export default Heros