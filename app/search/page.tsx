'use client'
import { useState } from "react"
import axios from "axios"
import Link from "next/link"

type SearchResult = {
    score: number,
    id: string,
    name: string,
    subtitle: string,
    description: string,
    link_image: string,
}

const data: SearchResult[] = [
    {
        "score": 0.5,
        "id": "1",
        "name": "Tokyo",
        "subtitle": "Tokyo is the capital of Japan.",
        "description": "Tokyo is the capital of Japan. It is the center of the Greater Tokyo Area, and the most populous metropolitan area in the world. It is the seat of the Japanese government and the Imperial Palace, and the home of the Japanese Imperial Family.",
        "link_image": "https://media.cntraveler.com/photos/60341fbad7bd3b27823c9db2/4:3/w_4624,h_3468,c_limit/Tokyo-2021-GettyImages-1208124099.jpg"
    },
    {
        "score": 0.9,
        "id": "2",
        "name": "Hokkaido",
        "subtitle": "Hokkaido is the second largest island of Japan.",
        "description": "Hokkaido is the second largest island of Japan, and the largest and northernmost prefecture. The Tsugaru Strait separates Hokkaido from Honshu. The two islands are connected by the undersea railway Seikan Tunnel.",
        "link_image": "https://www.jal.co.jp/vn/vn/guide-to-japan/destinations/articles/hokkaido/best-parks-and-nature-attractions/_jcr_content/root/responsivegrid/sectioncontainer/image_1041888335.coreimg.jpeg/1636979413394.jpeg"
    }
]

export default function Page() {
    const [userQuery, setUserQuery] = useState<string>("")
    const [searchResults, setSearchResults] = useState<SearchResult[]>([])

    // Handle user input
    const handleUserQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUserQuery(event.target.value)
    }

    // Handle keydown
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            // POST /api/search
            const dataForm = {
                query: userQuery,
                type: "text"
            }

            // const response = axios.post("http://localhost:5000/api/search", dataForm).then((response) => {
            //     setSearchResults(response.data)
            // }).catch((error) => {
            //     console.log(error)
            // })

            setSearchResults(data)
        }
    }

    // Clear search results
    const clearSearchResults = () => {
        setUserQuery("")
        setSearchResults([])
    }

    return (
        <div>
            <input
                type="text"
                className="border-2 rounded-md p-2"
                placeholder="Search"
                value={userQuery}
                onChange={handleUserQuery}
                onKeyDown={handleKeyDown}
            />
            <button
                className="border-2 rounded-md mx-2 p-2"
                onClick={clearSearchResults}
            >
                CLEAR
            </button>
            {
                searchResults.length > 0 && (
                    <div className="mt-2">
                        <ul>
                            {
                                searchResults.map((result) => {
                                    return (
                                        <li key={result.name} className="my-4">
                                            <Link className="font-bold my-2"
                                                href={`/destination/${result.id}`}
                                            >{result.name}</Link>
                                            <img src={result.link_image} alt={result.name} className="rounded-md w-[200px] h-[200px]" />
                                        </li>
                                    )
                                })
                            }
                        </ul>
                    </div>
                )
            }
        </div>
    )
}