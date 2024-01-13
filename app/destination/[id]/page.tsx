'use client';
import { BsArrowUpCircleFill } from "react-icons/bs";
import React, { useState } from 'react';
import axios from "axios";
import { SiCodemagic } from "react-icons/si";
import { FaShare } from "react-icons/fa"; // Share
import { HiArrowPathRoundedSquare } from "react-icons/hi2"; // Rewrite
import { AiFillDislike } from "react-icons/ai"; // Dislike
import { LuClipboardCopy } from "react-icons/lu"; // Copy
import { FaRegEdit } from "react-icons/fa"; // Edit Question
import { BsThreeDots } from "react-icons/bs"; // Delete
import supabase from "@/lib/supabase";


const randomAnswers: string[] = [
    'The TinyLlama project aims to pretrain a 1.1B Llama model on 3 trillion tokens. With some proper optimization, we can achieve this within a span of "just" 90 days using 16 A100-40G GPUs 🚀🚀. The training has started on 2023-09-01.',
    'We adopted exactly the same architecture and tokenizer as Llama 2. This means TinyLlama can be plugged and played in many open-source projects built upon Llama. Besides, TinyLlama is compact with only 1.1B parameters. This compactness allows it to cater to a multitude of applications demanding a restricted computation and memory footprint.',
    'A large language model (LLM) is a large-scale language model notable for its ability to achieve general-purpose language understanding and generation. LLMs acquire these abilities by using massive amounts of data to learn billions of parameters during training and consuming large computational resources during their training and operation.[1] LLMs are artificial neural networks (mainly transformers[2]) and are (pre)trained using self-supervised learning and semi-supervised learning.',
    'Using a modification of byte-pair encoding, in the first step, all unique characters (including blanks and punctuation marks) are treated as an initial set of n-grams (i.e. initial set of uni-grams). Successively the most frequent pair of adjacent characters is merged into a bi-gram and all instances of the pair are replaced by it. All occurrences of adjacent pairs of (previously merged) n-grams that most frequently occur together are then again merged into even lengthier n-gram repeatedly until a vocabulary of prescribed size is obtained (in case of GPT-3, the size is 50257).[6] Token vocabulary consists of integers, spanning from zero up to the size of the token vocabulary. New words can always be interpreted as combinations of the tokens and the initial-set uni-grams.[7]',
    'Removal of toxic passages from the dataset, discarding low-quality data, and de-duplication are examples of dataset cleaning.[10] Resulting, cleaned (high-quality) datasets contain up to 17 trillion words in 2022, raising from 985 million words, used in 2018 for GPT-1,[11] and 3.3 billion words, used for BERT.[12] The future data is, however, expected to be increasingly "contaminated" by LLM-generated contents themselves.[13]'
]

type ChatHistory = {
    userQuery: string;
    botResponse: string;
};

type Post = {
    id: string;
    title: string;
    destination: string;
    image: string;
    description: string;
};



