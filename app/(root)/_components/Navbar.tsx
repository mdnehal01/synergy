"use client";

"use client";

import Image from 'next/image';
import React from 'react'
import Logo from "@/public/images/Logo.png";
import { useRouter } from 'next/navigation';
import { SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import Loader from '@/components/Loader';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ThemeToggleSimple } from '@/components/theme-toggle-simple';

const Navbar = () => {
  const router = useRouter();

  // THIS HOOK WILL CHECK IF EVERYTHING IS RUNNING IN SYNC OR NOT WITH CONVEX AND CLERK
  // const {isAuthenticated, isLoading} = useConvexAuth();
  const {isSignedIn, isLoaded} = useUser()
  return (
    <div className='w-full h-14 px-12 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center'>
      <div className='w-fit flex items-center cursor-pointer' onClick={() => router.push("/")}>
        <Image src={Logo} height={50} width={50} alt='LOGO'/>
        <h1 className='text-3xl'>synergie.</h1>
      </div>

      <div className='flex gap-4 items-center'>
        {!isLoaded && <Loader/>}
        {(!isSignedIn && isLoaded) && (
          <div className='flex items-center justify-center gap-2'>
          <SignInButton mode='modal'>
            <span className='px-4 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer inline-block'>Login</span>
          </SignInButton>
          <SignInButton mode='modal'>
            <span className='border-2 px-2 py-1 text-sm rounded-md border-theme-green bg-theme-green text-white hover:text-theme-green hover:bg-theme-lightgreen cursor-pointer inline-block'>Get Synergie Free</span>
          </SignInButton>
          </div>
        )}

        {isSignedIn && isLoaded && <>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/documents">Enter Synergie. <ArrowRight/></Link>
          </Button>
          <UserButton />
        </>}
        <ThemeToggleSimple />
      </div>
    </div>
  )
}

export default Navbar