"use client"
import React, { useState } from "react";
import { Search } from "lucide-react";
import axios from "axios";
import YouTubeSearchResults from "./YouTubeSearchResults";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState(""); // State to store input value
  const [queryResult, setQueryResult] = useState({}); // State to store search results
  const [isSearching, setIsSearching] = useState(false);
  const [errors, setErrors] = useState({ queryError: "" });
  const [pageToken, setPageToken] = useState(""); // State to store pageToken

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
      console.log(error);
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
      console.log(error);
      setErrors({ ...errors, queryError: "Something went Wrong" });
    } 
  };

  return (
    <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
      <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
        <CardHeader className="flex sm:flex-row items-center">
          <div className="grid gap-2 w-full">
            <CardTitle className="text-md sm:text-2xl lg:text-base">
              Your YouTube Space
            </CardTitle>
          </div>
          <div className="flex w-full items-center md:ml-auto md:gap-2">
            <form
              className="ml-auto flex-1 sm:flex-initial"
              onSubmit={handleSubmit}
            >
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="YouTube Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 sm:w-[300px] md:w-[200px] lg:w-fit disabled:cursor-progress"
                  disabled={isSearching}
                  required
                />
              </div>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          {isSearching && <div>Loading...</div>}
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
      <Card x-chunk="dashboard-01-chunk-5 " className="h-fit">
        <CardHeader>
          <CardTitle>Daily Events</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-8">
          {/* Sales data content */}
        </CardContent>
      </Card>
    </div>
  );
}
