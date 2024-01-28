export default function Footer() {
    return (
        <div className="flex justify-center items-center">
            <div className="flex m-2 w-1/3 justify-between items-center rounded-2xl text-md text-gray-400 px-8 py-3 border-[1.5px] border-gray-200">
                <button
                    className="font-bold cursor-pointer bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text hover:bg-gradient-to-r hover:from-blue-500 hover:via-green-400 hover:to-indigo-300"
                >
                    Travel*
                </button>
                <button
                    className="hover:text-gray-600 cursor-pointer"
                >
                    Search
                </button>
                <button
                    className="hover:text-gray-600 cursor-pointer"
                >
                    Contact Us
                </button>
                <button
                    className="hover:text-gray-600 cursor-pointer"
                >
                    About Us
                </button>
            </div>
        </div>
    )
}