"use client";
import { useEffect, useState } from "react";
import api from "@/axios";
import Loader from "@/components/Loader";

export default async function Page() {

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch activity data from the API and send id in body
    // console.log("Fetching activity data for user ID:", user.id);
    api
      .get(
        "/subjects",
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        console.log("Subjects data fetched:", response.data.data);
        setSubjects(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching activity:", error);
      });
  }, []);

  // Check if the data is still loading
  if (loading) {
    return <Loader />;
  }

  return <SubjectContent subjects={subjects} />;
}
