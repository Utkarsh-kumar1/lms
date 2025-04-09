"use client"; // This makes the component a client component

import { MoreVertical, SortAsc, SortAscIcon, SortDesc } from "lucide-react";
import { useEffect, useReducer, useState } from "react";
import { BiSortAlt2 } from "react-icons/bi";
import { IoMdAdd } from "react-icons/io";
import TaskItem from "./TaskItem";
import TaskInput from "./TaskInput";
import ScheduledAndRecuringList from "./ScheduledAndRecuringList";

const actionTypes = {
  ADD_TASKS: "ADD_TASKS",
  UPDATE_TASK: "UPDATE_TASK",
  DELETE_TASK: "DELETE_TASK",
  SORT: "SORT",
};

// Reducer function
const reducer = (tasks, action) => {
  switch (action.type) {
    case actionTypes.ADD_TASKS:
      return [...tasks, action.payload];

    case actionTypes.UPDATE_TASK:
      return tasks.map((task) =>
        task.id === action.payload.id ? { ...task, ...action.payload } : task
      );

    case actionTypes.DELETE_TASK:
      return tasks.filter((task) => task.id !== action.payload.id);

    case actionTypes.SORT:
      return [...tasks].sort((task1, task2) => {
        const { key, ascending } = action.payload;
        const val1 = task1[key];
        const val2 = task2[key];

        const priorityOrder = { High: 1, Medium: 2, Low: 3 };
        let result = 0;

        if (typeof val1 === "number" && typeof val2 === "number") {
          result = val1 - val2;
        } else if (typeof val1 === "string" && typeof val2 === "string") {
          if (
            priorityOrder[val1] !== undefined &&
            priorityOrder[val2] !== undefined
          ) {
            result = priorityOrder[val1] - priorityOrder[val2];
          } else {
            result = val1.localeCompare(val2);
          }
        } else if (val1 instanceof Date && val2 instanceof Date) {
          result = val1.getTime() - val2.getTime();
        }

        return ascending ? result : -result;
      });

    default:
      return tasks;
  }
};

export default function TaskList({ initialTasks }) {
  const [tasks, dispatch] = useReducer(reducer, initialTasks);
  const [inputTask, setInputTask] = useState(false);
  const [showScheduledAndRecuring, setShowScheduledAndRecuring] =
    useState(false);
  const [sortingAsc, setSortingAsc] = useState(true);
  const [sortBy, setSortBy] = useState("startTime");

  const onAdd = (task) =>
    dispatch({ type: actionTypes.ADD_TASKS, payload: task });
  const onUpdate = (task) =>
    dispatch({ type: actionTypes.UPDATE_TASK, payload: task });
  const onDelete = (task) =>
    dispatch({ type: actionTypes.DELETE_TASK, payload: task });

  useEffect(() => {
    dispatch({ type: actionTypes.SORT, payload: { key: sortBy, ascending: sortingAsc } });
  }, [sortingAsc, sortBy]);

  return (
    <>
      <div className="flex w-full h-11 justify-end items-center space-x-4">
        <div className="flex items-center space-x-2 border rounded-md px-2 py-1 bg-gray-100 dark:bg-gray-800">
          <span
            className="text-sm"
            onClick={() => setSortingAsc((sortingAsc) => !sortingAsc)}
          >
            {sortingAsc ? (
              <SortAsc className="text-sm cursor-pointer hover:text-gray-500" />
            ) : (
              <SortDesc className="text-sm cursor-pointer hover:text-gray-500" />
            )}
          </span>
          <select
            name="sortBy"
            id="sortBy"
            className="bg-transparent outline-none text-sm"
            onChange={(e) => {
              setSortBy(e.target.value);
              // dispatch({ type: actionTypes.SORT, payload: { key: sortBy, ascending: sortingAsc } });
            }}
          >
            {[
              { text: "Time", value: "startTime" },
              { text: "Priority", value: "priority" },
              { text: "Duration", value: "duration" },
            ].map(({ text, value }) => (
              <option key={value} value={value}>
                {text}
              </option>
            ))}
          </select>
        </div>
        <IoMdAdd
          className="text-2xl cursor-pointer hover:text-gray-500"
          onClick={() => setInputTask(true)}
        />

        <MoreVertical onClick={() => setShowScheduledAndRecuring(true)} />
      </div>
      <div className="mt-4">
        {tasks.length > 0 ? (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onDelete={onDelete}
                onUpdate={onUpdate}
              />
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center mt-4">No tasks for today!</p>
        )}
      </div>
      {/* For Adding New Task */}
      <TaskInput
        isOpen={inputTask}
        onClose={(props) => {
          setInputTask(false);
          if (props) onAdd(props);
        }}
      />
      <ScheduledAndRecuringList
        isOpen={showScheduledAndRecuring}
        onClose={() => setShowScheduledAndRecuring((prev) => !prev)}
      />
    </>
  );
}
