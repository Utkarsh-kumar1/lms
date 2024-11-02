import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Ignify Subjects",
  description: "Manage and edit subject data within the Ignify App",
  keywords: [
    "Ignify",
    "Subjects",
    "Study Management",
    "Edit Content",
    "Education",
    "LMS"
  ],
  openGraph: {
    title: "Subjects - Ignify App",
    description:
      "View, manage, and edit subject data in the Ignify study management system.",
    url: "https://ignify.fun/subjects",
    type: "website",
    images: [
      {
        url: "http://ignify.fun//_next/image?url=%2Flogo.jpeg&w=32&q=75",
        width: 800,
        height: 600,
        alt: "Ignify Subjects Page",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Subjects - Ignify App",
    description:
      "Edit and manage subjects in the Ignify study management system.",
    image: "http://ignify.fun//_next/image?url=%2Flogo.jpeg&w=32&q=75",
  },
};


export default function subject({ children }) {
  return <div className="h-full   w-full">{children}</div>;
}
