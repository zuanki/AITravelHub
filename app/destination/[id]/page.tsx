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
import { MdDelete } from "react-icons/md"; // Delete
import supabase from "@/lib/supabase";
import Markdown from "react-markdown";


const randomAnswers: string[] = [
    `- **Sushi:** *Delight in the exquisite flavors of Japan's iconic dish, sushi, with its perfect harmony of fresh fish, vinegared rice, and seaweed, showcasing the artistry of Japanese culinary tradition.*\n- **Manga:** *Immerse yourself in the captivating world of manga, where vivid illustrations and compelling storytelling converge, offering a unique and imaginative form of Japanese pop culture.*\n- **Cherry Blossoms:** *Witness the breathtaking beauty of cherry blossoms in spring, as these ephemeral flowers blanket the landscape in hues of pink, creating a magical and fleeting spectacle.*\n- **Samurai:** *Explore the rich history of Japan's legendary samurai warriors, known for their martial skills, honor code, and distinctive armor, leaving an indelible mark on the country's cultural heritage.*\n- **Zen Gardens:** *Find tranquility in the meticulous design of Zen gardens, where carefully arranged rocks, raked gravel, and lush greenery create a serene atmosphere, inviting contemplation and mindfulness.*`,
    `- **Tokyo:** *Experience the vibrant blend of modernity and tradition in Japan's bustling capital, featuring skyscrapers, historic temples, and the iconic Shibuya Crossing.*\n- **Kyoto:** *Immerse yourself in the cultural heart of Japan with Kyoto's traditional tea houses, ancient shrines, and stunning gardens, preserving the country's rich heritage.*\n- **Osaka:** *Indulge in culinary delights and entertainment in Osaka, known for its street food, vibrant nightlife, and the historic Osaka Castle.*\n- **Hakone:** *Escape to the serene landscapes of Hakone, offering hot springs, picturesque views of Mount Fuji, and traditional ryokan stays.*\n- **Hiroshima:** *Reflect on history at Hiroshima, home to the Peace Memorial Park and Museum, and explore the rejuvenated city symbolizing resilience and peace.*`,
    `- **寿司:** *楽しい日本の象徴、寿司の絶妙な味わいを堪能してください。新鮮な魚、酢飯、海藻の完璧なハーモニーが、日本料理の芸術を象徴しています。*\n- **マンガ:** *魅力的なマンガの世界に没頭し、鮮やかなイラストと引き込まれるストーリーテリングが交わり、ユニークで想像力豊かな日本のポップカルチャーを提供します。*\n- **桜:** *春の美しい桜の花々を目撃しましょう。これらの儚い花がピンクの色で風景を覆い、魔法のようで一瞬のスペクタクルを作り出します。*\n- **侍:** *伝説的な侍の武士の歴史を探索し、その武道、誠実なコード、特徴的な鎧で知られています。これらの戦士は、国の文化遺産に不可欠な印を残しました。*\n- **禅庭園:** *禅の庭園の緻密なデザインで静けさを見つけてください。注意深く配置された岩、櫛で整えられた砂利、豊かな緑が、静寂な雰囲気を作り出し、瞑想とマインドフルネスを招きます。*`
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

    // Handle Delete
    const handleDelete = (idx: number) => {
        // Remove idx from chat history
        const n_chatHistory = chatHistory.filter((_, index) => index !== idx);
        setChatHistory(n_chatHistory);
    }

    // Handle Copy to Clipboard
    const handleCopy = (idx: number) => {
        // Copy the bot response to clipboard
        navigator.clipboard.writeText(chatHistory[idx].botResponse);
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
                                                <div>
                                                    <Markdown className='whitespace-pre-line'>
                                                        {botResponses.join(' ')}
                                                    </Markdown>

                                                </div>

                                            ) : (

                                                <Markdown className='whitespace-pre-line'>
                                                    {message.botResponse}
                                                </Markdown>

                                            )
                                        }
                                    </div>
                                    <div className="flex justify-between mt-4 mb-8">
                                        <div className="flex justify-begin items-center">
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
                                        <div className="flex justify-begin items-center" >
                                            <button className="relative overflow-hidden transform hover:scale-110 transition-transform duration-300">
                                                <AiFillDislike className="inline-block mr-2 text-3xl p-2 hover:bg-[#9DC08B] rounded-full cursor-pointer" />
                                            </button>
                                            <button onClick={() => handleCopy(index)}>
                                                <LuClipboardCopy className="inline-block mr-2 text-3xl p-2 hover:bg-[#9DC08B] rounded-full cursor-pointer" />
                                            </button>
                                            <button onClick={() => handleDelete(index)}>
                                                <MdDelete className="inline-block mr-2 text-3xl p-2 hover:bg-[#9DC08B] rounded-full cursor-pointer" />
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

        </div >
    )
}