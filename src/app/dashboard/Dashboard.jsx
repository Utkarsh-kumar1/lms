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
    <div className="flex flex-col w-full gap-6 p-6 bg-gray-100 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* YouTube Search Card */}
        <Card className="w-full lg:w-2/3  bg-white shadow-md rounded-lg">
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <CardTitle className="text-lg font-bold text-gray-800">
              Your YouTube Space
            </CardTitle>
            <form
              className="flex items-center mt-4 sm:mt-0"
              onSubmit={handleSubmit}
            >
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="YouTube Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-full md:min-w-[300px] disabled:cursor-progress"
                  disabled={isSearching}
                  required
                  autoFocus
                />
              </div>
            </form>
          </CardHeader>
          <CardContent className="mt-4">
            {isSearching && <div className="text-gray-600">Loading...</div>}
            {errors.queryError && (
              <div className="text-red-500">{errors.queryError}</div>
            )}
            {queryResult && !isSearching && (
              <YouTubeSearchResults
                data={queryResult}
                onShowMore={handleShowMore}
              />
            )}
          </CardContent>
        </Card>

        {/* Daily Activities Card */}
        <Card className="h-fit lg:w-1/3  bg-white shadow-md rounded-lg">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-800 flex justify-between items-center">
              <div> Daily Activities</div>
              <Dialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                className="flex"
              >
                <DialogTrigger
                  asChild
                  className=" shadow-xl hover:bg-slate-50 hover:scale-[1.1] min-h-11 min-w-11 "
                >
                  <Plus className=" cursor-pointer shadow-sm p-2   rounded-lg" />
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Add Daily Activity</DialogTitle>
                    <DialogDescription></DialogDescription>
                  </DialogHeader>

                  <Input
                    id="name"
                    onChange={(e) => setActivityInput(e.target.value)}
                    value={activityInput}
                    placeholder="Activity Name"
                    className="col-span-3"
                  />
                  <DialogFooter>
                    <Button type="button" onClick={addActivity}>
                      Add Activity
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent className="">
            <DailyActivities
              activities={activities}
              setActivities={setActivities}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
