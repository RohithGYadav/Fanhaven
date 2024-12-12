"use client"
import { useSession, signIn, signOut } from "next-auth/react"
import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const Navbar = () => {
  const { data: session } = useSession()
  const [dropdown, setDropdown] = useState(false)
  const dropdownRef = useRef(null)

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdown(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className='bg-cyan-950 h-14 flex justify-between items-center'>
      <div className=" flex justify-center items-center ">
      <img src="star.png" alt="" className='w-10 ml-2' />
      <div className='text-white m-1 font-bold text-lg'>Fanhaven</div>
      </div>

      {!session &&
        <Link href={"/login"}>
          <button type="button" className="text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 shadow-lg shadow-cyan-500/50 dark:shadow-lg dark:shadow-cyan-800/80 font-semibold mt-2 rounded-lg text-base px-3 py-1 text-center me-2 mb-2">
            Login
          </button>
        </Link>
      }

      {session &&
        <div className="flex gap-2 justify-center items-center mx-2 relative" ref={dropdownRef}>
           <Link href={"/homepage"}>
            <button type="button" className=" w-32 text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 shadow-lg shadow-cyan-500/50 dark:shadow-lg dark:shadow-cyan-800/80 font-semibold mt-2 rounded-lg text-base px-3 py-1 text-center mb-2">
              Home
            </button>
          </Link>
          
          
          <Link href={"/dashboard"}>
            <button type="button" className="text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 shadow-lg shadow-cyan-500/50 dark:shadow-lg dark:shadow-cyan-800/80 font-semibold mt-2 rounded-lg text-base px-3 py-1 text-center mb-2">
              Dashboard
            </button>
          </Link>
          <button onClick={() => signOut("")} type="button" className="text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 shadow-lg shadow-cyan-500/50 dark:shadow-lg dark:shadow-cyan-800/80 font-semibold mt-2 rounded-lg text-base px-3 py-1 text-center mb-2">
            SignOut
          </button>
        </div>
      }
    </div>
  )
}

export default Navbar
