'use client';
import { BsArrowUpCircleFill } from 'react-icons/bs';
import React, { useState, useRef } from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import { SiCodemagic } from 'react-icons/si';
import { FaShare } from 'react-icons/fa'; // Share
import { HiArrowPathRoundedSquare } from 'react-icons/hi2'; // Rewrite
import { AiFillDislike } from 'react-icons/ai'; // Dislike
import { LuClipboardCopy } from 'react-icons/lu'; // Copy
import { FaRegEdit } from 'react-icons/fa'; // Edit Question
import { MdDelete } from 'react-icons/md'; // Delete
import supabase from '@/lib/supabase';
import Markdown from 'react-markdown';
import { NextUIProvider, Skeleton } from '@nextui-org/react';

const randomAnswers: string[] = [
    `- **Sushi:** *Delight in the exquisite flavors of Japan's iconic dish, sushi, with its perfect harmony of fresh fish, vinegared rice, and seaweed, showcasing the artistry of Japanese culinary tradition.*\n- **Manga:** *Immerse yourself in the captivating world of manga, where vivid illustrations and compelling storytelling converge, offering a unique and imaginative form of Japanese pop culture.*\n- **Cherry Blossoms:** *Witness the breathtaking beauty of cherry blossoms in spring, as these ephemeral flowers blanket the landscape in hues of pink, creating a magical and fleeting spectacle.*\n- **Samurai:** *Explore the rich history of Japan's legendary samurai warriors, known for their martial skills, honor code, and distinctive armor, leaving an indelible mark on the country's cultural heritage.*\n- **Zen Gardens:** *Find tranquility in the meticulous design of Zen gardens, where carefully arranged rocks, raked gravel, and lush greenery create a serene atmosphere, inviting contemplation and mindfulness.*`,
    `- **Tokyo:** *Experience the vibrant blend of modernity and tradition in Japan's bustling capital, featuring skyscrapers, historic temples, and the iconic Shibuya Crossing.*\n- **Kyoto:** *Immerse yourself in the cultural heart of Japan with Kyoto's traditional tea houses, ancient shrines, and stunning gardens, preserving the country's rich heritage.*\n- **Osaka:** *Indulge in culinary delights and entertainment in Osaka, known for its street food, vibrant nightlife, and the historic Osaka Castle.*\n- **Hakone:** *Escape to the serene landscapes of Hakone, offering hot springs, picturesque views of Mount Fuji, and traditional ryokan stays.*\n- **Hiroshima:** *Reflect on history at Hiroshima, home to the Peace Memorial Park and Museum, and explore the rejuvenated city symbolizing resilience and peace.*`,
    `- **寿司:** *楽しい日本の象徴、寿司の絶妙な味わいを堪能してください。新鮮な魚、酢飯、海藻の完璧なハーモニーが、日本料理の芸術を象徴しています。*\n- **マンガ:** *魅力的なマンガの世界に没頭し、鮮やかなイラストと引き込まれるストーリーテリングが交わり、ユニークで想像力豊かな日本のポップカルチャーを提供します。*\n- **桜:** *春の美しい桜の花々を目撃しましょう。これらの儚い花がピンクの色で風景を覆い、魔法のようで一瞬のスペクタクルを作り出します。*\n- **侍:** *伝説的な侍の武士の歴史を探索し、その武道、誠実なコード、特徴的な鎧で知られています。これらの戦士は、国の文化遺産に不可欠な印を残しました。*\n- **禅庭園:** *禅の庭園の緻密なデザインで静けさを見つけてください。注意深く配置された岩、櫛で整えられた砂利、豊かな緑が、静寂な雰囲気を作り出し、瞑想とマインドフルネスを招きます。*`,
];

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

type SearchResult = {
    score: number;
    id: string;
    destination: string;
    title: string;
    description: string;
    image: string;
};

