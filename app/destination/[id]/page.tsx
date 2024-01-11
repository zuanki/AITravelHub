const data = [
    {
        score: 0.5,
        id: '1',
        name: 'Tokyo',
        subtitle: 'Tokyo is the capital of Japan.',
        description:
            'Tokyo is the capital of Japan. It is the center of the Greater Tokyo Area, and the most populous metropolitan area in the world. It is the seat of the Japanese government and the Imperial Palace, and the home of the Japanese Imperial Family.',
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
    return <div>My Post: {params.id}</div>
}