'use client'
import { useState } from "react"
import axios from "axios"

type SearchResult = {
    score: number,
    id: string,
    name: string,
    subtitle: string,
    description: string,
    link_image: string,
}

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
            const response = axios.post("http://localhost:5000/api/search", dataForm).then((response) => {
                setSearchResults(response.data)
            }).catch((error) => {
                console.log(error)
            })
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
                                        <li key={result.name}>
                                            <h3>{result.name}</h3>
                                            <img src={result.link_image} alt={result.name} className="rounded-md" />
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