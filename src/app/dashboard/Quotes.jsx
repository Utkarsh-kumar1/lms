"use client";
import api from "@/axios";
import Loader from "@/components/Loader";
import React, { useEffect, useState } from "react";

export default function Quotes() {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getQuote = async () => {
      try {
        const response = await api.get("/quoteOfDay", {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.status === 200) {
          setQuote(response?.data?.data);
        }
      } catch (error) {
        console.error("Error fetching quote:", error);
      } finally {
        setLoading(false);
      }
    };
    getQuote();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="">
      <div
        className=" text-center"
        style={{
          fontFamily: '"Delius", serif',
          fontWeight: 400,
          fontStyle: "normal",
        }}
      >
        {quote?.quote ?? "No Quotes Available"}
      </div>
      <div className="font-semibold italic mt-2 underline decoration-red-500 underline-offset-3">
        {quote?.author}
      </div>
    </div>
  );
}
