'use client';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { FiPlusCircle } from "react-icons/fi";
import { IoIosCloseCircle } from "react-icons/io";
import { BsArrowRightCircleFill } from "react-icons/bs";
import { useRouter } from 'next/navigation';

type SearchResult = {
  score: number,
  id: string,
  name: string,
  subtitle: string,
  description: string,
  link_image: string,
}

const data: SearchResult[] = [
  {
    "score": 0.5,
    "id": "1",
    "name": "Tokyo",
    "subtitle": "Tokyo is the capital of Japan.",
    "description": "Tokyo is the capital of Japan. It is the center of the Greater Tokyo Area, and the most populous metropolitan area in the world. It is the seat of the Japanese government and the Imperial Palace, and the home of the Japanese Imperial Family.",
    "link_image": "https://media.cntraveler.com/photos/60341fbad7bd3b27823c9db2/4:3/w_4624,h_3468,c_limit/Tokyo-2021-GettyImages-1208124099.jpg"
  },
  {
    "score": 0.9,
    "id": "2",
    "name": "Hokkaido",
    "subtitle": "Hokkaido is the second largest island of Japan.",
    "description": "Hokkaido is the second largest island of Japan, and the largest and northernmost prefecture. The Tsugaru Strait separates Hokkaido from Honshu. The two islands are connected by the undersea railway Seikan Tunnel.",
    "link_image": "https://www.jal.co.jp/vn/vn/guide-to-japan/destinations/articles/hokkaido/best-parks-and-nature-attractions/_jcr_content/root/responsivegrid/sectioncontainer/image_1041888335.coreimg.jpeg/1636979413394.jpeg"
  }
]

export default function Search() {
  const [files, setFiles] = useState<File[]>([]);


  const addFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0] as File;
    files.push(file);
    let allFile = [...files];
    setFiles(allFile);
  }

  const popFile = (f: File) => {
    if (files.length === 0) return;

    const allf = files.filter(file => file !== f)

    setFiles(allf);
  }

  const [userQuery, setUserQuery] = useState<string>("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])

  // Handle user input
  const handleUserQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserQuery(event.target.value)
  }

  // Handle keydown
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      // POST /api/search
      const dataForm = {
        query: userQuery,
        type: "text"
      }

      // const response = axios.post("http://localhost:5000/api/search", dataForm).then((response) => {
      //     setSearchResults(response.data)
      // }).catch((error) => {
      //     console.log(error)
      // })

      setSearchResults(data)
    }
  }

  // Clear search results
  const clearSearchResults = () => {
    setUserQuery("")
    setSearchResults([])
  }


  return (
    <div>
      <div className=' w-full  flex items-center justify-center'>
        <div className='w-[800px] h-fit  rounded-xl bg-[#292927]'>
          <div className='px-8 py-2 space-y-4'>
            <input type="text" placeholder='Ask anything . . .' onChange={(e) => setUserQuery(e.target.value)}
              className=' bg-transparent h-[50px] text-white rounded-t-xl outline-none font-semibold text-lg'
              onKeyDown={handleKeyDown} value={userQuery}
            />

            <div className='flex flex-col'>
              <div className='space-y-2 w-full'>
                <input type="file" name="" id="file" hidden onChange={(e) => addFile(e)} />

                {files.length > 0 && (
                  <div className='flex space-x-2'>
                    {files.map((file, index) => (
                      <div key={index} className='relative h-12'>
                        <Image key={index} src={URL.createObjectURL(file!)} alt='file image'
                          width={1000} height={1000} className='w-12 h-12 rounded-lg object-cover'
                        />
                        <button onClick={() => popFile(file)}>
                          <IoIosCloseCircle className='absolute -top-2 -right-2 text-neutral-500' />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

              </div>

              <div className='flex justify-between w-full mt-2'>
                <label htmlFor='file' className='flex items-center hover:bg-neutral-600 py-2 px-3 rounded-full w-fit'>
                  <FiPlusCircle className='text-gray-100 text-2xl cursor-pointer' />
                  <p className='ml-2 text-gray-300 font-semibold'>Attach</p>
                </label>

                <button>
                  <BsArrowRightCircleFill className='text-gray-400 text-2xl' />
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
      {
        searchResults.length > 0 && (
          // Map through search results
          <div className='flex items-center justify-center'>
            <div className='w-[800px] h-fit  rounded-xl'>
              <div className='px-8 py-2 space-y-4'>
                <div className='flex justify-between items-center'>
                  <p className='text-gray-400 font-semibold'>Search Results</p>
                  <button onClick={clearSearchResults}>
                    <IoIosCloseCircle className='text-gray-400 text-2xl' />
                  </button>
                </div>

                {searchResults.map((result, index) => (
                  <div key={index} className='flex items-center space-x-4'>
                    <div className='relative h-24 w-24 overflow-hidden rounded-lg'>
                      <img
                        src={result.link_image}
                        alt='file image'
                        className='w-full h-full object-cover'
                      />
                    </div>

                    <div className='flex flex-col justify-center'>
                      <p className='text-gray-800 font-semibold text-lg'>{result.name}</p>
                      <p className='text-gray-600 font-medium'>{result.subtitle}</p>
                      <p className='text-gray-700'>{result.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      }
    </div>
  )
}
