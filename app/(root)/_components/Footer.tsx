import { Button } from '@/components/ui/button'
import React from 'react'

const Footer = () => {
  return (
    <div className='w-full bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-start px-6 py-8 border-t border-slate-200 dark:border-slate-800'> 
      <h1 className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent'>Synergie</h1>
      <div className='md:ml-auto w-full justify-between md:justify-end flex items-center gap-x-2 text-muted-foreground'>
        <Button variant={"ghost"} size={"sm"} className='hover:text-foreground transition-colors'>
          Privacy Policy
        </Button>
        <Button variant={"ghost"} size={"sm"} className='hover:text-foreground transition-colors'>
          Terms & Conditions
        </Button>
      </div>
    </div>
  )
}

export default Footer