const p_data: SearchResult[] = [
    {
        score: 0.9999999999999999,
        id: 'G5651XC8',
        title: "Exploring Japan's Northern Frontier",
        destination: 'Hokkaido',
        image: 'https://en.japantravel.com/photo/1655-215379/1440x960!/hokkaido-lake-toya-215379.jpg',
        description:
            'Hokkaido as Japan’s second largest island to the far north, has much wilderness to be explored.\nRenowned among tourists and locals alike for its abundance of powder snow and white landscapes, Hokkaido is always a popular choice for winter sports and scenery in places like Niseko and wetland Kushiro Shitsugen. Its attraction extends beyond nature to ramen and seafood such as crabs and sea urchins, which are of the highest quality in the frigid waters here.\nApart from its famed cuisine, parks and beautiful nature, Hokkaido is also steeped in history as the home of the indigenous Ainu people. Increasingly popular in seasons other than winter, more visitors have been flocking here for the delightful moss phlox and tulip fields in spring and a land that teems with life during summer.',
    },
    {
        score: 0.8333333333333334,
        id: 'R3U0Y210',
        title: "Hokkaido's second biggest city",
        destination: 'Asahikawa',
        image: 'https://en.japantravel.com/photo/39234-215106/120x80!/hokkaido-asahikawa-215106.jpg',
        description:
            'Asahikawa Airport in Hokkaido cuts a sharp form as planes come and go from its single runway. With easy access from Asahikawa Station, Asahiyama Zoo, and Furano Station, visitors to the area may find themselves on the tarmac of this airport that has been around for more than half a century.\nWhile in the Asahikawa and Furano area, rediscover the world’s natural splendor at Asahiyama Zoo, Biei Farm, Furano Cheese Factory, and Ueno Farm, also known as the Gnomes’ Garden—even try sake at Otokoyama Sake Brewing Museum.\nThe Asahiyama Zoo is the northernmost zoo of its kind in Japan. Visitors to the Asahiyama Zoo will see animals in wide-open spaces where they frolic, fly, and swim. With seals swimming through tubes, birds flying overhead in the aviarium, and penguins on parade at feeding time, you’ll be transported to a magical animal kingdom.\nSee fields of fluffy lavender at Biei Farm and try a variety of lavender-themed treats. At the Furano Cheese Factory discover the cheese-making process and eat your fill of the creamy delicious food we all know and love.\nLikewise, at Ueno Farm, guests can rediscover a world they thought they knew. This garden getaway is the perfect place for green-thumb enthusiasts and lovers of a quaint and picturesque scene. An ideal family trip, the Gnomes’ Garden provides a mixture of English gardens and Japanese flora.\nIf you’re planning a trip without children, make sure to visit the local sake brewery that offers free tasting and a spectrum of local produce. Discover the brewing methods used in Japan for nihonshu, or sake as it’s commonly called. And even sample natural spring water from Daisetsuzan Mountain outside the brewery.\nHokkaido Access Guide\nMajor Airports in Hokkaido',
    },
    {
        score: 0.8333333333333334,
        id: 'R3U0Y210',
        title: "Hokkaido's second biggest city",
        destination: 'Asahikawa',
        image: 'https://en.japantravel.com/photo/39234-215106/120x80!/hokkaido-asahikawa-215106.jpg',
        description:
            'Asahikawa Airport in Hokkaido cuts a sharp form as planes come and go from its single runway. With easy access from Asahikawa Station, Asahiyama Zoo, and Furano Station, visitors to the area may find themselves on the tarmac of this airport that has been around for more than half a century.\nWhile in the Asahikawa and Furano area, rediscover the world’s natural splendor at Asahiyama Zoo, Biei Farm, Furano Cheese Factory, and Ueno Farm, also known as the Gnomes’ Garden—even try sake at Otokoyama Sake Brewing Museum.\nThe Asahiyama Zoo is the northernmost zoo of its kind in Japan. Visitors to the Asahiyama Zoo will see animals in wide-open spaces where they frolic, fly, and swim. With seals swimming through tubes, birds flying overhead in the aviarium, and penguins on parade at feeding time, you’ll be transported to a magical animal kingdom.\nSee fields of fluffy lavender at Biei Farm and try a variety of lavender-themed treats. At the Furano Cheese Factory discover the cheese-making process and eat your fill of the creamy delicious food we all know and love.\nLikewise, at Ueno Farm, guests can rediscover a world they thought they knew. This garden getaway is the perfect place for green-thumb enthusiasts and lovers of a quaint and picturesque scene. An ideal family trip, the Gnomes’ Garden provides a mixture of English gardens and Japanese flora.\nIf you’re planning a trip without children, make sure to visit the local sake brewery that offers free tasting and a spectrum of local produce. Discover the brewing methods used in Japan for nihonshu, or sake as it’s commonly called. And even sample natural spring water from Daisetsuzan Mountain outside the brewery.\nHokkaido Access Guide\nMajor Airports in Hokkaido',
    },
    {
        score: 0.8333333333333334,
        id: 'R3U0Y210',
        title: "Hokkaido's second biggest city",
        destination: 'Asahikawa',
        image: 'https://en.japantravel.com/photo/39234-215106/120x80!/hokkaido-asahikawa-215106.jpg',
        description:
            'Asahikawa Airport in Hokkaido cuts a sharp form as planes come and go from its single runway. With easy access from Asahikawa Station, Asahiyama Zoo, and Furano Station, visitors to the area may find themselves on the tarmac of this airport that has been around for more than half a century.\nWhile in the Asahikawa and Furano area, rediscover the world’s natural splendor at Asahiyama Zoo, Biei Farm, Furano Cheese Factory, and Ueno Farm, also known as the Gnomes’ Garden—even try sake at Otokoyama Sake Brewing Museum.\nThe Asahiyama Zoo is the northernmost zoo of its kind in Japan. Visitors to the Asahiyama Zoo will see animals in wide-open spaces where they frolic, fly, and swim. With seals swimming through tubes, birds flying overhead in the aviarium, and penguins on parade at feeding time, you’ll be transported to a magical animal kingdom.\nSee fields of fluffy lavender at Biei Farm and try a variety of lavender-themed treats. At the Furano Cheese Factory discover the cheese-making process and eat your fill of the creamy delicious food we all know and love.\nLikewise, at Ueno Farm, guests can rediscover a world they thought they knew. This garden getaway is the perfect place for green-thumb enthusiasts and lovers of a quaint and picturesque scene. An ideal family trip, the Gnomes’ Garden provides a mixture of English gardens and Japanese flora.\nIf you’re planning a trip without children, make sure to visit the local sake brewery that offers free tasting and a spectrum of local produce. Discover the brewing methods used in Japan for nihonshu, or sake as it’s commonly called. And even sample natural spring water from Daisetsuzan Mountain outside the brewery.\nHokkaido Access Guide\nMajor Airports in Hokkaido',
    },
];

