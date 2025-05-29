import React from 'react'
import Logo from "@/public/images/Logo.png";
import Image from 'next/image';

const Loader = () => {
  return (
    <div className='flex items-center justify-center'>
        <Image className='animate-spin ' src={Logo} alt='Loading...' height={30} width={30}/>
    </div>
  )
}

export default Loader