"use client";
import React, { useRef, useState, useEffect } from "react";
import { LoaderCircle, Plus} from "lucide-react";
import axios from "axios";
import { AddActivity } from "@/actions/AddActivity";
import { useOptimistic } from "react";
import { ActivityItem } from "./ActivityItem";

function DailyActivities({ userData }) {
  const [showPrevious, setShowPrevious] = useState(false);
  const [date, setDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [previousDayActivities, setPreviousDayActivities] = useState([]);
  const [activityCache, setActivityCache] = useState({}); // Cache to store fetched activities
  const formRef = useRef();

  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [optimisticActivities, addOptimisticActivities] = useOptimistic(
    userData.dailyActivitiesScheduledsView,
    (state, newActivity) => [...state, newActivity]
  );

  // Effect to trigger API call when the date changes
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const formattedDate = date.toISOString().split("T")[0]; // Format as YYYY-MM-DD

        // Check if activities for the current date are already cached
        if (activityCache[formattedDate]) {
          setPreviousDayActivities(activityCache[formattedDate]); // Use cached data
          return;
        }

        setIsLoading(true);
        const {
          data: { data },
        } = await axios.get(`/api/dailyActivities?date=${formattedDate}`);

        // Store fetched activities in cache
        setActivityCache((prevCache) => ({
          ...prevCache,
          [formattedDate]: data,
        }));

        setPreviousDayActivities(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching previous day activities:", error);
        setIsLoading(false);
      }
    };

    if (showPrevious) {
      fetchActivities(); // Fetch activities if we're showing the previous day
    }
  }, [date, showPrevious]);

  // Handle show previous day activities
  const handleShowPrevious = () => {
    setDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(prevDate.getDate() - 1);
      return newDate;
    });
    setShowPrevious(true);
  };

  // Handle showing today's activities
  const handleShowToday = () => {
    setShowPrevious(false);
    setDate(new Date());
  };

  return (
    <>
      <div className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 text-center">
        Daily Activities
      </div>
      {/* Add New Activity */}
      <form
        className="flex items-center mb-6"
        action={async (e) => {
          const activityName = e.get("newActivity");
          showPrevious && setShowPrevious(false);
          addOptimisticActivities({
            id: Math.random(),
            owner: userData.id,
            task: activityName,
            startDate: new Date().toISOString().split("T")[0],
            isCompleted: 0,
            streak: 0,
            isBestStreak: null,
          });
          AddActivity(activityName).then(({ error, success }) => {});
          formRef.current.reset();
        }}
        ref={formRef}
      >
        <input
          type="text"
          placeholder="Add New Activity"
          className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
          name="newActivity"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 dark:bg-blue-600 text-white p-2 ml-2 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>
      {/* Toggle Show Previous Day Activity */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handleShowPrevious}
          className="text-white bg-gray-500 dark:bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700"
        >
          Show Previous
        </button>
        <button
          onClick={handleShowToday}
          className="text-white bg-gray-500 dark:bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700"
        >
          Today
        </button>
      </div>
      {/* Display Activities */}
      <p className="font-bold mb-4 text-gray-800 dark:text-gray-200">
        {formattedDate}
      </p>
      <div className="overflow-auto max-h-[400px] border border-gray-200 dark:border-gray-700 rounded-lg p-1 sm:p-4 bg-gray-50 dark:bg-gray-800">
        {!showPrevious ? (
          optimisticActivities?.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))
        ) : (
          <>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-4 p-6 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-md min-h-[350px]">
                <LoaderCircle
                  className="animate-spin text-blue-600 dark:text-blue-400"
                  size={36}
                />
                <p className="text-gray-800 dark:text-gray-200">
                  Loading previous day activities...
                </p>
              </div>
            ) : (
              previousDayActivities?.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            )}
          </>
        )}
      </div>
    </>
  );
}

export default DailyActivities;
