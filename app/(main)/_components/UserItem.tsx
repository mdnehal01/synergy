import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { SignOutButton, useUser } from '@clerk/clerk-react'
import { ChevronsLeftRight } from 'lucide-react';
import React from 'react'

const UserItem = () => {
    const {user} = useUser();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div role='button' className='flex items-center text-sm p-3 w-full hover:bg-theme-lightgreen/20 hover:text-theme-green transition-all duration-200 hover:shadow-sm'>
                    <div className='gap-x-2 flex items-center max-w-[150px]'>
                        <Avatar className='h-5 w-5'>
                            <AvatarImage src={user?.imageUrl}/>
                        </Avatar>
                        <span className='line-clamp-1 group-hover:text-theme-green transition-colors'
                        >{user?.fullName}&apos;s Synergie</span>
                    </div>
                    <ChevronsLeftRight className='rotate-90 ml-2 text-neutral-300 h-4 w-4 group-hover:text-theme-lightgreen transition-colors'/>
                </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent className='w-80 h-32' align='start' alignOffset={11} forceMount>
                <div className='flex flex-col space-y-4 p-2'>
                    <p className='text-xs font-medium leading-none text-neutral-600'>{user?.emailAddresses[0].emailAddress}</p>

                    <div className='flex items-center gap-x-2'>
                        <div className='rounded-md bg-neutral-100 p-1'>
                            <Avatar className='h-8 w-8'>
                                <AvatarImage src={user?.imageUrl}/>
                            </Avatar>
                        </div>

                        <div className='space-y-1'>
                            <p className='text-sm line-clamp-1'>{user?.fullName}&apos;s Synergie</p>
                        </div>
                    </div>
                </div>
                <DropdownMenuSeparator>
                    <DropdownMenuItem asChild className='w-full cursor-pointer text-neutral-600 hover:bg-theme-lightgreen/10 hover:text-theme-green transition-colors'>
                        <SignOutButton>Log out</SignOutButton>
                    </DropdownMenuItem>
                </DropdownMenuSeparator>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default UserItem