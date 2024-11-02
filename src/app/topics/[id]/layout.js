
export const metadata = {
    title: "Ignify Topic & Subtopics",
    description: "Explore and manage subtopics under each topic within the Ignify study management system.",
    keywords: [
        "Ignify",
        "Subtopics",
        "Study Management",
        "Learning Organization",
        "Education",
        "LMS",
        "Study Subtopics"
    ],
    openGraph: {
        title: "Topics & Subtopics - Ignify App",
        description:
            "Discover and explore all subtopics related to your study topics in the Ignify app.",
        url: "https://ignify.fun/subtopics",
        type: "website",
        images: [
            {
                url: "http://ignify.fun//_next/image?url=%2Flogo.jpeg&w=800&q=75",
                width: 800,
                height: 600,
                alt: "Ignify Subtopics Page",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Subtopics - Ignify App",
        description:
            "Delve into the subtopics associated with your study topics in the Ignify app.",
        image: "http://ignify.fun//_next/image?url=%2Flogo.jpeg&w=800&q=75",
    },
};


export default function subject({ children }) {
    return <div className="h-full  w-full">{children}</div>;
}
