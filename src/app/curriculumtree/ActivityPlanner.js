import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import api from "@/axios";

export default function ActivityPlanner({
  scheduleCount,
  setScheduleCount,
  completionDate,
  setCompletionDate,
  targetType,
  setTargetType,
  courseId,
}) {
  const [totalSubtopics, setTotalSubtopics] = useState(0);
  const startDate = new Date(); // always today

  const getDaysBetween = (end) => {
    if (!end) return 0;
    const e = new Date(end);
    return Math.max(0, Math.ceil((e - startDate) / (1000 * 60 * 60 * 24)));
  };

  const days = getDaysBetween(completionDate);

  let perDay = 0;
  let requiredDays = 0;

  if (targetType === "completion_date" && days > 0) {
    perDay = Math.ceil(totalSubtopics / days);
  } else if (targetType === "activity_count" && scheduleCount > 0) {
    requiredDays = Math.floor(totalSubtopics / scheduleCount);
  }

  useEffect(() => {
    api.get(`/subtopicsCountInCourse/${courseId}`).then((res) => {
      console.log(res.data.data[0].count);
      setTotalSubtopics(res.data.data[0].count);
    });
  }, []);

  return (
    <div className="space-y-6 p-6 mb-4 rounded-2xl border border-yellow-700 bg-white dark:bg-gray-800 shadow-lg max-w-md mx-auto">
      {/* Step 1: Mode Tabs */}
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
          Choose Planning Mode
        </p>
        <div className="flex rounded-lg overflow-hidden border dark:border-gray-600">
          <button
            onClick={() => setTargetType("completion_date")}
            className={`flex-1 px-4 py-2 text-sm font-medium transition ${
              targetType === "completion_date"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            Finish by Date
          </button>
          <button
            onClick={() => setTargetType("activity_count")}
            className={`flex-1 px-4 py-2 text-sm font-medium transition ${
              targetType === "activity_count"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            Daily Pace
          </button>
        </div>
      </div>

      {/* Step 2: Inputs */}
      <div className="space-y-4">
        {targetType === "activity_count" ? (
          // {/* Activity Counter */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Number of Activities
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  setScheduleCount((pre) => (pre > 0 ? pre - 1 : 0))
                }
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                <Minus className="w-4 h-4 text-gray-800 dark:text-white" />
              </button>
              <span className="px-4 text-lg font-semibold text-gray-800 dark:text-gray-100">
                {scheduleCount}
              </span>
              <button
                onClick={() => setScheduleCount((pre) => pre + 1)}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                <Plus className="w-4 h-4 text-gray-800 dark:text-white" />
              </button>
            </div>
          </div>
        ) : (
          // {/* Target Date */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Target Date
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (completionDate) {
                    const newDate = new Date(completionDate);
                    newDate.setDate(newDate.getDate() - 1);
                    setCompletionDate(newDate.toISOString().split("T")[0]);
                  }
                }}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                -1
              </button>
              <input
                type="date"
                value={new Date(completionDate).toISOString().split("T")[0] ?? ""}
                onChange={(e) => setCompletionDate(e.target.value)}
                className="flex-1 p-2 rounded-lg border dark:bg-gray-700 dark:text-white"
              />

              <button
                type="button"
                onClick={() => {
                  if (completionDate) {
                    const newDate = new Date(completionDate);
                    newDate.setDate(newDate.getDate() + 1);
                    setCompletionDate(newDate.toISOString().split("T")[0]);
                  }
                }}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                +1
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Step 3: Results */}
      <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
        {targetType === "completion_date" && days > 0 && (
          <p>
            Remaining activities:{" "}
            <span className="font-bold">{totalSubtopics}</span>
            <br /> You need to do{" "}
            <span className="bg-blue-600 text-white px-2 py-1 rounded-md inline-block whitespace-nowrap ">
              {perDay} per day
            </span>
            .
          </p>
        )}
        {targetType === "activity_count" && (
          <p>
            With <span className="font-bold">{totalSubtopics}</span> activities,
            doing {scheduleCount} per day will take{" "}
            <span className="bg-blue-600 text-white px-2 py-1 rounded-md inline-block whitespace-nowrap">
              {requiredDays} days
            </span>{" "}
            (finish by{" "}
            <span className="font-bold">
              {new Date(
                startDate.getTime() + requiredDays * 24 * 60 * 60 * 1000
              ).toDateString()}
            </span>
            ).
          </p>
        )}
        {!completionDate && targetType === "completion_date" && (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Please select a target date to calculate your plan.
          </p>
        )}
      </div>
    </div>
  );
}
