import Image from 'next/image'
import React from 'react'

const Heros = () => {
  return (
    <div className='flex flex-col items-center justify-center max-w-5xl w-full'>
        <div className='relative w-full'>
            {/* Animated gradient background */}
            <div className='absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 rounded-3xl blur-3xl'></div>
            
            <div className='relative flex items-center justify-center gap-4 md:gap-8'>
               
            </div>
        </div>
    </div>
  )
}

export default Heros