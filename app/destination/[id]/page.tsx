'use client';
import { BsArrowUpCircleFill } from 'react-icons/bs';
import React, { useState, useRef } from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import { SiCodemagic } from 'react-icons/si';
import { HiArrowPathRoundedSquare } from 'react-icons/hi2'; // Rewrite
import { AiFillDislike } from 'react-icons/ai'; // Dislike
import { LuClipboardCopy } from 'react-icons/lu'; // Copy
import { MdDelete } from 'react-icons/md'; // Delete
import supabase from '@/lib/supabase';
import Markdown from 'react-markdown';
import { NextUIProvider, Skeleton } from '@nextui-org/react';
import { FaChevronLeft } from "react-icons/fa";
import { FaChevronRight } from "react-icons/fa";
import { SearchResult } from '@/types/search-result';
import { Post } from '@/types/post';
import { ChatHistory } from '@/types/chatbot';
import { formatLink } from '@/utils/utils';
import { mockChatBotAnswers, mockSearchResults } from '@/public/data/mockData'; // Mock Data for skeleton loading

let previousChatHistory: ChatHistory[] = [];

export default function Page({ params }: { params: { id: string } }) {
    // const post = data.find((post) => post.id === params.id);
    // Query the database for a single post by id
    const [post, setPost] = useState<Post | null>(null);
    const [userQuery, setUserQuery] = useState('');
    const [botResponses, setBotResponses] = useState<string[]>([]);
    const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);

    // Recomended Destinations
    const [recommendedDestinations, setRecommendedDestinations] = useState<SearchResult[]>([]);
    const [isLoaded, setIsLoaded] = useState(true);
    const [isAsked, setIsAsked] = useState(true);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [imageIndex, setImageIndex] = useState<number[]>([]);

    useEffect(() => {
        const getPost = async () => {
            try {
                setIsLoaded(false);
                setRecommendedDestinations(mockSearchResults);

                const destinationRoot = await supabase
                    .from('destinations')
                    .select('id, title, destination, image, description')
                    .eq('id', params.id)
                const { data } = destinationRoot;
                if (data && data.length > 0) {
                    setPost(data[0]);

                    const dataFormImage = {
                        query: data[0].image,
                        type: 'image',
                    };

                    const dataFormText = {
                        query: data[0].destination,
                        type: 'text',
                    };

                    let mixRecommendation: SearchResult[] = [];
                    let temp: number[] = [];


                    const resImage = await axios.post('https://milvus-server.onrender.com/api/search', dataFormImage)
                    let limit = 5;
                    if (Array.isArray(resImage.data)) mixRecommendation = [...mixRecommendation, ...resImage.data.slice(1, limit + 1)];
                    for (let i = 0; i < resImage.data.length; i++) {
                        temp.push(0);
                    }

                    const resText = await axios.post('https://milvus-server.onrender.com/api/search', dataFormText)
                    if (Array.isArray(resText.data)) mixRecommendation = [...mixRecommendation, ...resText.data.slice(1, limit + 1)];
                    for (let i = 0; i < resText.data.length; i++) {
                        temp.push(0);
                    }

                    setImageIndex(temp);
                    setIsLoaded(true);
                    setRecommendedDestinations([...mixRecommendation]);
                }

            } catch (error) {
                console.error(error);
            }
        };

        getPost();
    }, []);

    if (!post) {
        return (
            <div className='flex h-screen items-center justify-center'>
                <div role='status'>
                    <svg
                        aria-hidden='true'
                        className='inline h-8 w-8 animate-spin fill-green-500 text-gray-200 dark:text-gray-600'
                        viewBox='0 0 100 101'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                    >
                        <path
                            d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                            fill='currentColor'
                        />
                        <path
                            d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                            fill='currentFill'
                        />
                    </svg>
                    <span className='sr-only'>Loading...</span>
                </div>
            </div>
        );
    }

    // Auto Resize Textarea
    const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    };

    // Handle Input Change
    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setUserQuery(event.target.value);
    };

    // Get Answer
    const getAnswer = async (question: string) => {
        try {
            setIsAsked(false);
            const skeletonResult = mockChatBotAnswers[Math.floor(Math.random() * mockChatBotAnswers.length)];

            // Store user and bot messages in chat history
            previousChatHistory = [...chatHistory];
            setChatHistory([...chatHistory, { userQuery: userQuery, botResponse: skeletonResult }]);

            supabase
                .from('Server')
                .select('server_url')
                .eq('server_name', 'Colab_Chatbot')
                .then((r) => {
                    if (r.data && r.data.length > 0) {
                        axios
                            .post(r.data[0].server_url + '/chat/completions', {
                                context: truncateDescription(post.description),
                                userQuery: question,
                            })
                            .then((res) => {
                                const result = res.data.result;
                                console.log(result);

                                // Store user and bot messages in chat history
                                setIsAsked(true);

                                // Split the result into an array of words
                                const words = result.split(' ');

                                // Display words one by one at intervals
                                for (let i = 0; i < words.length; i++) {
                                    setTimeout(
                                        () => {
                                            setBotResponses((prevAnswers) => [...prevAnswers, words[i]]);
                                            if (i === words.length - 1) {
                                                // Reset bot answers
                                                setChatHistory([...previousChatHistory, { userQuery: userQuery, botResponse: result }]);
                                                setUserQuery('');
                                            }
                                        },
                                        Math.floor(Math.random() * 50) + 50 * i
                                    );
                                }
                            });
                    }
                });
        } catch (error) {
            console.error('Error fetching bot response:', error);
        }
    };

    // Handle Button Click
    const handleButtonClick = async () => {
        if (!userQuery) return;
        if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.value = '';
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }

        setBotResponses([]);
        await getAnswer(userQuery);
    };

    // Truncate context (description) to 1000 characters
    const truncateDescription = (description: string) => {
        return description.length > 1000 ? description.substring(0, 1000) + '...' : description;
    };

    // Handle Rewriting
    const handleRewriting = async (idx: number) => {
        setIsAsked(false);
        const question = chatHistory[idx].userQuery;
        // Remove all from idx to the end
        const n_chatHistory = chatHistory.slice(0, idx + 1);

        supabase
            .from('Server')
            .select('server_url')
            .eq('server_name', 'Colab_Chatbot')
            .then((r) => {
                if (r.data && r.data.length > 0) {
                    const response = axios
                        .post(r.data[0].server_url + '/chat/completions', {
                            context: truncateDescription(post.description),
                            userQuery: question,
                        })
                        .then((res) => {
                            const result = res.data.result;
                            console.log(result);
                            // Split the result into an array of words
                            const words = result.split(' ');

                            // Display words one by one at intervals
                            for (let i = 0; i < words.length; i++) {
                                setTimeout(
                                    () => {
                                        setBotResponses((prevAnswers) => [...prevAnswers, words[i]]);
                                    },
                                    Math.floor(Math.random() * 50) + 50 * i
                                );
                            }

                            // Store user and bot messages in chat history
                            n_chatHistory[n_chatHistory.length - 1].botResponse = result;

                            // Reset bot answers
                            setBotResponses([]);

                            // Update chat history
                            setChatHistory(n_chatHistory);
                            setIsAsked(true);
                        });
                }
            });
    };

    // Handle Delete
    const handleDelete = (idx: number) => {
        // Remove idx from chat history
        const n_chatHistory = chatHistory.filter((_, index) => index !== idx);
        const len = n_chatHistory.length;
        if (len > 0) setBotResponses([n_chatHistory[len - 1].botResponse]);
        setChatHistory(n_chatHistory);
    };

    // Handle Copy to Clipboard
    const handleCopy = (idx: number) => {
        // Copy the bot response to clipboard
        navigator.clipboard.writeText(chatHistory[idx].botResponse);
    };


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
                temp[idx] = recommendedDestinations[idx].image.length - 1;
                return temp;
            });
        }
    };

    // Handle click on right arrow
    const handleRightArrow = (idx: number) => {
        if (imageIndex[idx] < recommendedDestinations[idx].image.length - 1) {
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
            <div className='mb-64'>
                <img className='h-80 w-full object-cover' src={formatLink(post.image)} alt={post.destination} />

                <div className='flex justify-between'>
                    <div className='w-2/3 p-10'>
                        <div className='text-4xl font-bold'>{post.destination}</div>
                        <div className='mt-4 flex items-center justify-between'>
                            <div className='flex items-center'>
                                <h3>{post.title}</h3>
                            </div>
                        </div>

                        <div className='mt-4 whitespace-pre-line text-sm text-gray-500'>{post.description}</div>
                        <hr className='my-4 border-[1.5px] border-[#9DC08B]' />
                        {chatHistory.map((message, index) => (
                            <div key={message.botResponse} className=' w-full text-sm'>
                                <div className='my-4 text-2xl font-semibold'>{message.userQuery}</div>
                                <div className='my-1'>
                                    <div className='justify-begin my-2 flex  items-center font-semibold'>
                                        <SiCodemagic className='mr-2 inline-block text-sm' />
                                        <div className='text-lg'>Answer</div>
                                    </div>
                                    {index === chatHistory.length - 1 ? (
                                        <>
                                            <Skeleton isLoaded={isAsked} className='rounded-md'>
                                                <Markdown className='whitespace-pre-line'>
                                                    {botResponses.join(' ')}
                                                </Markdown>
                                            </Skeleton>
                                            {isAsked === false ? (
                                                <>
                                                    <Skeleton isLoaded={false} className='mt-3 rounded-md'>
                                                        <Markdown className='whitespace-pre-line'>
                                                            Skeleton appear
                                                        </Markdown>
                                                    </Skeleton>
                                                    <Skeleton
                                                        isLoaded={false}
                                                        className='mt-3 w-3/5 rounded-md py-2'
                                                    ></Skeleton>
                                                </>
                                            ) : null}
                                        </>
                                    ) : (
                                        <Markdown className='whitespace-pre-line'>{message.botResponse}</Markdown>
                                    )}
                                </div>
                                {isAsked === true || index !== chatHistory.length - 1 ? (
                                    <div className='mb-8 mt-4 flex justify-between'>
                                        <div className='justify-begin flex items-center'>
                                            {index === chatHistory.length - 1 ? (
                                                <button
                                                    className='justify-begin flex cursor-pointer items-center rounded-full pr-4 hover:bg-[#9DC08B]'
                                                    onClick={() => handleRewriting(index)}
                                                >
                                                    <HiArrowPathRoundedSquare className='inline-block p-2 text-3xl ' />
                                                    <div>Rewrite</div>
                                                </button>
                                            ) : null}
                                        </div>

                                        <div className='justify-begin flex items-center'>
                                            <button className='relative transform overflow-hidden transition-transform duration-300 hover:scale-110'>
                                                <AiFillDislike className='mr-2 inline-block cursor-pointer rounded-full p-2 text-3xl hover:bg-[#9DC08B]' />
                                            </button>
                                            <button onClick={() => handleCopy(index)}>
                                                <LuClipboardCopy className='mr-2 inline-block cursor-pointer rounded-full p-2 text-3xl hover:bg-[#9DC08B]' />
                                            </button>
                                            <button onClick={() => handleDelete(index)}>
                                                <MdDelete className='mr-2 inline-block cursor-pointer rounded-full p-2 text-3xl hover:bg-[#9DC08B]' />
                                            </button>
                                        </div>
                                    </div>
                                ) : null}
                                <hr className='my-4 border-[1.5px] border-[#9DC08B]' />
                            </div>
                        ))}
                    </div>
                    <div className='w-1/3 p-10'>
                        <div className='text-2xl font-bold'>Maybe you are interested in</div>
                        <div className='mt-4 rounded-md border-[1.5px] border-[#9DC08B]'>
                            {recommendedDestinations.map((destination, index) => (
                                <div className=' hover:bg-[#9DC08B]' key={index}>
                                    <div className='flex justify-between p-4'>
                                        <div className='w-4/5'>
                                            <Skeleton isLoaded={isLoaded} className='mb-2 mr-16 rounded-md text-lg'>
                                                <div className='text-lg font-semibold cursor-pointer'>
                                                    <a href={`/destination/${destination.id[0]}`}>
                                                        {destination.destination}
                                                    </a>
                                                </div>
                                            </Skeleton>
                                            <Skeleton isLoaded={isLoaded} className='mr-2 rounded-md pb-4 text-sm'>
                                                <div className='text-sm'>{destination.title}</div>
                                            </Skeleton>
                                        </div>
                                        <Skeleton isLoaded={isLoaded} className='rounded-md'>
                                            {/* <img
                                                className='h-[100px] w-[200px] rounded-md'
                                                src={destination.image[0]}
                                                alt={destination.destination}
                                            /> */}
                                            <div className='relative'>
                                                <img
                                                    src={destination.image[imageIndex[index]]}
                                                    alt={destination.description}
                                                    className='h-[100px] w-[200px] rounded-lg'
                                                />
                                                {recommendedDestinations[index].image.length > 1 && (
                                                    <div className='flex items-center justify-between absolute inset-0'>
                                                        <button
                                                            onClick={() => handleLeftArrow(index)}
                                                            className='arrow-button left-arrow opacity-0 group-hover:opacity-100 transition-opacity'
                                                        >
                                                            <FaChevronLeft className='text-xl text-[#9DC08B]' />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRightArrow(index)}
                                                            className='arrow-button right-arrow opacity-0 group-hover:opacity-100 transition-opacity'
                                                        >
                                                            <FaChevronRight className='text-xl text-[#9DC08B]' />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </Skeleton>
                                    </div>
                                    {index !== recommendedDestinations.length - 1 && (
                                        <hr className='w-full border-1 border-[#9DC08B]' />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className='fixed  bottom-0 left-0 flex w-full items-center justify-center'>
                <div className='m-4 flex w-[600px] rounded-xl border-2 bg-white p-1'>
                    <textarea
                        ref={textareaRef}
                        className='flex-grow resize-none overflow-hidden rounded-xl p-2 text-sm focus:right-0 focus:outline-none'
                        placeholder='Ask a follow-up . . .'
                        onInput={autoResize}
                        value={userQuery}
                        onChange={handleInputChange}
                    />
                    <button onClick={handleButtonClick}>
                        <BsArrowUpCircleFill className='mr-2 inline-block cursor-pointer rounded-full p-2 text-4xl hover:bg-[#9DC08B]' />
                    </button>
                </div>
            </div>
        </NextUIProvider>
    );
}
