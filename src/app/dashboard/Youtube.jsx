"use client";
import axios from "axios";
import React, { useState } from "react";
import YouTubeSearchResults from "./YouTubeSearchResults";

export default function Youtube() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); 

  const handleSearch = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `/api/youtube-search?q=${query}`
      );
      if (response.status !== 200) throw new Error("Network response was not ok");
      console.log(response.data.data);
      
      setResults(response.data.data);
    } catch (error) {
      console.log(error);
      
      setError("Failed to fetch results.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>YouTube Search</h1>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search YouTube"
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </button>

      {error && <p>{error}</p>}

      <div>
        {results?<YouTubeSearchResults data={results}/> : <div>No result Found</div>}
      </div>
    </div>
  );
}
