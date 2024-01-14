import { useState } from 'react';
import { CiCirclePlus } from "react-icons/ci";

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

export default function Chat() {
    const [chatHistory, setChatHistory] = useState<ChatProps[]>(data);
    const [input, setInput] = useState<string>('');


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
                    message: botMessages[Math.floor(Math.random() * 4)],
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
                <button className='flex items-center'>
                    <CiCirclePlus className='text-xl mt-2 mr-1' />
                </button>
                <input
                    className="w-full mt-2 p-2 rounded-md border-[1.5px] mr-2 focus:outline-none focus:ring-1 focus:ring-[#9DC08B]"
                    type="text"
                    placeholder="Enter your message here"
                    value={input}
                    onChange={handleInputChange}
                />
                <button
                    className="bg-[#9DC08B] hover:bg-[#40513B] text-white text-xs font-bold py-2 px-2 rounded mt-2 ml-2"
                    onClick={handleSendMessage}
                >
                    Send
                </button>
            </div>
        </div>
    );
}
