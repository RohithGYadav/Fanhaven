import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SessionWrapper from "@/components/SessionWrapper";


const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Fanhaven",
  description: "Fan's sphere to fund your favourite creator!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionWrapper>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          
         
          <div className=" text-white flex-grow bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-[size:20px_20px]">
        
            {children}
           
          </div>
          <Footer />
        </div>
        </SessionWrapper>
      </body>
    </html>
  );
}
