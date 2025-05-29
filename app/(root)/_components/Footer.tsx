import { Button } from '@/components/ui/button'
import React from 'react'

const Footer = () => {
  return (
    <div className='w-full bg-zinc-100 flex items-center justify-start px-6'> 
      <h1 className='text-3xl font-bold'>Synergie</h1>
      <div className='md:ml-auto w-full justify-between md:justify-end flex items-center gap-x-2 text-muted-foreground'>
        <Button variant={"ghost"} size={"sm"}>
          Privacy Policy
        </Button>
        <Button variant={"ghost"} size={"sm"}>
          Terms & Conditions
        </Button>
      </div>
    </div>
  )
}

export default Footer