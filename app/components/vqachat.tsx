import { useRef, useState } from 'react';
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
};

const data: ChatProps[] = [
    {
        message: 'Hi, I am VQA Chatbot. How can I help you?',
        isBot: true,
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
    const [chatHistory, setChatHistory] = useState<ChatProps[]>(data);

    const [input, setInput] = useState<string>('');

    const [result, setResult] = useState<string>('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [blobUrl, setBlobUrl] = useState<string>('');

    const [urlImage, setUrlImage] = useState<string>('');

    const [isSubmit, setIsSubmit] = useState<boolean>(false);

    const [isLoaded, setIsLoaded] = useState<boolean>(true);

    const [isBusy, setIsBusy] = useState<boolean>(false);

    const [fileImageChat, setFileImageChat] = useState<File | null>(null);

    const addFileImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        let file = e.target.files?.[0] as File;
        if (file) {
            setBlobUrl(URL.createObjectURL(file));
            setFileImageChat(file);
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

        setFileImageChat(null);
        setUrlImage('');
    };

    const clearInputs = () => {
        setInput('');
        setFileImageChat(null);
    };

    const sendMessage = (message: string) => {
        setChatHistory((prev) => [
            ...prev,
            { message: message, isBot: false },
        ]);

        // Bot replies after 1 second
        setTimeout(() => {
            setChatHistory((prev) => [
                ...prev,
                {
                    // 
                    message: result,
                    isBot: true,
                },
            ]);
        }, 1000);
    }

    // Handle send message
    const handleSendMessage = () => {
        if (input) {
            sendMessage(input);
            setInput('');
        }
    };

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        setIsSubmit(false);
    }

    // Auto Resize Textarea
    const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
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
            } else {
                setIsSubmit(true);
            }

            const url = await promiseUpload;
            setUrlImage(url);
            setIsSubmit(true);
            clearInputs();
            handleSendMessage();

            // POST
            let dataForm = {
                prompt: input,
                url: urlImage
                // url: "https://media.cntraveler.com/photos/63482b255e7943ad4006df0b/16:9/w_2560%2Cc_limit/tokyoGettyImages-1031467664.jpeg"
            };
            // if (fileImage) {
            //     dataForm = {
            //         prompt: url,
            //     };
            // }

            axios.post('/api/vqa', dataForm).then((res) => {
                console.log(res.data);
                // setResult(res.data.text);
                // console.log(result);
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
            <div className="overflow-auto h-96 no-scrollbar">
                {chatHistory.map((chat, index) => (
                    <div
                        key={index}
                        className={`flex ${chat.isBot ? 'justify-start' : 'justify-end'
                            } mb-2`}
                    >
                        <div
                            className={`rounded-md p-2  ${chat.isBot
                                ? 'bg-[#F6F6F6] text-black' // Adjust for bot messages
                                : 'bg-[#9DC08B] text-white'
                                }`}
                        >
                            {chat.isBot ? (
                                <div className="text-xs">{chat.message}</div>
                            ) : (
                                <div className="text-xs">{chat.message}</div>
                            )}
                        </div>
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
