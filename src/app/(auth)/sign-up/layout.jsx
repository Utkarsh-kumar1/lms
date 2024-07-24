import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "LMS Sign-up",
  description: "This is the sign-up page of the LMS App",
};

export default function SignUp({ children }) {
  return (<>{children}</>
      
  );
}
