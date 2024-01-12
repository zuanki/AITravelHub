'use client';

import Image from 'next/image';
import React, { useEffect, useState, useRef } from 'react';
import { FiPlusCircle } from 'react-icons/fi';
import { IoIosCloseCircle } from 'react-icons/io';
import { BsArrowRightCircleFill } from 'react-icons/bs';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebase/config';
import moment from 'moment';
import { set } from 'firebase/database';
import { TbGridDots } from "react-icons/tb";
import { AiOutlineLike } from "react-icons/ai";
import { AiOutlineDislike } from "react-icons/ai";

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
    score: 0.5,
    id: '1',
    name: 'Tokyo',
    subtitle: 'Tokyo is the capital of Japan.',
    description:
      'Tokyo is the capital of Japan. It is the center of the Greater Tokyo Area, and the most populous metropolitan area in the world. It is the seat of the Japanese government and the Imperial Palace, and the home of the Japanese Imperial Family.',
    link_image:
      'https://media.cntraveler.com/photos/60341fbad7bd3b27823c9db2/4:3/w_4624,h_3468,c_limit/Tokyo-2021-GettyImages-1208124099.jpg',
  },
  {
    score: 0.9,
    id: '2',
    name: 'Hokkaido',
    subtitle: 'Hokkaido is the second largest island of Japan.',
    description:
      'Hokkaido is the second largest island of Japan, and the largest and northernmost prefecture. The Tsugaru Strait separates Hokkaido from Honshu. The two islands are connected by the undersea railway Seikan Tunnel.',
    link_image:
      'https://www.jal.co.jp/vn/vn/guide-to-japan/destinations/articles/hokkaido/best-parks-and-nature-attractions/_jcr_content/root/responsivegrid/sectioncontainer/image_1041888335.coreimg.jpeg/1636979413394.jpeg',
  },
  {
    score: 0.5,
    id: '1',
    name: 'Tokyo',
    subtitle: 'Tokyo is the capital of Japan.',
    description:
      'Tokyo is the capital of Japan. It is the center of the Greater Tokyo Area, and the most populous metropolitan area in the world. It is the seat of the Japanese government and the Imperial Palace, and the home of the Japanese Imperial Family.',
    link_image:
      'https://media.cntraveler.com/photos/60341fbad7bd3b27823c9db2/4:3/w_4624,h_3468,c_limit/Tokyo-2021-GettyImages-1208124099.jpg',
  },
  {
    score: 0.9,
    id: '2',
    name: 'Hokkaido',
    subtitle: 'Hokkaido is the second largest island of Japan.',
    description:
      'Hokkaido is the second largest island of Japan, and the largest and northernmost prefecture. The Tsugaru Strait separates Hokkaido from Honshu. The two islands are connected by the undersea railway Seikan Tunnel.',
    link_image:
      'https://www.jal.co.jp/vn/vn/guide-to-japan/destinations/articles/hokkaido/best-parks-and-nature-attractions/_jcr_content/root/responsivegrid/sectioncontainer/image_1041888335.coreimg.jpeg/1636979413394.jpeg',
  },
  {
    score: 0.5,
    id: '1',
    name: 'Tokyo',
    subtitle: 'Tokyo is the capital of Japan.',
    description:
      'Tokyo is the capital of Japan. It is the center of the Greater Tokyo Area, and the most populous metropolitan area in the world. It is the seat of the Japanese government and the Imperial Palace, and the home of the Japanese Imperial Family.',
    link_image:
      'https://media.cntraveler.com/photos/60341fbad7bd3b27823c9db2/4:3/w_4624,h_3468,c_limit/Tokyo-2021-GettyImages-1208124099.jpg',
  },
  {
    score: 0.9,
    id: '2',
    name: 'Hokkaido',
    subtitle: 'Hokkaido is the second largest island of Japan.',
    description:
      'Hokkaido is the second largest island of Japan, and the largest and northernmost prefecture. The Tsugaru Strait separates Hokkaido from Honshu. The two islands are connected by the undersea railway Seikan Tunnel.',
    link_image:
      'https://www.jal.co.jp/vn/vn/guide-to-japan/destinations/articles/hokkaido/best-parks-and-nature-attractions/_jcr_content/root/responsivegrid/sectioncontainer/image_1041888335.coreimg.jpeg/1636979413394.jpeg',
  },
  {
    score: 0.5,
    id: '1',
    name: 'Tokyo',
    subtitle: 'Tokyo is the capital of Japan.',
    description:
      'Tokyo is the capital of Japan. It is the center of the Greater Tokyo Area, and the most populous metropolitan area in the world. It is the seat of the Japanese government and the Imperial Palace, and the home of the Japanese Imperial Family.',
    link_image:
      'https://media.cntraveler.com/photos/60341fbad7bd3b27823c9db2/4:3/w_4624,h_3468,c_limit/Tokyo-2021-GettyImages-1208124099.jpg',
  },
  {
    score: 0.9,
    id: '2',
    name: 'Hokkaido',
    subtitle: 'Hokkaido is the second largest island of Japan.',
    description:
      'Tokyo is the capital of Japan. It is the center of the Greater Tokyo Area, and the most populous metropolitan area in the world. It is the seat of the Japanese government and the Imperial Palace, and the home of the Japanese Imperial Family. Hokkaido is the second largest island of Japan, and the largest and northernmost prefecture. The Tsugaru Strait separates Hokkaido from Honshu. The two islands are connected by the undersea railway Seikan Tunnel.',
    link_image:
      'https://www.jal.co.jp/vn/vn/guide-to-japan/destinations/articles/hokkaido/best-parks-and-nature-attractions/_jcr_content/root/responsivegrid/sectioncontainer/image_1041888335.coreimg.jpeg/1636979413394.jpeg',
  },
];

