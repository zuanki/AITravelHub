import { useRef, useState, useEffect } from 'react';
import { CiCirclePlus } from "react-icons/ci";
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebase/config';
import moment from 'moment';
import { IoIosCloseCircle } from 'react-icons/io';
import Image from 'next/image';
import axios from 'axios';

type ChatProps = {
    message: string;
    isBot: boolean;
    image: string;
};

const data: ChatProps[] = [
    {
        message: 'Hi, I am VQA Chatbot. How can I help you?',
        isBot: true,
        image: ''
    }
];

// Random bot messages
const botMessages = [
    'Sorry, I did not understand that',
    'Please elaborate',
    'I am not sure if I can help you with that',
    'Please ask me something else'
];

const getCurrentDatetime = (): string => {
    const date = new Date();
    return moment(date).format('YYYY-MM-DD_HH:mm:ss');
};

export default function Chat() {
    let resMsg = '';

    const [chatHistory, setChatHistory] = useState<ChatProps[]>(data);

    const [input, setInput] = useState<string>('');

    const [result, setResult] = useState<string>('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const chatContainerRef = useRef<HTMLDivElement>(null);

    const [blobUrl, setBlobUrl] = useState<string>('');

    const [isLoaded, setIsLoaded] = useState<boolean>(true);

    const [isBusy, setIsBusy] = useState<boolean>(false);

    const [fileImageChat, setFileImageChat] = useState<File | null>(null);

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    const addFileImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        let file = e.target.files?.[0] as File;
        if (file) {
            setBlobUrl(URL.createObjectURL(file));
            setFileImageChat(file);
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

        setFileImageChat(null);
    };

    const clearInputs = () => {
        setInput('');
        setFileImageChat(null);
    };

    const sendMessage = (message: string, url: string) => {
        setChatHistory((prev) => [
            ...prev,
            { message: message, isBot: false, image: url },
        ]);
    }

    const sendBotMessage = (message: string) => {
        setChatHistory((prev) => [
            ...prev,
            {
                message: message,
                isBot: true,
                image: ''
            },
        ]);
    }

    // Handle send message
    const handleSendMessage = (url: string) => {
        if (input) {
            sendMessage(input, url);
        }
    };

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    }

    // Auto Resize Textarea
    const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    };

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    // Handle keydown
    const handleKeyDown = async (
        event:
            | React.KeyboardEvent<HTMLInputElement>
            | React.MouseEvent<HTMLButtonElement>
            | React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
        if (event.type === 'click' || (event as React.KeyboardEvent).key === 'Enter') {
            setIsLoaded(false);
            // setSearchResults(data);
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.value = '';
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            }
            if (input === '' && !fileImageChat) return;
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            let promiseUpload: Promise<string> = Promise.resolve('');
            if (fileImageChat) {
                const name = fileImageChat.name;
                const storageRef = ref(storage, `images/${getCurrentDatetime()}_${name}`);
                const uploadTask = uploadBytesResumable(storageRef, fileImageChat!);

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
            }

            const url = await promiseUpload;
            handleSendMessage(url);
            clearInputs();

            // POST
            let dataForm = {
                prompt: input,
                url: url
                // url: "https://media.cntraveler.com/photos/63482b255e7943ad4006df0b/16:9/w_2560%2Cc_limit/tokyoGettyImages-1031467664.jpeg"
            };

            axios.post('/api/vqa', dataForm).then((res) => {
                console.log(res.data);
                // setResult(res.data.text);
                // console.log(result);
                resMsg = res.data.text
                sendBotMessage(resMsg);
                setIsLoaded(true);
            });
            console.log(dataForm);

            if (blobUrl != '') {
                URL.revokeObjectURL(blobUrl);
                setBlobUrl('');
            }
        }
    };


    return (
        <div className="">
            <div className="font-bold text-lg mb-2">VQA</div>
            <div ref={chatContainerRef} className="overflow-y-auto h-96 no-scrollbar">
                {chatHistory.map((chat, index) => (
                    <div>
                        <div
                            key={index}
                            className={`flex ${chat.isBot ? 'justify-start' : 'justify-end'} ${chat.image !== '' ? '' : 'mb-3'}`}
                        >
                            <div
                                className={`rounded-md p-2 max-w-80 overflow-x-hidden  ${chat.isBot
                                    ? 'bg-[#F6F6F6] text-black' // Adjust for bot messages
                                    : 'bg-[#9DC08B] text-white'
                                    }`}
                            >
                                {chat.isBot ? (
                                    <div className="text-xs break-words">{chat.message}</div>
                                ) : (
                                    <div className="text-xs break-words">{chat.message}</div>
                                )}
                            </div>
                        </div>
                        {chat.image !== '' ? (
                            <div className={`flex ${chat.isBot ? 'justify-start' : 'justify-end'} mb-3`}>
                                <div className="mt-2">
                                    <img
                                        src={chat.image}
                                        alt="Image"
                                        style={{
                                            height: "150px",
                                            width: "auto",
                                            display: "block",
                                        }}
                                        className="transition-opacity duration-500 rounded-md bg-[#F6F6F6]"
                                    />
                                </div>
                            </div>
                        ) : null}
                    </div>
                ))}
            </div>
            <div className="flex text-xs justify-between items-center">
                <div className=''>
                    <input
                        ref={fileInputRef}
                        type='file'
                        name='fileVQA'
                        id='fileVQA'
                        hidden
                        onChange={(e) => addFileImage(e)}
                    />
                    <label className='flex items-center text-xl mt-2 mr-2 rounded cursor-pointer hover:bg-[#9DC08B]' htmlFor='fileVQA'>
                        <CiCirclePlus />
                    </label>
                </div>
                <div className='flex-1 relative'>
                    {fileImageChat && (
                        <div className='absolute bottom-12'>
                            <Image
                                src={blobUrl}
                                alt='file image'
                                width={1000}
                                height={1000}
                                className='h-12 w-12 rounded-lg'
                            />
                            <button onClick={() => popFileImage()}>
                                <IoIosCloseCircle className='absolute -right-2 -top-2 text-[#9DC08B]' />
                            </button>
                        </div>
                    )}
                    <input
                        // ref={textareaRef}
                        className="w-full overflow-hidden text-justify row-span-2 mt-2 p-2 rounded-md border-[1.5px] mr-2 focus:outline-none focus:ring-1 focus:ring-[#9DC08B]"
                        placeholder="Enter your message here"
                        value={input}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e)}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                <button
                    type="button"
                    className="bg-[#9DC08B] hover:bg-[#40513B] text-white text-xs font-bold py-2 px-2 rounded mt-2 ml-2"
                    onClick={handleKeyDown}
                >
                    Send
                </button>
            </div>
        </div>
    );
}
