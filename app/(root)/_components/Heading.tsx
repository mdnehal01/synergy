import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import React from 'react'

const Heading = () => {
    return (
        <div className='max-w-3xl space-y-4'>
            <h1 className='text-3xl sm:text-5xl md:text-6xl font-bold '>
                <span className='underline'>Synergie</span> – Your Team’s Second Brain.
            </h1>
            <h3 className='text-base sm:text-xl md:text-2xl font-medium '>
                Synergie is a shared space to think, work, and create—together. 
            </h3>
            <Button>
                Enter Synergie
                <ArrowRight/> 
            </Button>
        </div>
    ) 
}

export default Heading