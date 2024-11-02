

export const metadata = {
    title: "Ignify - Subject Courses",
    description: "Explore all courses related to your selected subject in the Ignify App.",
    keywords: [
        "Ignify",
        "Subjects",
        "Courses",
        "Study Management",
        "Education",
        "Learning",
        "Subject Courses",
        "Course Content"
    ],
    openGraph: {
        title: "Subject Courses - Ignify App",
        description: "Access all courses and detailed content for your selected subject in Ignify.",
        url: "https://ignify.fun/subject/[id]",
        type: "website",
        images: [
            {
                url: "http://ignify.fun/_next/image?url=%2Flogo.jpeg&w=32&q=75",
                width: 800,
                height: 600,
                alt: "Ignify Subject Courses Page",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Subject Courses - Ignify App",
        description: "View and manage all courses under your selected subject in the Ignify App.",
        image: "http://ignify.fun/_next/image?url=%2Flogo.jpeg&w=32&q=75",
    },
};


export default function subject({ children }) {
    return <div className="h-full  w-full">{children}</div>;
}
