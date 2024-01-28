'use client';
// Add necessary imports
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

type Content = {
    images: string[];
    descriptions: string[];
    title?: string;
};

const data: Content[] = [
    {
        images: [
            '/assets/search-1.png',
        ]
        ,
        descriptions: [
            'Powerful Search Engine supports both text and image queries',
        ],
        title: 'Powerful Search Engine',
    },
    {
        images: [
            '/assets/chatbot-1.png',
        ],
        descriptions: [
            'Context-Aware Chatbot',
        ],
        title: 'Context-Aware Chatbot',
    },
    {
        images: [
            '/assets/vqa-1.png',
        ],
        descriptions: [
            'Visual Question Answering',
        ],
        title: 'Visual Question Answering',
    }
];

export default function ContentSlider() {
    const [index, setIndex] = useState<number>(0);
    const [imageIdx, setImageIdx] = useState<number>(0);

    const handleClick = (type: string, currentIndex: number) => {
        if (type === 'prev') {
            setIndex(currentIndex === 0 ? data.length - 1 : currentIndex - 1);
        } else {
            setIndex(currentIndex === data.length - 1 ? 0 : currentIndex + 1);
        }
    };

    const timer = () => {
        const interval = setInterval(() => {
            setImageIdx((prevIdx) => (prevIdx === data[index].images.length - 1 ? 0 : prevIdx + 1));
        }, 1000); // Set your desired interval (in milliseconds)

        return () => clearInterval(interval); // Cleanup interval on component unmount
    };

    useEffect(() => {
        const cleanupInterval = timer();
        return () => cleanupInterval();
    }, [index]); // Re-run timer when index changes

    return (
        <div className="relative">
            <div>
                <Image
                    src={data[index].images[imageIdx]}
                    alt="Image"
                    width={500}
                    height={500}
                    className="transition-opacity duration-500 rounded-md"
                />
            </div>
            <div className="absolute top-0 left-0 p-4 text-white">
                {data[index].descriptions.map((description, idx) => (
                    <p key={idx}>
                        {description}
                    </p>
                ))}
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                <button onClick={() => handleClick('prev', index)} className="bg-blue-500 text-white px-4 py-2 rounded">
                    Prev
                </button>
                <button onClick={() => handleClick('next', index)} className="bg-blue-500 text-white px-4 py-2 rounded">
                    Next
                </button>
            </div>
        </div>
    );
}
