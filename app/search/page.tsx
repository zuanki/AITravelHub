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
      const response = axios
        .post('http://localhost:5000/api/search', dataForm)
        .then((response) => {
          setSearchResults(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
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
