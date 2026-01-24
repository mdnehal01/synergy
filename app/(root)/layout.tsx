import Footer from "./_components/Footer";
import Navbar from "./_components/Navbar";

const RootLayout = ({
    children
} : {
    children:React.ReactNode
}) => {
    return(
        <div className="h-full flex flex-col">
            <Navbar/>
            <main className="flex-1 pt-40">
                {
                    children
                }
            </main>
            <Footer />
        </div>
    )
}

export default RootLayout;