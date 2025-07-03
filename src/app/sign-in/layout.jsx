import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "LMS Sign-in",
  description: "This is the sign-in page of the LMS App",
};

export default function SignIn({ children }) {
  return (
    <div className="w-full h-full flex items-center justify-center dark:bg-gray-900 bg-[url(/bgSignIn.svg)] bg-cover bg-no-repeat bg-center">
      {children}
    </div>
  );
}
