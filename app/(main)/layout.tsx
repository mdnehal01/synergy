"use client"
import Loader from "@/components/Loader";
import { useUser } from "@clerk/clerk-react";
import { redirect } from "next/navigation";
import Navigation from "./_components/Navigation";

const MainLayout = ({children} : {children:React.ReactNode}) => {
    const {isLoaded, isSignedIn} = useUser();

    if(!isLoaded){
        return (
            <div>
                <Loader/>
            </div>
         )
    }

    if(!isSignedIn){
        redirect("/")
    }

    return (
        <div className="flex h-full dark:bg-theme-blue">
            <Navigation/>
            {children}
        </div>
    )
}

export default MainLayout; 