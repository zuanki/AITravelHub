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

const data = [
    {
        score: 0.5,
        id: '1',
        name: 'Tokyo',
        subtitle: 'Tokyo is the capital of Japan.',
        description:
            `Tokyo (東京, Tōkyō) is Japan's capital and the world's most populous metropolis. It is also one of Japan's 47 prefectures, consisting of 23 central city wards and multiple cities, towns and villages west of the city center. The Izu and Ogasawara Islands are also part of Tokyo.\nPrior to 1868, Tokyo was known as Edo. Previously a small castle town, Edo became Japan's political center in 1603 when Tokugawa Ieyasu established his feudal government there. A few decades later, Edo had grown into one of the world's largest cities. With the Meiji Restoration of 1868, the emperor and capital moved from Kyoto to Edo, which was renamed Tokyo ("Eastern Capital"). Large parts of Tokyo were destroyed in the Great Kanto Earthquake of 1923 and the air raids of 1945.\nToday, Tokyo offers a seemingly unlimited choice of shopping, entertainment, culture and dining to its visitors. The city's history can be appreciated in districts such as Asakusa and in many excellent museums, historic temples and gardens. Contrary to common perception, Tokyo also offers a number of attractive green spaces in the city center and within relatively short train rides at its outskirts.\nTokyo (東京, Tōkyō) is Japan's capital and the world's most populous metropolis. It is also one of Japan's 47 prefectures, consisting of 23 central city wards and multiple cities, towns and villages west of the city center. The Izu and Ogasawara Islands are also part of Tokyo.\nPrior to 1868, Tokyo was known as Edo. Previously a small castle town, Edo became Japan's political center in 1603 when Tokugawa Ieyasu established his feudal government there. A few decades later, Edo had grown into one of the world's largest cities. With the Meiji Restoration of 1868, the emperor and capital moved from Kyoto to Edo, which was renamed Tokyo ("Eastern Capital"). Large parts of Tokyo were destroyed in the Great Kanto Earthquake of 1923 and the air raids of 1945.\nToday, Tokyo offers a seemingly unlimited choice of shopping, entertainment, culture and dining to its visitors. The city's history can be appreciated in districts such as Asakusa and in many excellent museums, historic temples and gardens. Contrary to common perception, Tokyo also offers a number of attractive green spaces in the city center and within relatively short train rides at its outskirts.`,
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

export default function Page({ params }: { params: { id: string } }) {
    const post = data.find((post) => post.id === params.id);

    const [userQuery, setUserQuery] = useState('');
    const [botResponses, setBotResponses] = useState<string[]>([]);
    const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);

    if (!post) {
        return <div>Not found</div>;
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
            // const response = await axios.post('https://0baa-34-16-180-63.ngrok-free.app/chat', {
            //     message: question
            // });
            // const result = response.data.result;

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
        await getAnswer(userQuery);
        setUserQuery('');
    };


    return (
        <div>
            <div className="mb-64">
                <img
                    className="w-full h-60 object-cover"
                    src={post.link_image}
                    alt={post.name}
                />

                <div className="flex justify-between items-center">
                    <div className="w-[800px] m-auto p-4">
                        <div className="text-4xl font-bold">
                            {post.name}
                        </div>
                        <div className="flex justify-between items-center mt-4">
                            <div className="flex items-center">
                                <h3>
                                    {post.subtitle}
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
                                            <button className="flex justify-begin items-center hover:bg-[#9DC08B] rounded-full cursor-pointer pr-4" >
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