import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Ignify - Courses",
    description: "Explore the courses in the Ignify App.",
    keywords: [
        "Ignify",
        "Subjects",
        "Courses",
        "Study Management",
        "Education",
        "Learning",
        "Course Content"
    ],
    openGraph: {
        title: "Subject Courses - Ignify App",
        description: "Access all courses and detailed content for your selected subject in Ignify.",
        url: "http://ignify.fun/courses", 
        type: "website",
        images: [
            {
                url: "http://ignify.fun/_next/image?url=%2Flogo.jpeg&w=800&q=75", // Updated width for the image
                width: 800,
                height: 600,
                alt: "Ignify Courses Page",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Subject Courses - Ignify App",
        description: "View and manage all courses under your selected subject in the Ignify App.",
        image: "http://ignify.fun/_next/image?url=%2Flogo.jpeg&w=800&q=75",
    },
};


export default function subject({ children }) {
    return <>{children}</>;
}
