"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  if (user) {
    // If user is logged in, redirect to dashboard
    router.push("/dashboard");
    return null; // Prevent rendering the landing page
  }
  return (
    <div className="w-full h-full gap-3 p-4 sm:p-6 flex flex-col items-center justify-center bg-gradient-to-br from-[#8EC5FC] via-[#E0C3FC] to-[#8EC5FC]">
      {[
        {
          title: "Plan. Track. Achieve.",
          subtitle: "Study. Revisions. Success. Simplified",
          cta: "Ignite Your Productivity",
          button: "Try Ignify Today!",
          link: "/sign-in",
          reverse: false,
          img: "Hero.png",
        },
        {
          title: "Task Management",
          subtitle: "Stay on Top of Your Tasks",
          cta: "No More Missed Deadlines!",
          reverse: false,
          img: "img1.png",
        },
        {
          title: "Automated Reminders",
          subtitle: "We Take Care of the Reminders",
          cta: "You Take Care of Achieving Your Goals!",
          reverse: true,
          img: "img2.png",
        },
        {
          title: "Revision Scheduler",
          subtitle: "Never Cram Again",
          cta: "Perfectly Timed Revisions!",
          reverse: false,
          img: "img3.png",
        },
        {
          title: "Analytics & Insights",
          subtitle: "Track Progress.",
          cta: "Improve Performance",
          reverse: true,
          img: "img4.jpg",
        },
        {
          title: "Study Planner",
          subtitle: "Customize Your Study Schedule.",
          cta: "Maximum Efficiency.",
          reverse: false,
          img: "img5.png",
        },
      ].map(({ title, subtitle, cta, button, link, reverse, img }, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: index * 0.05 }}
          className={`w-full sm:h-auto sm:py-10 flex flex-col ${
            reverse ? "sm:flex-row-reverse" : "sm:flex-row"
          } p-6 sm:p-10 rounded-2xl items-center justify-evenly gap-6 bg-gradient-to-r from-[#6a11cb] via-[#2575fc] to-[#6a11cb] shadow-lg`}
        >
          <motion.div
            className="flex flex-col justify-center sm:w-1/2 p-4 gap-4 sm:gap-8 font-serif text-gray-900"
            initial={{ opacity: 0, x: reverse ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              {title}
            </h2>
            <p className="text-lg sm:text-xl text-[#d1e8ff]">
              {subtitle}
              <span className="block font-semibold text-[#ffeb3b]">{cta}</span>
            </p>
            {button && link && (
              <motion.div whileHover={{ scale: 1.05 }} className="flex">
                <Link
                  href={link}
                  className="px-6 py-3 rounded-full bg-[#ffeb3b] text-gray-900 shadow-md hover:bg-[#fbc02d] transition"
                >
                  {button}
                </Link>
              </motion.div>
            )}
          </motion.div>
          <motion.div
            className="w-full sm:w-1/2 h-auto rounded-3xl overflow-hidden flex items-center justify-center bg-white"
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
          >
            <Image
              src={`/${img || "default.png"}`}
              alt={title}
              width={600}
              height={400}
              className="rounded-2xl object-contain max-h-80 w-auto h-auto"
            />
          </motion.div>
        </motion.div>
      ))}

      <motion.footer
        className="w-full bg-[#1a237e] text-white py-6 mt-10 text-center rounded-md"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-lg font-semibold">
            Ignify &copy; {new Date().getFullYear()}
          </p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="/about" className="hover:underline text-[#ffeb3b]">
              About
            </Link>
            <Link href="/contact" className="hover:underline text-[#ffeb3b]">
              Contact
            </Link>
            <Link href="/privacy" className="hover:underline text-[#ffeb3b]">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:underline text-[#ffeb3b]">
              Terms of Service
            </Link>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
