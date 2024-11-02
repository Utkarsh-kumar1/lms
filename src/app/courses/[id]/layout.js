

export const metadata = {
    title: "Ignify - Course Topics",
    description: "Explore topics related to your selected course in the Ignify App.",
    keywords: [
        "Ignify",
        "Courses",
        "Course Topics",
        "Study Management",
        "Education",
        "Learning",
        "Topic Content",
        "Subject Topics"
    ],
    openGraph: {
        title: "Course Topics - Ignify App",
        description: "Access detailed topics and resources for your selected course in Ignify.",
        url: "http://ignify.fun/courses/[courseId]", // Update with actual dynamic course ID in the routing
        type: "website",
        images: [
            {
                url: "http://ignify.fun/_next/image?url=%2Flogo.jpeg&w=800&q=75", // Ensure consistency in image width
                width: 800,
                height: 600,
                alt: "Ignify Course Topics Page",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Course Topics - Ignify App",
        description: "Discover and manage all topics related to your selected course in the Ignify App.",
        image: "http://ignify.fun/_next/image?url=%2Flogo.jpeg&w=800&q=75", // Consistent image for Twitter
    },
};


export default function subject({ children }) {
    return <div className="h-full  w-full">{children}</div>;
}
