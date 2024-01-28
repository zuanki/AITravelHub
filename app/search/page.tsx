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
import { TbGridDots } from 'react-icons/tb';
import { AiOutlineLike } from 'react-icons/ai';
import { AiOutlineDislike } from 'react-icons/ai';
import { AiFillMessage } from 'react-icons/ai';
import { NextUIProvider, Skeleton } from '@nextui-org/react';
import { FaChevronLeft } from "react-icons/fa";
import { FaChevronRight } from "react-icons/fa";
import { SearchResult } from '@/types/search-result';
import Chat from '../components/vqachat';
import { mockChatBotAnswers, mockSearchResults } from '@/public/data/mockData'; // Mock data for skeleton loading

const getCurrentDatetime = (): string => {
    const date = new Date();
    return moment(date).format('YYYY-MM-DD_HH:mm:ss');
};

export default function Search() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

    const [searchInput, setSearchInput] = useState<string>('');

    const [previousInput, setPreviousInput] = useState<string>('');

    const [blobUrl, setBlobUrl] = useState<string>('');

    const [urlImage, setUrlImage] = useState<string>('');

    const [isSubmit, setIsSubmit] = useState<boolean>(false);

    const [isLoaded, setIsLoaded] = useState<boolean>(true);

    const [isBusy, setIsBusy] = useState<boolean>(false);

    const router = useRouter();

    const [fileImage, setFileImage] = useState<File | null>(null);

    const addFileImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        clearSearchResults();
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
        setIsBusy(false);
    };

    // Handle keydown
    const handleKeyDown = async (
        event:
            | React.KeyboardEvent<HTMLInputElement>
            | React.MouseEvent<HTMLButtonElement>
            | React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
        if (event.type === 'click') {
            setIsLoaded(false);
            setSearchResults(mockSearchResults);
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.value = '';
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            }
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
                .post('https://milvus-server.onrender.com/api/search', dataForm)
                .then((response) => {
                    if (response.data === 'Server is busy!') {
                        setIsBusy(true);
                    } else {
                        setSearchResults(response.data.slice(0, 20));
                        setIsLoaded(true);
                        setIsBusy(false);
                    }
                })
                .catch((error) => {
                    console.log(error);
                });

            if (blobUrl != '') {
                URL.revokeObjectURL(blobUrl);
                setBlobUrl('');
            }
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


    const [imageIndex, setImageIndex] = useState<number[]>([]);

    // Initialize imageIndex
    useEffect(() => {
        let temp: number[] = [];
        for (let i = 0; i < searchResults.length; i++) {
            temp.push(0);
        }
        setImageIndex(temp);
    }, [searchResults]);

    // Handle click on left arrow
    const handleLeftArrow = (idx: number) => {
        if (imageIndex[idx] > 0) {
            setImageIndex((prev) => {
                let temp = [...prev];
                temp[idx] -= 1;
                return temp;
            });
        } else {
            setImageIndex((prev) => {
                let temp = [...prev];
                temp[idx] = searchResults[idx].image.length - 1;
                return temp;
            });
        }
    };

    // Handle click on right arrow
    const handleRightArrow = (idx: number) => {
        if (imageIndex[idx] < searchResults[idx].image.length - 1) {
            setImageIndex((prev) => {
                let temp = [...prev];
                temp[idx] += 1;
                return temp;
            });
        } else {
            setImageIndex((prev) => {
                let temp = [...prev];
                temp[idx] = 0;
                return temp;
            });
        }
    };

    return (
        <NextUIProvider>
            <div className='m-12 flex items-center justify-center text-4xl font-bold'>Where knowledge begins</div>
            <div className='flex  items-center justify-center'>
                <div className='w-[800px]  items-center justify-center rounded-md border-[1.5px] border-[#9DC08B] p-4'>
                    <textarea
                        ref={textareaRef}
                        className='w-full resize-none overflow-hidden p-2 focus:right-0 focus:outline-none'
                        placeholder='Ask anything . . .'
                        onInput={autoResize}
                        value={searchInput}
                        onChange={(e) => {
                            setSearchInput(e.target.value);
                            clearSearchResults();
                        }}
                        onKeyDown={handleKeyDown}
                    />
                    <div className=''>
                        <input
                            ref={fileInputRef}
                            type='file'
                            name='file'
                            id='file'
                            hidden
                            onChange={(e) => addFileImage(e)}
                        />
                        {fileImage && (
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
                        )}
                        <div className='flex items-center justify-between'>
                            <label
                                htmlFor='file'
                                className='flex cursor-pointer items-center justify-between rounded-full px-2 py-1 font-medium hover:bg-[#9DC08B]'
                            >
                                <FiPlusCircle className='text-md' />
                                <p className='ml-2'>Attach</p>
                            </label>
                            <button type='button' onClick={handleKeyDown}>
                                <div className='cursor-pointer rounded-full p-2 hover:bg-[#9DC08B]'>
                                    <BsArrowRightCircleFill className='text-xl' />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className='mt-10 flex items-center justify-center'>
                <div className='w-[800px] '>
                    <div className='text-xl font-bold'>
                        {
                            urlImage && (
                                <div className=''>
                                    <img src={urlImage} alt='url image' className='h-[100px] w-[155px] mb-4 rounded-lg' />
                                </div>
                            )
                        }
                        <div className='flex items-center'>
                            <TbGridDots />
                            <p className='ml-2'>Search Results</p>
                        </div>
                    </div>
                    {isBusy ? (
                        <div>
                            <div className='mt-16 flex items-center justify-center text-red-400'>
                                <div className='text-xl font-bold'>Server is busy! Please try again later.</div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {searchResults &&
                                searchResults.length > 0 &&
                                searchResults.map((result, idx) => {
                                    return (
                                        <div key={idx} className='z-0'>
                                            <div className='my-4 flex items-center'>
                                                <Skeleton isLoaded={isLoaded} className='rounded-md'>
                                                    <div className='relative'>
                                                        <img
                                                            src={result.image[imageIndex[idx]]}
                                                            alt={result.description}
                                                            className='h-[100px] w-[200px] rounded-lg'
                                                        />
                                                        {searchResults[idx].image.length > 1 && (
                                                            <div className='flex items-center justify-between absolute inset-0'>
                                                                <button
                                                                    onClick={() => handleLeftArrow(idx)}
                                                                    className='arrow-button left-arrow opacity-0 group-hover:opacity-100 transition-opacity'
                                                                >
                                                                    <FaChevronLeft className='text-xl text-[#9DC08B]' />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRightArrow(idx)}
                                                                    className='arrow-button right-arrow opacity-0 group-hover:opacity-100 transition-opacity'
                                                                >
                                                                    <FaChevronRight className='text-xl text-[#9DC08B]' />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </Skeleton>
                                                <div className='ml-4 flex w-full flex-col justify-center'>
                                                    <div className='mb-2 flex w-full items-center justify-between'>
                                                        <Skeleton isLoaded={isLoaded} className='rounded-md'>
                                                            <div className='text-lg font-bold'>
                                                                <a href={`/destination/${result.id[0]}`}>
                                                                    {result.destination}
                                                                </a>
                                                            </div>
                                                        </Skeleton>
                                                        <div className='text-xs font-bold'>
                                                            <Skeleton isLoaded={isLoaded} className='rounded-md'>
                                                                <div className='flex items-center'>
                                                                    <AiOutlineLike className='text-xl text-[#9DC08B]' />
                                                                    <p className='ml-2'>1.2k</p>

                                                                    <AiOutlineDislike className='ml-4 text-xl text-[#9DC08B]' />
                                                                    <p className='ml-2'>1.2k</p>
                                                                </div>
                                                            </Skeleton>
                                                        </div>
                                                    </div>
                                                    <Skeleton isLoaded={isLoaded} className='rounded-md'>
                                                        <div className='text-sm'>
                                                            {truncate(result.description, 250)}
                                                        </div>
                                                    </Skeleton>
                                                </div>
                                            </div>
                                            <hr className='border-[#9DC08B]' />
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </div>
            </div>
            <button className='fixed bottom-4 right-4 rounded-full font-bold' onClick={handleVQAChat}>
                <AiFillMessage className='text-4xl text-[#9DC08B]' />
            </button>
            {openVQAChat && (
                <div className='fixed bottom-12 right-12 h-[510px] w-[400px] rounded-md border-[1.5px] border-[#9DC08B] bg-white px-6 py-4 text-sm shadow-xl'>
                    <Chat />
                </div>
            )}
        </NextUIProvider>
    );
}
