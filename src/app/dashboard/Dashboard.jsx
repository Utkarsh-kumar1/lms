"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import React, { useState } from "react";
import { Plus, Search } from "lucide-react";
import axios from "axios";
import YouTubeSearchResults from "./YouTubeSearchResults";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import StatisticsDashboard from "./StatisticsDashboard";
import DailyActivities from "./DailyActivities";
import { IoAddCircleSharp } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import ChartLine from "./ChartLine";

export default function Dashboard({ userData }) {
  const [searchQuery, setSearchQuery] = useState(""); // State to store input value
  const [queryResult, setQueryResult] = useState({}); // State to store search results
  const [isSearching, setIsSearching] = useState(false);
  const [errors, setErrors] = useState({
    queryError: "",
    addActivityError: "",
  });
  const [pageToken, setPageToken] = useState(""); // State to store pageToken
  const [activityInput, setActivityInput] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activities, setActivities] = useState([]); // State to store activities

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    setQueryResult(null); // Reset results before fetching new data

    try {
      const response = await axios.get(`/api/youtube-search?q=${searchQuery}`);
      if (response.status !== 200) {
        setErrors({ ...errors, queryError: "Error while Searching Result" });
        return;
      }
      setErrors({ ...errors, queryError: "" });
      setQueryResult(response.data.data);
      setPageToken(response.data.data.nextPageToken || ""); // Update pageToken
    } catch (error) {
      setErrors({ ...errors, queryError: "Something went Wrong" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleShowMore = async (nextPageToken) => {
    try {
      const response = await axios.get(
        `/api/youtube-search?q=${searchQuery}&pageToken=${nextPageToken}`
      );
      if (response.status !== 200) {
        setErrors({
          ...errors,
          queryError: "Error while Fetching More Results",
        });
        return;
      }
      setErrors({ ...errors, queryError: "" });
      setQueryResult((prev) => ({
        ...prev,
        items: [...prev.items, ...response.data.data.items],
      }));
      setPageToken(response.data.data.nextPageToken || ""); // Update pageToken
    } catch (error) {
      setErrors({ ...errors, queryError: "Something went Wrong" });
    }
  };

  const addActivity = async () => {
    if (!activityInput) {
      setErrors({ ...errors, addActivityError: "Activity Name is required" });
      return;
    }

    try {
      const response = await axios.patch("/api/dailyActivities", {
        activityName: activityInput,
      });
      

      if (response.status === 200) {
        // Re-fetch activities or update the state directly
        setActivities((prev)=>[...prev , response.data.data]);
        setActivityInput(""); // Clear the input field
        setIsDialogOpen(false); // Close the dialog
      }
    } catch (error) {
      setErrors({ ...errors, addActivityError: "Failed to add activity" });
    }
  };

  return (
    <div >
      <ChartLine />
    </div>

  );
}