export default function Page({ params }: { params: { id: string } }) {
    // const post = data.find((post) => post.id === params.id);
    // Query the database for a single post by id
    const [post, setPost] = useState<Post | null>(null);
    React.useEffect(() => {
        async function getPost() {
            const { data } = await supabase
                .from('destinations')
                .select('id, title, destination, image, description')
                .eq('id', params.id)
                .single();
            setPost(data);
        }
        getPost();
    }, [params.id]);

    const [userQuery, setUserQuery] = useState('');
    const [botResponses, setBotResponses] = useState<string[]>([]);
    const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);

    if (!post) {
        return (
            <div className="flex h-screen justify-center items-center">
                <div role="status">
                    <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-green-500" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                    </svg>
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        )
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
            // supabase.from("Server").select("server_url").eq("server_name", "Colab_Chatbot").then((r) => {
            //     if (r.data && r.data.length > 0) {
            //         const response = axios.post(r.data[0].server_url + '/chat/completions', {
            //             context: truncateDescription(post.description),
            //             userQuery: question
            //         }).then((res) => {
            //             const result = res.data.result;
            //             console.log(result);
            //             // Split the result into an array of words
            //             const words = result.split(' ');

            //             // Display words one by one at intervals
            //             for (let i = 0; i < words.length; i++) {
            //                 setTimeout(() => {
            //                     setBotResponses(prevAnswers => [
            //                         ...prevAnswers,
            //                         words[i]
            //                     ]);
            //                 }, Math.floor(Math.random() * 50) + 50 * i);
            //             }

            //             // Store user and bot messages in chat history
            //             setChatHistory([
            //                 ...chatHistory,
            //                 { userQuery: userQuery, botResponse: result }
            //             ]);

            //             // Reset bot answers
            //             setBotResponses([]);
            //         });
            //     }
            // });

            // Test
            const result =
                randomAnswers[Math.floor(Math.random() * randomAnswers.length)];

            // Split the result into an array of words
            const words = result.split(' ');

            // Display words one by one at intervals
            for (let i = 0; i < words.length; i++) {
                setTimeout(() => {
                    setBotResponses(prevAnswers => [
                        ...prevAnswers,
                        words[i]
                    ]);
                }, Math.floor(Math.random() * 50) + 50 * i);
            }

            // Store user and bot messages in chat history
            setChatHistory([
                ...chatHistory,
                { userQuery: userQuery, botResponse: result }
            ]);

            // Reset bot answers
            setBotResponses([]);
        } catch (error) {
            console.error('Error fetching bot response:', error);
        }
    };

    // Handle Button Click
    const handleButtonClick = async () => {
        if (!userQuery) return;
        await getAnswer(userQuery);
        setUserQuery('');
    };

    // Truncate context (description) to 1000 characters
    const truncateDescription = (description: string) => {
        return description.length > 1000
            ? description.substring(0, 1000) + '...'
            : description;
    }

    // Handle Rewriting
    const handleRewriting = async (idx: number) => {
        const question = chatHistory[idx].userQuery;
        // Remove all from idx to the end
        const n_chatHistory = chatHistory.slice(0, idx + 1);

        // Modify the last message
        const result = randomAnswers[Math.floor(Math.random() * randomAnswers.length)];

        // Split the result into an array of words
        const words = result.split(' ');

        // Display words one by one at intervals
        for (let i = 0; i < words.length; i++) {
            setTimeout(() => {
                setBotResponses(prevAnswers => [
                    ...prevAnswers,
                    words[i]
                ]);
            }, Math.floor(Math.random() * 50) + 50 * i);
        }

        // Store user and bot messages in chat history
        n_chatHistory[n_chatHistory.length - 1].botResponse = result;

        // Reset bot answers
        setBotResponses([]);

        // Update chat history
        setChatHistory(n_chatHistory);
    }


    return (
        <div>
            <div className="mb-64">
                <img
                    className="w-full h-60 object-cover"
                    src={post.image}
                    alt={post.destination}
                />

                <div className="flex justify-between items-center">
                    <div className="w-[800px] m-auto p-4">
                        <div className="text-4xl font-bold">
                            {post.destination}
                        </div>
                        <div className="flex justify-between items-center mt-4">
                            <div className="flex items-center">
                                <h3>
                                    {post.title}
                                </h3>
                            </div>

                        </div>

                        <div className="text-sm mt-4 text-gray-500 whitespace-pre-line">
                            {post.description}
                        </div>
                        <hr className="my-4 border-[1.5px] border-[#9DC08B]" />
                        {
                            chatHistory.map((message, index) => (
                                <div key={index} className=" text-sm w-full">
                                    <div className='my-4 font-semibold text-2xl'>
                                        {message.userQuery}
                                    </div>
                                    <div className='my-1'>
                                        <div className="flex justify-begin items-center  my-2 font-semibold">
                                            <SiCodemagic className="inline-block mr-2 text-sm" />
                                            <div className="text-lg">Answer</div>
                                        </div>
                                        {
                                            index === chatHistory.length - 1 ? (
                                                <p>
                                                    {

                                                        botResponses.map((answer, index) => (
                                                            <span key={index}>{answer} </span>
                                                        ))

                                                    }
                                                </p>
                                            ) : (
                                                <p>
                                                    {message.botResponse}
                                                </p>
                                            )
                                        }
                                    </div>
                                    <div className="flex justify-between mt-4 mb-8">
                                        <div className="flex justify-begin items-center">
                                            <button className="flex justify-begin items-center hover:bg-[#9DC08B] rounded-full cursor-pointer pr-4" >
                                                <FaShare className="inline-block text-3xl p-2 " />
                                                <div>
                                                    Share
                                                </div>
                                            </button>
                                            <button
                                                className="flex justify-begin items-center hover:bg-[#9DC08B] rounded-full cursor-pointer pr-4"
                                                onClick={() => handleRewriting(index)}
                                            >
                                                <HiArrowPathRoundedSquare className="inline-block text-3xl p-2 " />
                                                <div>
                                                    Rewrite
                                                </div>
                                            </button>
                                        </div>
                                        <div>
                                            <button>
                                                <AiFillDislike className="inline-block mr-2 text-3xl p-2 hover:bg-[#9DC08B] rounded-full cursor-pointer" />
                                            </button>
                                            <button>
                                                <LuClipboardCopy className="inline-block mr-2 text-3xl p-2 hover:bg-[#9DC08B] rounded-full cursor-pointer" />
                                            </button>
                                            <button>
                                                <FaRegEdit className="inline-block mr-2 text-3xl p-2 hover:bg-[#9DC08B] rounded-lg cursor-pointer" />
                                            </button>
                                            <button>
                                                <BsThreeDots className="inline-block mr-2 text-3xl p-2 hover:bg-[#9DC08B] rounded-full cursor-pointer" />
                                            </button>
                                        </div>
                                    </div>
                                    <hr className="my-4 border-[1.5px] border-[#9DC08B]" />
                                </div>
                            ))
                        }
                    </div>

                </div>

            </div>

            <div className="fixed  bottom-0 left-0 w-full flex justify-center items-center">
                <div className="flex bg-white rounded-xl border-2 p-1 m-4 w-[600px]">
                    <textarea
                        className="flex-grow rounded-xl p-2 text-sm resize-none overflow-hidden focus:right-0 focus:outline-none"
                        placeholder="Ask a follow-up . . ."
                        onInput={autoResize}
                        value={userQuery}
                        onChange={handleInputChange}
                    />
                    <button onClick={handleButtonClick}>
                        <BsArrowUpCircleFill className="inline-block mr-2 text-4xl p-2 hover:bg-[#9DC08B] rounded-full cursor-pointer" />
                    </button>
                </div>
            </div>

        </div>
    )
}