"use client";

import Image from 'next/image';
import React from 'react'
import Logo from "@/public/images/Logo.png";
import { useRouter } from 'next/navigation';
const Navbar = () => {
  const router = useRouter();
  return (
    <div className='w-full h-14 px-12 border-b border-neutral-200 flex justify-between items-center'>
      <div className='w-fit flex items-center cursor-pointer' onClick={() => router.push("/")}>
        <Image src={Logo} height={50} width={50} alt='LOGO'/>
        <h1 className='text-3xl'>synergie.</h1>
      </div>

      <div className=''>
        <button>ThemeToggle btn</button>
      </div>
    </div>
  )
}

export default Navbar