const getCurrentDatetime = (): string => {
  const date = new Date();
  return moment(date).format('YYYY-MM-DD_HH:mm:ss');
};

export default function Search() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const [searchInput, setSearchInput] = useState<string>('');

  const [previousInput, setPreviousInput] = useState<string>('');

  const [blobUrl, setBlobUrl] = useState<string>('');

  const [urlImage, setUrlImage] = useState<string>('');

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const router = useRouter();

  const [fileImage, setFileImage] = useState<File | null>(null);

  const addFileImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0] as File;
    if (file) {
      setBlobUrl(URL.createObjectURL(file));
      setFileImage(file);
      setIsSubmit(false);
    }
  };

  const popFileImage = () => {
    if (blobUrl != '') {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl('');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setFileImage(null);
    setUrlImage('');
  };

  const clearInputs = () => {
    setPreviousInput(searchInput);
    setSearchInput('');
    setFileImage(null);
  };

  // Clear search results
  const clearSearchResults = () => {
    setUrlImage('');
    setSearchResults([]);
    setIsSubmit(false);
    setPreviousInput('');
    setSearchInput('');
  };

  // Handle keydown
  const handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.type === 'click' || (event as React.KeyboardEvent).key === 'Enter') {
      if (searchInput === '' && !fileImage) return;
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      let promiseUpload: Promise<string> = Promise.resolve('');
      if (fileImage) {
        const name = fileImage.name;
        const storageRef = ref(storage, `images/${getCurrentDatetime()}_${name}`);
        const uploadTask = uploadBytesResumable(storageRef, fileImage!);

        promiseUpload = new Promise<string>((resolve, reject) => {
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
              reject(error.message);
            },
            () => {
              getDownloadURL(uploadTask.snapshot.ref)
                .then((url) => {
                  resolve(url);
                })
                .catch((error) => {
                  console.error(error.message);
                  reject(error.message);
                });
            }
          );
        });
      } else {
        setIsSubmit(true);
      }

      const url = await promiseUpload;
      setUrlImage(url);
      setIsSubmit(true);
      clearInputs();

      // POST /api/search
      let dataForm = {
        query: searchInput,
        type: 'text',
      };
      if (fileImage) {
        dataForm = {
          query: url,
          type: 'image',
        };
      }
      console.log(dataForm);
      axios
        .post('http://localhost:5000/api/search', dataForm)
        .then((response) => {
          setSearchResults(response.data);
        })
        .catch((error) => {
          console.log(error);
        });

      if (blobUrl != '') {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl('');
      }

      setSearchResults(data);
    }
  };

  // Auto Resize Textarea
  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  // Truncate string
  const truncate = (str: string, n: number) => {
    return str?.length > n ? str.substring(0, n - 1) + ' ...' : str;
  };

  return (
    <div>
      <div className='flex justify-center items-center text-4xl font-bold m-12'>
        Where knowledge begins
      </div>
      <div className='flex justify-center items-center'>
        <div className='w-[800px] p-4 justify-center items-center rounded-md border-2 border-[#9DC08B]'>
          <textarea
            className='p-2 bg-[#EDF1D6] w-full resize-none overflow-hidden focus:right-0 focus:outline-none'
            placeholder='Ask anything . . .'
            onInput={autoResize}
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setIsSubmit(false);
              setUrlImage('');
            }}
            onKeyDown={handleKeyDown}
          />
          <div className=''>
            <input ref={fileInputRef} type='file' name='' id='file' hidden onChange={(e) => addFileImage(e)} />
            {
              fileImage && (
                <div className='flex p-2'>
                  <div className='relative h-12'>
                    <Image
                      src={blobUrl}
                      alt='file image'
                      width={1000}
                      height={1000}
                      className='h-12 w-12 rounded-lg '
                    />
                    <button onClick={() => popFileImage()}>
                      <IoIosCloseCircle className='absolute -right-2 -top-2 text-[#9DC08B]' />
                    </button>
                  </div>
                </div>
              )
            }
            <div className='flex justify-between items-center'>
              <label htmlFor='file'
                className='flex font-medium justify-between items-center hover:bg-[#9DC08B] rounded-full px-2 py-1 cursor-pointer'
              >
                <FiPlusCircle className='text-md' />
                <p className='ml-2'>Attach</p>
              </label>
              <button type='button' onClick={handleKeyDown}>
                <div className='p-2 hover:bg-[#9DC08B] rounded-full cursor-pointer'>
                  <BsArrowRightCircleFill className='text-xl' />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div >
      <div className='flex justify-center items-center mt-10'>
        <div className='w-[800px] '>
          <div className='font-bold text-xl'>
            <div className='flex items-center'>
              <TbGridDots />
              <p className='ml-2'>Search Results</p>
            </div>
          </div>
          <div>
            {
              data.map((result, idx) => {
                return (
                  <div>
                    <div className='my-4 flex items-center' key={idx}>
                      <div>
                        <img src={result.link_image} alt={result.name} className='rounded-lg  w-[100px] h-[100px]' />
                      </div>
                      <div className='ml-4 flex flex-col justify-center w-full' >
                        <div className='flex justify-between items-center w-full mb-2'>
                          <div className='font-bold text-lg'>
                            {result.name}
                          </div>
                          <div className='text-xs font-bold'>
                            <div className='flex items-center'>
                              <AiOutlineLike className='text-xl text-[#9DC08B]' />
                              <p className='ml-2'>1.2k</p>

                              <AiOutlineDislike className='text-xl text-[#9DC08B] ml-4' />
                              <p className='ml-2'>1.2k</p>
                            </div>
                          </div>
                        </div>
                        <div className='text-sm'>
                          {truncate(result.description, 250)}
                        </div>
                      </div>

                    </div>
                    <hr className='border-[#9DC08B]' />
                  </div>
                );
              })
            }
          </div>
        </div>
      </div>
    </div >
  );
}
