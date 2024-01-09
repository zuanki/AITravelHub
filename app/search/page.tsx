'use client';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { FiPlusCircle } from "react-icons/fi";
import { IoIosCloseCircle } from "react-icons/io";
import { BsArrowRightCircleFill } from "react-icons/bs";
import { useRouter } from 'next/navigation';

export default function Search() {

  const [searchInput, setSearchInput] = useState<string>(''); 

  const router = useRouter();

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
  

  return (
    <div className='h-screen w-full bg-[#1f1f1d] flex items-center justify-center'>
      <div className='w-[800px] h-fit  rounded-xl bg-[#292927]'>
        <div className='px-8 py-2 space-y-4'>
          <input type="text" placeholder='Ask anything . . .' onChange={(e) => setSearchInput(e.target.value)}
            className=' bg-transparent h-[50px] text-white rounded-t-xl outline-none font-semibold text-lg'
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                router.push(`/search?q=${searchInput}`)
              }
            }}
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

              <button onClick={() => router.push(`/search?q=${searchInput}`)}>
                <BsArrowRightCircleFill className='text-gray-400 text-2xl' />
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
