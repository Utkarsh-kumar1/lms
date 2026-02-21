"use client"; // This makes the component a client component

import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Plus,
  SortAsc,
  SortAscIcon,
  SortDesc,
  ClipboardList,
  Trash2,
} from "lucide-react";

import { useEffect, useReducer, useRef, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import TaskItem from "./TaskItem";
import TaskInput from "./TaskInput";
import ScheduledAndRecuringList from "./ScheduledAndRecuringList";
import {
  FaHourglassStart,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { useSocket } from "@/context/SocketContext";
import api from "@/axios";
import { useAuth } from "@/context/AuthContext";

const actionTypes = {
  SET_TASKS: "SET_TASKS",
  ADD_TASKS: "ADD_TASKS",
  UPDATE_TASK: "UPDATE_TASK",
  DELETE_TASK: "DELETE_TASK",
  SORT: "SORT",
};

// Reducer function
const reducer = (tasks, action) => {
  switch (action.type) {
    case actionTypes.SET_TASKS:
      return action.payload;

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

// Main TaskList component
export default function TaskList() {
  const [tasks, dispatch] = useReducer(reducer, []);
  const [inputTask, setInputTask] = useState(false);
  const [showScheduledAndRecuring, setShowScheduledAndRecuring] =
    useState(false);
  const [sortingAsc, setSortingAsc] = useState(true);
  const [sortBy, setSortBy] = useState("startTime");
  const [date, setDate] = useState(new Date());
  const [showMore, setShowMore] = useState(false);
  const socket = useSocket();

  // For Todo's
  const [task, setTask] = useState("");
  const inputRef = useRef(null);
  const [refreshData, setRefreshData] = useState(false);
  const [todos, setTodos] = useState([]);
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
  const [showList, setShowList] = useState(false);
  const { user } = useAuth();
  const todoWrapperRef = useRef(null);

  const handleTodoBlur = (e) => {
    const nextFocused = e.relatedTarget;
    if (!todoWrapperRef.current.contains(nextFocused)) {
      setShowList(false);
    }
  };

  // Flip title every 5 seconds
  useEffect(() => {
    console.log("todos", currentTitleIndex, todos);
    const interval = setInterval(() => {
      setCurrentTitleIndex((prevIndex) =>
        todos.length > 0 ? (prevIndex + 1) % todos.length : 0
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [todos]);

  useEffect(() => {
    if (user) {
      console.log("user", user);
      // Fetch building blocks
      const today = "todo";

      const fetchToDos = async () => {
        try {
          const { data } = await api.get("/tasks", {
            params: { today },
          });

          console.log("All todos", data);
          setTodos(data.data);
        } catch (error) {
          console.error(error);
        }
      };
      fetchToDos();
    }
  }, [refreshData, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const title = task;
    if (!title.trim()) {
      return; // Prevent submission if the input is empty
    }

    const { success, error } = await api.post("/createTask", {
      title,
      priority: "Low",
    });
    if (success) {
      setRefreshData(!refreshData);
    }
    setTask(""); // Clear input after submission
  };

  const deleteTodo = async (id) => {
    try {
      const response = await api.delete(`deleteTask/${id}`);
      setRefreshData(!refreshData);
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const handleTitleClick = () => {
    setShowList(!showList);
  };

  const formatDateTodo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();

    const options = { month: "short", day: "numeric" };
    if (date.getFullYear() !== now.getFullYear()) {
      options.year = "numeric";
    }

    const formattedDate = date.toLocaleDateString("en-US", options);
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return { formattedDate, formattedTime };
  };

  const showTodo = (
    <div
      className="relative"
      ref={todoWrapperRef}
      onBlur={handleTodoBlur}
      tabIndex={0}
    >
      <form
        onSubmit={handleSubmit}
        className="shadow-xl rounded-lg dark:bg-gradient-to-br dark:from-slate-700 dark:to-slate-800 bg-gradient-to-br from-white to-slate-100 "
      >
        <input
          ref={inputRef}
          type="text"
          className="w-full border border-gray-300 rounded-lg p-3 text-sm font-semibold
          bg-white dark:bg-slate-600 dark:text-white 
          focus:outline-none focus:ring-2 focus:ring-blue-400 
          transition-all duration-300 ease-in-out 
          placeholder:italic placeholder-gray-400 
          focus:placeholder-transparent placeholder-gradient"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder={
            todos.length === 0
              ? "Add todos..."
              : todos[currentTitleIndex]?.title || "Add todos..."
          }
          onFocus={() => setShowList(true)}
        />

        <button
          type="submit"
          className="hidden w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
        >
          Submit
        </button>
      </form>

      {showList && todos.length > 0 && (
        <div
          className="absolute top-full right-0 bg-gradient-to-br from-blue-50 to-white dark:from-slate-700 dark:to-slate-800 
        p-4 shadow-xl w-64 max-h-48 overflow-y-auto border mt-2 rounded-lg"
          tabIndex={-1}
        >
          <ul className="divide-y divide-gray-200 dark:divide-slate-600">
            {todos.map((item) => {
              const { formattedDate, formattedTime } = formatDateTodo(
                item?.createdAt
              );
              return (
                <li
                  key={item?.id}
                  className="p-3 text-sm text-gray-700 dark:text-white hover:bg-blue-100 dark:hover:bg-slate-600 rounded-lg transition"
                >
                  <span className="font-semibold">{item?.title}</span>
                  <div className="text-xs text-gray-500 dark:text-gray-300 mt-1 flex justify-between items-center border-t pt-2">
                    <span>{formattedDate}</span>
                    <Trash2
                      onClick={() => {
                        deleteTodo(item?.id);
                      }}
                      className="w-4 h-4 text-red-500 cursor-pointer hover:scale-110 transition-transform"
                    />
                    <span>{formattedTime}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );

  // Todo: statusColors and getTextColor can be reused from TaskItem
  const statusColors = {
    Completed: "bg-green-100 dark:bg-green-500",
    "In Progress": "bg-yellow-100 dark:bg-yellow-500",
    Pending: "bg-gray-100 dark:bg-gray-500",
  };

  const textStatusColors = {
    Completed: "text-green-500",
    "In Progress": "text-yellow-500",
    Pending: "text-gray-500",
    Cancelled: "text-red-500",
  };

  const setChangeDate = (days) => {
    setDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + days);
      return newDate;
    });
  };

  function formatDateToLocalIST(date) {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  }

  useEffect(() => {
    const fdate = formatDateToLocalIST(date);
    // console.log(fdate);

    const fetchBuildingBlocks = async () => {
      try {
        const data = await api.get("/tasks", {
          params: { today: fdate },
        });
        // const data = await response.json()
        onSetTasks(data.data.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchBuildingBlocks();
  }, [date]);

  useEffect(() => {
    // console.log("In Tasklist socket", socket);
    if (socket) {
      socket.on("taskUpdated", (data) => {
        // console.log("getting update from websocket", data.updatedTask);
        onUpdate(data.updatedTask[0]);
      });

      socket.on("taskCreated", (data) => {
        console.log("getting created from websocket", data.createdTask);
        if (
          data.createdTask.length > 0 &&
          data.createdTask[0].dueDate === null
        ) {
          setTodos((prevTodos) => [data.createdTask[0], ...prevTodos]);
        } else {
          onAdd(data.createdTask[0]);
        }
      });

      return () => {
        console.log("Cleaning up socket listener for taskUpdated");
        socket.off("taskUpdated");
        socket.off("taskCreated");
      };
    }
  }, [socket]);

  const isToday = () => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const onSetTasks = (tasks) =>
    dispatch({ type: actionTypes.SET_TASKS, payload: tasks });
  const onAdd = (task) => {
    dispatch({ type: actionTypes.ADD_TASKS, payload: task });
    dispatch({
      type: actionTypes.SORT,
      payload: { key: sortBy, ascending: sortingAsc },
    });
  };
  const onUpdate = (task) => {
    dispatch({ type: actionTypes.UPDATE_TASK, payload: task });
    dispatch({
      type: actionTypes.SORT,
      payload: { key: sortBy, ascending: sortingAsc },
    });
  };
  const onDelete = (task) =>
    dispatch({ type: actionTypes.DELETE_TASK, payload: task });

  useEffect(() => {
    dispatch({
      type: actionTypes.SORT,
      payload: { key: sortBy, ascending: sortingAsc },
    });
  }, [sortingAsc, sortBy]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();

    const options = { weekday: "long", month: "short", day: "numeric" };
    if (date.getFullYear() !== now.getFullYear()) {
      options.year = "numeric";
    }

    const formattedDate = date.toLocaleDateString("en-US", options);
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return { formattedDate, formattedTime };
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row  w-full h-auto  justify-items-end items-center space-x-4 fixed z-10 bg-white/30 dark:bg-transparent backdrop-blur-md pr-24  ">
        {/* Date change section */}
        <div className="mx-2 w-full ">
          <div className="flex items-center justify-center sm:justify-between space-x-4 rounded-lg ">
            <div className="flex items-center justify-between space-x-4">
              {/* Left Arrow */}
              <button
                onClick={() => setChangeDate(-1)}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300"
              >
                <ChevronLeft />
              </button>

              {/* Date in Center */}
              <div className="text-lg font-semibold">
                {formatDate(date).formattedDate}
              </div>

              {/* Right Arrow */}
              <button
                onClick={() => setChangeDate(1)}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300"
              >
                <ChevronRight />
              </button>

              {/* Go to Today Button */}
              {!isToday() && (
                <button
                  onClick={() => setDate(new Date())}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                >
                  Go to Today
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Todo show only for tablet and laptop screen */}
        <div className="min-w-20 shadow-lg rounded-lg ">{showTodo}</div>

        {/* {user && (
          
        )} */}

        <div className="flex h-11 justify-end items-center space-x-4  max-w-full ">
          {/* Showing count based on status for today's tasks */}
          {tasks?.filter((task) => task.status === "Pending").length > 0 ? (
            <div
              className={`flex items-center justify-center gap-2 ${
                textStatusColors["Pending"] ||
                "text-green-100 dark:text-gray-700"
              }`}
            >
              <FaHourglassStart title="Pending" />
              {tasks?.filter((task) => task.status === "Pending").length}
            </div>
          ) : (
            <></>
          )}

          {tasks?.filter((task) => task.status === "In Progress").length > 0 ? (
            <div
              className={`flex items-center justify-center gap-2 ${
                textStatusColors["In Progress"] ||
                "text-green-100 dark:text-gray-700"
              }`}
            >
              <FaSpinner title="In Progress" />
              {tasks?.filter((task) => task.status === "In Progress").length}
            </div>
          ) : (
            <></>
          )}

          {tasks?.filter((task) => task.status === "Completed").length > 0 ? (
            <div
              className={`flex items-center justify-center gap-2 ${
                textStatusColors["Completed"] ||
                "text-green-100 dark:text-gray-700"
              }`}
            >
              <FaCheckCircle title="Completed" />
              {tasks?.filter((task) => task.status === "Completed").length}
            </div>
          ) : (
            <></>
          )}

          {tasks?.filter((task) => task.status === "Cancelled").length > 0 ? (
            <div
              className={`flex items-center justify-center gap-2 ${
                textStatusColors["Cancelled"] ||
                "text-green-100 dark:text-gray-700"
              }`}
            >
              <FaTimesCircle title="Cancelled" />
              {tasks?.filter((task) => task.status === "Cancelled").length}
            </div>
          ) : (
            <></>
          )}

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
          <div>
            <IoMdAdd
              className="text-2xl cursor-pointer hover:text-gray-500"
              onClick={() => setInputTask(true)}
            />
          </div>

          <div>
            <MoreVertical onClick={() => setShowScheduledAndRecuring(true)} />
          </div>
        </div>
      </div>

      <div className="mt-12 pt-20 md:mt-4 lg:mt4 md:pt-10 lg:pt-25">
        {tasks?.length > 0 ? (
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
        onClose={() => {
          setInputTask(false);
        }}
      />

      <ScheduledAndRecuringList
        isOpen={showScheduledAndRecuring}
        onClose={() => setShowScheduledAndRecuring((prev) => !prev)}
      />
      {/* Heading and Show More Button for Streak Details */}
      <div className="flex items-center gap-2 m-2">
        <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100">
          Habit Timeline
        </h3>
        <button
          onClick={() => setShowMore(!showMore)}
          className="text-blue-500 hover:underline text-[9px]"
        >
          {showMore ? "Show Less" : "Show More"}
        </button>
      </div>

      {/* Streak */}
      {showMore && (
        <div className="text-sm space-y-1 m-2">
          <div>
            <span className=" text-green-600 dark:text-green-400">
              Spark (Days 1–7):
            </span>{" "}
            Start small to ignite change
          </div>
          <div>
            <span className=" text-blue-600 dark:text-blue-400">
              Momentum (Week 2–4):
            </span>{" "}
            Build consistency with tiny wins
          </div>
          <div>
            <span className=" text-purple-600 dark:text-purple-400">
              Rhythm (Month 2–3):
            </span>{" "}
            Integrate habits into your flow
          </div>
          <div>
            <span className=" text-yellow-600 dark:text-yellow-400">
              Identity (Month 4–6):
            </span>{" "}
            Become the person your habits reflect
          </div>
          <div>
            <span className=" text-red-600 dark:text-red-400">
              Mastery (6+ Months):
            </span>{" "}
            Expand and reinforce lasting success
          </div>
        </div>
      )}
    </>
  );
}
