import * as React from 'react';

export default function Navbar() {


    return (
        <div className="flex m-2 w-1/3 justify-between items-center rounded-2xl text-md px-8 py-3 border-[1.5px] border-gray-200">
            <button
                className="font-bold cursor-pointer bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text hover:bg-gradient-to-r hover:from-blue-500 hover:via-green-400 hover:to-indigo-300"
            >
                Travel*
            </button>
            <button
                className="hover:text-gray-400 cursor-pointer"
            >
                <a href="/search">
                    Search
                </a>
            </button>
            <button
                className="hover:text-gray-400 cursor-pointer"
            >
                <a href="">
                    Contact Us
                </a>
            </button>
            <button
                className="hover:text-gray-400 cursor-pointer"
            >
                <a href="">
                    About Us
                </a>
            </button>
        </div>
    )
}