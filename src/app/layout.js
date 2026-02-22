import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "@/context/theme-provider";
import { SocketProvider } from "@/context/SocketContext";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Ignify",
  description: "Goals Management System",
  head: (
    <>
      <style>
        @import
        url(&apos;https://fonts.googleapis.com/css2?family=Delius&family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900&display=swap&apos;);
      </style>
      <style>
        @import
        url(&apos;https://fonts.googleapis.com/css2?family=Delius&family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap&apos;);
      </style>
    </>
  ),
};

export default async function RootLayout({ children }) {

  return (
    <html lang="en" suppressHydrationWarning>
      <link rel="icon" href="/logo.jpeg" sizes="any" />
      <body className={`${inter.className}  overflow-x-hidden `}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SocketProvider>
              <SidebarProvider defaultOpen={false}>
                <AppSidebar />
                <main className=" relative flex-1 overflow-hidden pointer-events-auto bg-gray-100  dark:bg-gray-800">
                  <Header />

                  {children}
                </main>
              </SidebarProvider>

              <Toaster />
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
