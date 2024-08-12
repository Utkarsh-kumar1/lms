"use client"
import React from "react";

const YouTubeSearchResults = ({ data, onShowMore }) => {
  console.log(data);

  return (
    <div>
      <div className="flex flex-wrap gap-6 sm:p-6">
        {data?.items
          ?.filter(
            (item) =>
              !item.snippet.title.toLowerCase().includes("#shorts") &&
              (item.id.kind === "youtube#video" ||
                item.id.kind === "youtube#playlist")
          )
          .map((item , index) => {
            const { id, snippet } = item;
            const isVideo = id.kind === "youtube#video";
            const isPlaylist = id.kind === "youtube#playlist";

            return (
              <div
                key={index}
                className="flex flex-col flex-wrap sm:flex-row bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden w-full"
              >
                <a
                  href={
                    isVideo
                      ? `https://www.youtube.com/watch?v=${id.videoId}`
                      : `https://www.youtube.com/playlist?list=${id.playlistId}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className=" h-fit w-fit"
                >
                  <img
                    src={snippet.thumbnails.high.url}
                    alt={snippet.title}
                    className="aspect-auto"
                  />
                </a>
                <div className="p-4 flex-1 flex flex-col min-w-[170px]">
                  <h3 className="text-lg font-semibold mb-2">
                    {snippet.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {snippet.description}
                  </p>
                  <p className="text-sm text-gray-500">
                    Channel: {snippet.channelTitle}
                  </p>
                  <p className="text-sm text-gray-500">
                    Published:{" "}
                    {new Date(snippet.publishedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
      </div>
      {data?.nextPageToken && (
        <button
          onClick={() => onShowMore(data.nextPageToken)}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Show More
        </button>
      )}
    </div>
  );
};

export default YouTubeSearchResults;
