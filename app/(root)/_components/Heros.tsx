import Image from 'next/image'
import React from 'react'

const Heros = () => {
  return (
    <div className='flex flex-col items-center justify-center max-w-5xl'>
        <div className='flex items-center'>
            <div className='relative w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px]'>
                <Image
                    fill
                    className='object-contain'
                    src="/images/collaboration.svg"
                    alt="Collaboration"
                />
            </div>
            <div className='h-[400px] w-[400px] hidden md:block relative'>
                <Image
                    alt='Collab2'
                    fill
                    className='object-contain'
                    src="/images/collab2.svg"
                />
            </div>
        </div>
    </div>
  )
}

export default Heros