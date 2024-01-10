'use client';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { FiPlusCircle } from 'react-icons/fi';
import { IoIosCloseCircle } from 'react-icons/io';
import { BsArrowRightCircleFill } from 'react-icons/bs';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebase/config';
import moment from 'moment';

type SearchResult = {
  score: number;
  id: string;
  name: string;
  subtitle: string;
  description: string;
  link_image: string;
};

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

const getCurrentDatetime = (): string => {
  const date = new Date();
  return moment(date).format('YYYY-MM-DD_HH:mm:ss');
};

let previousInput = '';
export default function Search() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const [searchInput, setSearchInput] = useState<string>('');

  const [urlImages, setUrlImages] = useState<string[]>([]);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const router = useRouter();

  const [files, setFiles] = useState<File[]>([]);

  const addFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0] as File;
    files.push(file);
    let allFile = [...files];
    setFiles(allFile);
  };

  const popFile = (f: File) => {
    if (files.length === 0) return;

    const allf = files.filter((file) => file !== f);

    setFiles(allf);
  };

  // Clear search results
  const clearInputs = () => {
    previousInput = searchInput;
    setSearchInput('');
    setSearchResults([]);
    setFiles([]);
  };

  // Handle keydown
  const handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>) => {
    if (event.type === 'click' || (event as React.KeyboardEvent).key === 'Enter') {
      let promiseList: Promise<string>[] = [];

      for (let i = 0; i < files.length; i++) {
        const name = files[i].name;
        const storageRef = ref(storage, `images/${getCurrentDatetime()}_${name}`);
        const uploadTask = uploadBytesResumable(storageRef, files[i]);

        const uploadPromise = new Promise<string>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              switch (snapshot.state) {
                case 'paused':
                  console.log('Upload is paused');
                  break;
                case 'running':
                  console.log('Upload is running');
                  break;
              }
            },
            (error) => {
              console.error(error.message);
              reject(error);
            },
            () => {
              getDownloadURL(uploadTask.snapshot.ref)
                .then((url) => {
                  resolve(url);
                })
                .catch((error) => {
                  reject(error);
                });
            }
          );
        });

        promiseList.push(uploadPromise);
      }

      try {
        const urls = await Promise.all(promiseList);
        handleUploadComplete(urls);
      } catch (error) {
        console.error('Error during file upload:', error);
      }

      // POST /api/search
      const dataForm = {
        query: searchInput,
        type: 'text',
      };

      // const response = axios
      //   .post('http://localhost:5000/api/search', dataForm)
      //   .then((response) => {
      //     setSearchResults(response.data);
      //   })
      //   .catch((error) => {
      //     console.log(error);
      //   });

      setSearchResults(data);
    }
  };

  const handleUploadComplete = (urls: string[]) => {
    setUrlImages(urls);
    setIsSubmit(true);
    clearInputs();
  };

  return (
    <div className='mt-12 flex w-full items-center justify-center bg-[#1f1f1d]'>
      <div className='mth-fit w-[800px] rounded-xl bg-[#292927]'>
        <div className='space-y-4 px-8 py-2'>
          <input
            type='text'
            placeholder='Ask anything . . .'
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setIsSubmit(false);
            }}
            className='h-[50px] rounded-t-xl bg-transparent text-lg font-semibold text-white outline-none'
            onKeyDown={handleKeyDown}
          />

          <div className='flex flex-col'>
            <div className='w-full space-y-2'>
              <input
                type='file'
                name=''
                id='file'
                hidden
                onChange={(e) => {
                  addFile(e);
                  setIsSubmit(false);
                }}
              />

              {files.length > 0 && (
                <div className='flex space-x-2'>
                  {files.map((file, index) => (
                    <div key={index} className='relative h-12'>
                      <Image
                        key={index}
                        src={URL.createObjectURL(file!)}
                        alt='file image'
                        width={1000}
                        height={1000}
                        className='h-12 w-12 rounded-lg object-cover'
                      />
                      <button onClick={() => popFile(file)}>
                        <IoIosCloseCircle className='absolute -right-2 -top-2 text-neutral-500' />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className='mt-2 flex w-full justify-between'>
              <label htmlFor='file' className='flex w-fit items-center rounded-full px-3 py-2 hover:bg-neutral-600'>
                <FiPlusCircle className='cursor-pointer text-2xl text-gray-100' />
                <p className='ml-2 font-semibold text-gray-300'>Attach</p>
              </label>

              <button type='button' onClick={handleKeyDown}>
                <BsArrowRightCircleFill className='text-2xl text-gray-400' />
              </button>
            </div>
          </div>
        </div>
        {isSubmit && (
          <div>
            <div className='m-10 text-xl text-white'>{previousInput}</div>
            <div className='mb-10 flex flex-col items-center justify-center'>
              {urlImages.map((url) => (
                <img key={url} src={url} alt='image' className='h-64 rounded-lg pb-6' />
              ))}
            </div>
            {
              searchResults.length > 0 && (
                // Map through search results
                <div className='flex items-center justify-center'>
                  <div className='w-[800px] h-fit  rounded-xl'>
                    <div className='px-8 py-2 space-y-4'>
                      <div className='flex justify-between items-center'>
                        <p className='text-gray-400 font-semibold'>Search Results</p>
                        <button onClick={clearInputs}>
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
        )}
      </div>
    </div>
  );
}