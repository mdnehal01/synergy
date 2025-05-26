import Footer from "./_components/Footer";
import Heading from "./_components/Heading";
import Heros from "./_components/Heros";

 export default function Home() {
  return (
    <div className="relative min-h-full flex flex-col">
      <div className="flex flex-col items-center justify-center md:justify-start text-center gap-y-1 flex-1 pb-10">
        <Heading/>
        <Heros/>
        <div className="absolute bottom-0 w-full"> 
          <Footer/>
        </div>
      </div>
    </div>
  );
}
