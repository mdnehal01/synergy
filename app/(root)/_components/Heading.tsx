"use client"
import Loader from '@/components/Loader'
import { Button } from '@/components/ui/button'
import { SignInButton, useUser } from '@clerk/clerk-react'
import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const Heading = () => {
    const {isLoaded, isSignedIn} = useUser();

    return (
        <div className='max-w-4xl space-y-6'>
            <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 dark:border-blue-400/20'>
                <Sparkles className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                <span className='text-sm font-semibold text-blue-600 dark:text-blue-400'>Powered by AI Intelligence</span>
            </div>

            <h1 className='text-4xl sm:text-6xl md:text-8xl font-bold leading-tight'>
                Take <span className='bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-purple-400 dark:to-pink-400'>smarter notes</span> with AI
            </h1>
            <h3 className='text-lg sm:text-xl md:text-2xl font-light text-gray-600 dark:text-gray-300'>
                Synergie is your collaborative workspace where brilliant ideas meet powerful AI. Think, work, and create—together, effortlessly.
            </h3>

            <div className='flex items-center gap-4 justify-center'>
                {!isLoaded && <Loader/>}
                {isLoaded && isSignedIn && 
                    (
                        <Button asChild size="lg" className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg'>
                            <Link href={"/documents"}>
                                Enter Synergie
                                <ArrowRight className='ml-2 h-5 w-5'/> 
                            </Link>
                        </Button>
                    )
                }
                
                {isLoaded && !isSignedIn && (
                    <SignInButton mode='modal'>
                        <Button size="lg" className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg'>
                            Get Synergie Free
                            <ArrowRight className='ml-2 h-5 w-5'/>
                        </Button>
                    </SignInButton>
                )}
            </div>
        </div>
    ) 
}

export default Heading