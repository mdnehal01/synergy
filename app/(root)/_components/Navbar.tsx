"use client";

import Image from 'next/image';
import React from 'react'
import Logo from "@/public/images/Logo.png";
import { useRouter } from 'next/navigation';
import { useConvexAuth } from 'convex/react';
import { SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import { BiSun } from 'react-icons/bi';
import { Button } from '@/components/ui/button';
import Loader from '@/components/Loader';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
const Navbar = () => {
  const router = useRouter();

  // THIS HOOK WILL CHECK IF EVERYTHING IS RUNNING IN SYNC OR NOT WITH CONVEX AND CLERK
  // const {isAuthenticated, isLoading} = useConvexAuth();
  const {isSignedIn, isLoaded} = useUser()
  return (
    <div className='w-full h-14 px-12 border-b border-neutral-200 flex justify-between items-center'>
      <div className='w-fit flex items-center cursor-pointer' onClick={() => router.push("/")}>
        <Image src={Logo} height={50} width={50} alt='LOGO'/>
        <h1 className='text-3xl'>synergie.</h1>
      </div>

      <div className='flex gap-4 items-center'>
        {!isLoaded && <Loader/>}
        {(!isSignedIn && isLoaded) && (
          <div className='flex items-center justify-center'>
          <SignInButton mode='modal'>
            <Button variant="ghost">Login</Button>
          </SignInButton>
          <SignInButton mode='modal'>
            <button className='border-2 px-2 py-1 text-sm rounded-md border-theme-green bg-theme-green text-white hover:text-theme-green hover:bg-theme-lightgreen'>Get Synergie Free</button>
          </SignInButton>
          </div>
        )}

        {isSignedIn && isLoaded && <>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/documents">Enter Synergie. <ArrowRight/></Link>
          </Button>
          <UserButton />
        </>}
        {/* TODO: THEME TOGGLE BUTTON */}
        <BiSun/>
      </div>
    </div>
  )
}

export default Navbar