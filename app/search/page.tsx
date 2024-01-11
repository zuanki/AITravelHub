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
  };

  // Handle keydown
  const handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>) => {
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
              setUrlImage('');
            }}
            className='h-[50px] rounded-t-xl bg-transparent text-lg font-semibold text-white outline-none'
            onKeyDown={handleKeyDown}
          />

          <div className='flex flex-col'>
            <div className='w-full space-y-2'>
              <input ref={fileInputRef} type='file' name='' id='file' hidden onChange={(e) => addFileImage(e)} />

              {fileImage && (
                <div className='flex space-x-2'>
                  <div className='relative h-12'>
                    <Image
                      src={blobUrl}
                      alt='file image'
                      width={1000}
                      height={1000}
                      className='h-12 w-12 rounded-lg object-cover'
                    />
                    <button onClick={() => popFileImage()}>
                      <IoIosCloseCircle className='absolute -right-2 -top-2 text-neutral-500' />
                    </button>
                  </div>
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
            <div className='mx-10 mt-3 text-xl text-white'>{previousInput}</div>
            {urlImage != '' ? (
              <div className='flex flex-col items-center justify-center'>
                <img src={urlImage} alt='image' className='max-h-96 w-fit rounded-md p-10' />
              </div>
            ) : null}
            {searchResults.length > 0 && (
              <div className='mt-2'>
                <ul>
                  {searchResults.map((result) => {
                    return (
                      <li key={result.name}>
                        <h3>{result.name}</h3>
                        <img src={result.link_image} alt={result.name} className='rounded-md' />
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