let previousChatHistory: ChatHistory[] = [];

export default function Page({ params }: { params: { id: string } }) {
    // const post = data.find((post) => post.id === params.id);
    // Query the database for a single post by id
    const [post, setPost] = useState<Post | null>(null);
    const [userQuery, setUserQuery] = useState('');
    const [botResponses, setBotResponses] = useState<string[]>(['Hokkaido', 'Region']);
    const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
    // Recomended Destinations
    const [recommendedDestinations, setRecommendedDestinations] = useState<SearchResult[]>([]);
    const [isLoaded, setIsLoaded] = useState(true);
    const [isAsked, setIsAsked] = useState(true);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const getPost = async () => {
            try {
                setIsLoaded(false);
                setRecommendedDestinations(p_data);
                const { data } = await supabase
                    .from('destinations')
                    .select('id, title, destination, image, description')
                    .eq('id', params.id);

                if (data && data.length > 0) {
                    setPost(data[0]);

                    const dataForm = {
                        query: data[0].image,
                        type: 'image',
                    };

                    console.log(dataForm);

                    axios
                        .post('https://milvus-server.onrender.com/api/search', dataForm)
                        .then((res) => {
                            setRecommendedDestinations(res.data);
                            console.log(res.data);
                            setIsLoaded(true);
                        })
                        .catch((err) => {
                            console.log(err);
                        });

                    // Test
                    // setRecommendedDestinations(p_data);
                    // setIsLoaded(true);
                }
            } catch (error) {
                console.error(error);
            }
        };

        getPost();
    }, [params.id]);

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
            const skeletonResult = randomAnswers[Math.floor(Math.random() * randomAnswers.length)];

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
                                setChatHistory([...previousChatHistory, { userQuery: userQuery, botResponse: result }]);
                                setIsAsked(true);

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
                            });
                    }
                });

            // Test
            // ====================================================================================================
            // const result = randomAnswers[Math.floor(Math.random() * randomAnswers.length)];

            // // Split the result into an array of words
            // const words = result.split(' ');

            // // Display words one by one at intervals
            // for (let i = 0; i < words.length; i++) {
            //     setTimeout(
            //         () => {
            //             setBotResponses((prevAnswers) => [...prevAnswers, words[i]]);
            //         },
            //         Math.floor(Math.random() * 50) + 50 * i
            //     );
            // }

            // // Store user and bot messages in chat history
            // setChatHistory([...chatHistory, { userQuery: userQuery, botResponse: result }]);

            // // Reset bot answers
            // setBotResponses([]);
            // ====================================================================================================
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

        await getAnswer(userQuery);

        // Reset bot answers
        setBotResponses(['Hokkaido', 'Region']);
        setUserQuery('');
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

        // Test
        // ====================================================================================================
        // Modify the last message
        // const result = randomAnswers[Math.floor(Math.random() * randomAnswers.length)];

        // // Split the result into an array of words
        // const words = result.split(' ');

        // // Display words one by one at intervals
        // for (let i = 0; i < words.length; i++) {
        //     setTimeout(() => {
        //         setBotResponses(prevAnswers => [
        //             ...prevAnswers,
        //             words[i]
        //         ]);
        //     }, Math.floor(Math.random() * 50) + 50 * i);
        // }

        // // Store user and bot messages in chat history
        // n_chatHistory[n_chatHistory.length - 1].botResponse = result;

        // // Reset bot answers
        // setBotResponses([]);

        // // Update chat history
        // setChatHistory(n_chatHistory);
        // ====================================================================================================

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

    return (
        <NextUIProvider>
            <div className='mb-64'>
                <img className='h-60 w-full object-cover' src={post.image} alt={post.destination} />

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
                            <div key={index} className=' w-full text-sm'>
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
                                <div className='cursor-pointer hover:bg-[#9DC08B]' key={index}>
                                    <div key={index} className='flex justify-between p-4'>
                                        <div className='w-4/5'>
                                            <Skeleton isLoaded={isLoaded} className='mb-2 mr-16 rounded-md text-lg'>
                                                <div className='text-lg font-semibold'>
                                                    <a href={`/destination/${destination.id}`}>
                                                        {destination.destination}
                                                    </a>
                                                </div>
                                            </Skeleton>
                                            <Skeleton isLoaded={isLoaded} className='mr-2 rounded-md pb-4 text-sm'>
                                                <div className='text-sm'>{destination.title}</div>
                                            </Skeleton>
                                        </div>
                                        <Skeleton isLoaded={isLoaded} className='rounded-md'>
                                            <img
                                                className='h-[100px] w-[200px] rounded-md'
                                                src={destination.image}
                                                alt={destination.destination}
                                            />
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
