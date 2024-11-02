import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Ignify Activity",
  description:
    "Get automated study schedules and track your progress on topics within the Ignify app.",
  keywords: [
    "Ignify",
    "Activity",
    "Study Schedule",
    "Automated Topics",
    "Education",
    "Learning",
    "Study Management",
    "Time Management",
  ],
  openGraph: {
    title: "Activity - Ignify App",
    description:
      "Access your automated study schedule and track topic progress with Ignify’s activity manager.",
    url: "https://ignify.fun/activity",
    type: "website",
    images: [
      {
        url: "http://ignify.fun/_next/image?url=%2Flogo.jpeg&w=32&q=75",
        width: 800,
        height: 600,
        alt: "Ignify Activity Page",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Activity - Ignify App",
    description:
      "Stay on track with automated study schedules and progress tracking on Ignify.",
    image: "http://ignify.fun/_next/image?url=%2Flogo.jpeg&w=32&q=75",
  },
};



export default function subject({ children }) {
  return <div className="h-full   w-full">{children}</div>;
}
