

export const metadata = {
    title: "Ignify Dashboard - Track Your Progress",
    description: "Effortlessly organize, track, and optimize your study sessions with Ignify's all-in-one dashboard.",
    keywords: [
        "Ignify Dashboard",
        "Study Management System",
        "Learning Hub",
        "Education Tools",
        "Student Productivity",
        "Study Planner",
        "Learning Tracker",
        "Personalized Learning",
        "Education Management",
        "Task Organization",
        "Dashboard for Students",
        "Subtopics Management",
        "Ignify App"
    ],
    openGraph: {
        title: "Ignify Dashboard - Streamline Your Learning",
        description:
            "Empower your studies with Ignify’s dashboard. Easily manage subtopics, monitor progress, and achieve your learning goals.",
        url: "https://ignify.fun/dashboard",
        type: "website",
        images: [
            {
                url: "http://ignify.fun/_next/image?url=%2Flogo.jpeg&w=800&q=75",
                width: 800,
                height: 600,
                alt: "Ignify Dashboard",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Ignify Dashboard - Your Personalized Study Planner",
        description:
            "Optimize your study experience with Ignify’s intuitive dashboard. Organize tasks, track subtopics, and boost productivity.",
        image: "http://ignify.fun/_next/image?url=%2Flogo.jpeg&w=800&q=75",
    },
};


export default function subject({ children }) {
    return <>{children}</>;
}
