"use client"
import Loader from "@/components/Loader";
import { useUser } from "@clerk/clerk-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navigation from "./_components/Navigation";
import { SearchCommand } from "@/components/search-command";

const MainLayout = ({children} : {children:React.ReactNode}) => {
    const {isLoaded, isSignedIn} = useUser();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push("/");
        }
    }, [isLoaded, isSignedIn, router]);

    if(!isLoaded){
        return (
            <div>
                <Loader/>
            </div>
         )
    }

    if(!isSignedIn){
        return (
            <div>
                <Loader/>
            </div>
        )
    }

    return (
        <div className="flex h-full dark:bg-neutral-900">
            <Navigation/>
            <main className="flex-1 h-full overflow-y-auto">
                <SearchCommand/>
                {children}
            </main>
        </div>
    )
}

export default MainLayout;