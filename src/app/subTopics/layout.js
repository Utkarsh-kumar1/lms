import { Inter } from "next/font/google";


export const metadata = {
    title: "LMS Subjects",
    description: "This is the sign-in page of the LMS App",
};

export default function subject({ children }) {
    return <div className="  w-full">{children}</div>;
}
