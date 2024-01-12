'use client';
import { BsArrowUpCircleFill } from "react-icons/bs";

const data = [
    {
        score: 0.5,
        id: '1',
        name: 'Tokyo',
        subtitle: 'Tokyo is the capital of Japan.',
        description:
            `Tokyo (東京, Tōkyō) is Japan's capital and the world's most populous metropolis. It is also one of Japan's 47 prefectures, consisting of 23 central city wards and multiple cities, towns and villages west of the city center. The Izu and Ogasawara Islands are also part of Tokyo.\nPrior to 1868, Tokyo was known as Edo. Previously a small castle town, Edo became Japan's political center in 1603 when Tokugawa Ieyasu established his feudal government there. A few decades later, Edo had grown into one of the world's largest cities. With the Meiji Restoration of 1868, the emperor and capital moved from Kyoto to Edo, which was renamed Tokyo ("Eastern Capital"). Large parts of Tokyo were destroyed in the Great Kanto Earthquake of 1923 and the air raids of 1945.\nToday, Tokyo offers a seemingly unlimited choice of shopping, entertainment, culture and dining to its visitors. The city's history can be appreciated in districts such as Asakusa and in many excellent museums, historic temples and gardens. Contrary to common perception, Tokyo also offers a number of attractive green spaces in the city center and within relatively short train rides at its outskirts.`,
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

export default function Page({ params }: { params: { id: string } }) {
    const post = data.find((post) => post.id === params.id);
    if (!post) {
        return <div>Not found</div>;
    }

    // Auto Resize Textarea
    const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    };


    return (
        <div>
            <div className="">
                <img
                    className="w-full h-60 object-cover"
                    src={post.link_image}
                    alt={post.name}
                />

                <div className="flex justify-between items-center">
                    <div className="w-[800px] m-auto p-4">
                        <h1 className="text-2xl font-bold">
                            {post.name}
                        </h1>
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
                    </div>
                </div>

            </div>

            <div className="fixed  bottom-0 left-0 w-full flex justify-center items-center">
                <div className="flex bg-white rounded-xl shadow-2xl p-1 m-4 w-[600px]">
                    <textarea
                        className="flex-grow rounded-xl p-2 text-sm resize-none overflow-hidden focus:right-0 focus:outline-none"
                        placeholder="Ask a follow-up..."
                        onInput={autoResize}
                    />
                    <button>
                        <BsArrowUpCircleFill className="inline-block mr-2 text-4xl p-2 hover:bg-[#9DC08B] rounded-full cursor-pointer" />
                    </button>
                </div>
            </div>
        </div>
    )
}