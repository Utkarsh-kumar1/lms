import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Ignify Topics",
    description: "Explore, manage, and organize topics within the Ignify study management system.",
    keywords: [
        "Ignify",
        "Topics",
        "Study Management",
        "Learning Organization",
        "Education",
        "LMS",
        "Study Topics"
    ],
    openGraph: {
        title: "Topics - Ignify App",
        description:
            "Discover and manage study topics to optimize your learning in the Ignify app.",
        url: "https://ignify.fun/topics",
        type: "website",
        images: [
            {
                url: "http://ignify.fun//_next/image?url=%2Flogo.jpeg&w=800&q=75",
                width: 800,
                height: 600,
                alt: "Ignify Topics Page",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Topics - Ignify App",
        description:
            "Organize and manage your study topics effortlessly with the Ignify app.",
        image: "http://ignify.fun//_next/image?url=%2Flogo.jpeg&w=800&q=75",
    },
};


export default function subject({ children }) {
    return <div className=" h-full w-full dark:bg-gray-800">{children}</div>;
}
