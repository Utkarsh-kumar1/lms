"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ActivityDataRow from "./ActivityDataRow";

const fetchActivities = async (date) => {
  const response = await axios.get(`/api/dailyActivities?date=${date.split(', ')[0].split('/').reverse().join('-')}`);
  return response.data.data;
};

function formatDate(inputDate) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [day, month, year] = inputDate.split(",")[0].split("/");
  return `${day} ${months[parseInt(month)-1]} ${year}`;
}

export default function DailyActivities({ activities, setActivities }) {
  const [date, setDate] = useState(new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' })); // Default to today   


  useEffect(() => {
    const loadData = async () => {
      const data = await fetchActivities(date);
      setActivities(data);
    };
    loadData();
  }, [date, setActivities]);

  const handlePreviousDay = () => {
    const oneDayAgo = new Date(new Date(date.split(', ')[0].split('/').reverse().join('-')).setDate(date.split(', ')[0].split('/')[0] -1 )).toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' });
    setDate(oneDayAgo);
  };

  const handleToday = () => {
    setDate(new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' }).split(',')[0]);
  };

  return (
    <div className=" overflow-y-auto max-h-96 mx-auto rounded-lg">
      <div className="mb-6">
        <div className="flex justify-between gap-4 mb-4">
          <button
            onClick={handlePreviousDay}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            See Previous Day
          </button>
          <button
            onClick={handleToday}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            See Today
          </button>
        </div>
        <p>{formatDate(date)}</p>
      </div>
      <div className=" overflow-auto max-h-64">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities?.length > 0 ? (
              activities?.map((activity, index) => (
                <ActivityDataRow activity={activity} key={index} />
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan="3"
                  className="text-center py-4 text-gray-500"
                >
                  No activities found for the day.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

