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
import { AiFillMessage } from "react-icons/ai";
import Chat from '../components/vqachat';

type SearchResult = {
  score: number;
  id: string;
  destination: string;
  title: string;
  description: string;
  image: string;
};

const data: SearchResult[] = [
  {
    "score": 0.9999999999999999,
    "id": "G5651XC8",
    "title": "",
    "destination": "Hokkaido",
    "image": "https://en.japantravel.com/photo/1655-215379/1440x960!/hokkaido-lake-toya-215379.jpg",
    "description": "Hokkaido as Japan’s second largest island to the far north, has much wilderness to be explored.\nRenowned among tourists and locals alike for its abundance of powder snow and white landscapes, Hokkaido is always a popular choice for winter sports and scenery in places like Niseko and wetland Kushiro Shitsugen. Its attraction extends beyond nature to ramen and seafood such as crabs and sea urchins, which are of the highest quality in the frigid waters here.\nApart from its famed cuisine, parks and beautiful nature, Hokkaido is also steeped in history as the home of the indigenous Ainu people. Increasingly popular in seasons other than winter, more visitors have been flocking here for the delightful moss phlox and tulip fields in spring and a land that teems with life during summer."
  },
  {
    "score": 0.8333333333333334,
    "id": "R3U0Y210",
    "title": "Hokkaido's second biggest city",
    "destination": "Asahikawa",
    "image": "https://en.japantravel.com/photo/39234-215106/120x80!/hokkaido-asahikawa-215106.jpg",
    "description": "Asahikawa Airport in Hokkaido cuts a sharp form as planes come and go from its single runway. With easy access from Asahikawa Station, Asahiyama Zoo, and Furano Station, visitors to the area may find themselves on the tarmac of this airport that has been around for more than half a century.\nWhile in the Asahikawa and Furano area, rediscover the world’s natural splendor at Asahiyama Zoo, Biei Farm, Furano Cheese Factory, and Ueno Farm, also known as the Gnomes’ Garden—even try sake at Otokoyama Sake Brewing Museum.\nThe Asahiyama Zoo is the northernmost zoo of its kind in Japan. Visitors to the Asahiyama Zoo will see animals in wide-open spaces where they frolic, fly, and swim. With seals swimming through tubes, birds flying overhead in the aviarium, and penguins on parade at feeding time, you’ll be transported to a magical animal kingdom.\nSee fields of fluffy lavender at Biei Farm and try a variety of lavender-themed treats. At the Furano Cheese Factory discover the cheese-making process and eat your fill of the creamy delicious food we all know and love.\nLikewise, at Ueno Farm, guests can rediscover a world they thought they knew. This garden getaway is the perfect place for green-thumb enthusiasts and lovers of a quaint and picturesque scene. An ideal family trip, the Gnomes’ Garden provides a mixture of English gardens and Japanese flora.\nIf you’re planning a trip without children, make sure to visit the local sake brewery that offers free tasting and a spectrum of local produce. Discover the brewing methods used in Japan for nihonshu, or sake as it’s commonly called. And even sample natural spring water from Daisetsuzan Mountain outside the brewery.\nHokkaido Access Guide\nMajor Airports in Hokkaido"
  },
  {
    "score": 0.8333333333333334,
    "id": "ZMZ2UMGU",
    "title": "Many cute animals for you to make friends up close",
    "destination": "Hokkaido: Asahiyama Zoo in Summer",
    "image": "https://a1.cdn.japantravel.com/photo/10331-63336/360x240!/hokkaido-สวนสัตว์-asahiyama-ในฤดูร้อน-63336.jpg",
    "description": "Asahiyama Zoo is an interesting place to visit near Asahikawa. It is a place you can go spend an entire day without getting bored. It's more popular in winter as there is a special penguin parade show. However, in summer, this place is not any less fun to visit. Aside from the many animals (both local Hokkaido species and animals from around the world), the key highlight of this place is the many interesting and up close ways you can interact with the animals that are unlike any other zoos."
  },
  {
    "score": 0.8333333333333334,
    "id": "JA54JMFA",
    "title": "Many cute animals for you to make friends up close",
    "destination": "Hokkaido: Asahiyama Zoo in Summer",
    "image": "https://a1.cdn.japantravel.com/photo/10331-63336/1000/hokkaido-สวนสัตว์-asahiyama-ในฤดูร้อน-63336.jpg",
    "description": "Asahiyama Zoo is an interesting place to visit near Asahikawa. It is a place you can go spend an entire day without getting bored. It's more popular in winter as there is a special penguin parade show. However, in summer, this place is not any less fun to visit. Aside from the many animals (both local Hokkaido species and animals from around the world), the key highlight of this place is the many interesting and up close ways you can interact with the animals that are unlike any other zoos."
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
    if (event.type === 'click') {
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

      // Test
      // ====================================================================================================
      // setSearchResults(data);
      // ====================================================================================================
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

  // VQA Modal
  const [openVQAChat, setOpenVQAChat] = useState<boolean>(false);

  // Handle VQA Modal
  const handleVQAChat = () => {
    setOpenVQAChat(!openVQAChat);
  };



  return (
    <div>
      <div className='flex justify-center items-center text-4xl font-bold m-12'>
        Where knowledge begins
      </div>
      <div className='flex  justify-center items-center'>
        <div className='w-[800px]  p-4 justify-center items-center rounded-md border-[1.5px] border-[#9DC08B]'>
          <textarea
            className='p-2 w-full resize-none overflow-hidden focus:right-0 focus:outline-none'
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
              searchResults && searchResults.length > 0 && (
                searchResults.map((result, idx) => {
                  return (
                    <div key={idx} className='z-0'>
                      <div className='my-4 flex items-center'>
                        <div>
                          <img src={result.image} alt={result.description} className='rounded-lg  w-[100px] h-[100px]' />
                        </div>
                        <div className='ml-4 flex flex-col justify-center w-full' >
                          <div className='flex justify-between items-center w-full mb-2'>
                            <div className='font-bold text-lg'>
                              <a href={`/destination/${result.id}`}>
                                {result.destination}
                              </a>
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
              )
            }
          </div>
        </div>
      </div >
      <button
        className="fixed bottom-4 right-4 font-bold rounded-full"
        onClick={handleVQAChat}
      >
        <AiFillMessage className="text-4xl text-[#9DC08B]" />
      </button>
      {
        openVQAChat && (
          <div className='fixed bottom-12 right-12 px-6 py-4 text-sm w-[400px] h-[500px] bg-white border-[1.5px] rounded-md border-[#9DC08B]  shadow-xl'>
            <Chat />
          </div>
        )
      }
    </div >
  );
}

