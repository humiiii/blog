import React from "react";
import { PiSmileySad } from "react-icons/pi";

const Nodata = ({ message = "No data found." }) => {
  return (
    <div className="mt-6 flex w-full items-center justify-center rounded-lg px-4 py-8">
      <span className="flex items-center gap-4 text-lg font-medium text-neutral-500 dark:text-neutral-400">
        <PiSmileySad className="text-3xl" />
        {message}
      </span>
    </div>
  );
};

export default Nodata;
