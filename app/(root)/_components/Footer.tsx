import React from 'react'

const Footer = () => {
  return (
    <div className='w-full bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center border-t border-slate-200 dark:border-slate-800' style={{ height: '50px', paddingLeft: '50px', paddingRight: '50px' }}>
      <p className='text-sm text-muted-foreground'>
        This is fully automated and generated using the Agent.
      </p>
    </div>
  )
}

export default Footer