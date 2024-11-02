import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Ignify Revision",
  description:
    "Review and revise subjects within the Ignify study management app.",
  keywords: [
    "Ignify",
    "Revision",
    "Study Management",
    "Subject Review",
    "Education",
    "Learning",
    "Study Planner",
  ],
  openGraph: {
    title: "Revision - Ignify App",
    description:
      "Access your subject revisions and track your learning progress in the Ignify App.",
    url: "https://ignify.fun/revision",
    type: "website",
    images: [
      {
        url: "http://ignify.fun/_next/image?url=%2Flogo.jpeg&w=32&q=75",
        width: 800,
        height: 600,
        alt: "Ignify Revision Page",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Revision - Ignify App",
    description:
      "Keep up with your subject revisions and study goals in the Ignify App.",
    image: "http://ignify.fun/_next/image?url=%2Flogo.jpeg&w=32&q=75",
  },
};


export default function subject({ children }) {
  return <div className="h-full   w-full">{children}</div>;
}
