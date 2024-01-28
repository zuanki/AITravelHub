/* Components */
import Navbar from "./components/NavBar";

export default function IndexPage() {
  return <div className="flex justify-center items-center flex-col h-screen">
    <div className="fixed top-0 left-0 w-full">
      <Navbar />
    </div>
    <div className="flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text hover:bg-gradient-to-r hover:from-blue-500 hover:via-green-400 hover:to-indigo-300">
        AITravelHub
      </h1>
      <p className="text-2xl my-4">AI-powered travel assistant</p>
    </div>
  </div>
}

export const metadata = {
  title: 'AITravelHub',
};
