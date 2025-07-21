import React from "react";

const LoadMoreDataButton = ({ onClick, isVisible, loading }) => {
  if (!isVisible) return null;

  return (
    <div className="text-dark-gray my-6">
      <button
        onClick={onClick}
        disabled={loading}
        className="hover:bg-gray/30 flex cursor-pointer items-center gap-2 rounded-lg p-2 px-3"
      >
        {loading ? "Loading..." : "Load More"}
      </button>
    </div>
  );
};

export default LoadMoreDataButton;
