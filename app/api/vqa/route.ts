import { NextRequest, NextResponse } from "next/server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

import axios from 'axios';
import mime from 'mime-types';

function fileToGenerativePart(path: any, mimeType: any) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(path)).toString("base64"),
            mimeType
        },
    };
}


const urlToGenerativePart = async (url: any) => {
    try {
        // Make a GET request to the image URL
        const response = await axios.get(url, { responseType: "arraybuffer" });

        // Determine the MIME type based on the response headers
        const mimeType = response.headers["content-type"] || mime.lookup(url);

        if (!mimeType || !mimeType.startsWith("image/")) {
            console.error("processImages | Unsupported image MIME type:", mimeType);
            return { Error: "Unsupported image MIME type" };
        }

        // Convert the binary data to base64
        const base64Data = Buffer.from(response.data, "binary").toString("base64");

        // Return an object with inlineData
        return {
            inlineData: {
                data: base64Data,
                mimeType,
            },
        };
    } catch (error) {
        console.error(
            "processImages | Error fetching image from URL:",
            // error
        );
        return { Error: "Error fetching image from URL" };
    }
};

export async function POST(req: NextRequest) {

    // get prompt field from the request body
    const reqBody = await req.json();
    const { prompt, url } = reqBody;
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    // const prompt = "Tell me something about this image";

    const imageParts = [
        // await urlToGenerativePart("https://media.cntraveler.com/photos/63482b255e7943ad4006df0b/16:9/w_2560%2Cc_limit/tokyoGettyImages-1031467664.jpeg"),
        // fileToGenerativePart("public/images/istockphoto-484915982-612x612.jpg", "image/jpeg"),
        await urlToGenerativePart(url),
    ];

    try {
        const result = await model.generateContent([prompt, imageParts as any]);
        const response = await result.response;
        const text = response.text();
        return NextResponse.json({
            text
        });
    } catch (error) {
        // console.error(error);
        return NextResponse.json({
            text: "Unable to process the prompt. Please select an image and try again."
        });
    }
}