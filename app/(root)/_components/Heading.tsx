"use client"
import Loader from '@/components/Loader'
import { Button } from '@/components/ui/button'
import { SignInButton, useUser } from '@clerk/clerk-react'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const Heading = () => {
    const {isLoaded, isSignedIn} = useUser();
    return (
        <div className='max-w-3xl space-y-4'>
            <h1 className='text-3xl sm:text-5xl md:text-6xl font-bold '>
                <span className='underline'>Synergie</span> – Your Team’s Second Brain.
            </h1>
            <h3 className='text-base sm:text-xl md:text-2xl font-medium '>
                Synergie is a shared space to think, work, and create—together. 
            </h3>

            {!isLoaded && <Loader/>}
            {isLoaded && isSignedIn && 
                (
                    <Button asChild>
                        <Link href={"/documents"}>
                            Enter Synergie
                            <ArrowRight/> 
                        </Link>
                     </Button>
                )
            }
            
            {isLoaded && !isSignedIn && (
                <SignInButton mode='modal'>
                    <button className='border-2 px-3 py-2 text-sm rounded-md border-theme-green bg-theme-green text-white hover:text-theme-green hover:bg-theme-lightgreen'>Get Synergie Free</button>
                </SignInButton>
            )}
        </div>
    ) 
}

export default Heading