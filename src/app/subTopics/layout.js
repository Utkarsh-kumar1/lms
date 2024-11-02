

export const metadata = {
    title: "Ignify Subtopics",
    description: "Explore, manage, and edit subtopics within the Ignify study management system.",
    keywords: [
        "Ignify",
        "Subtopics",
        "Study Management",
        "Learning",
        "Education",
        "LMS",
        "Study Organization"
    ],
    openGraph: {
        title: "Subtopics - Ignify App",
        description:
            "View and manage subtopics in the Ignify app to streamline your study plan.",
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
            "Access and organize your subtopics seamlessly in the Ignify study management system.",
        image: "http://ignify.fun//_next/image?url=%2Flogo.jpeg&w=800&q=75",
    },
};

export default function subject({ children }) {
    return <>{children}</>;
}
