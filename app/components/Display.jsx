"use client";

import { useState, useEffect } from "react";

const Display = ({ onViewChange, initialView = "List" }) => {
  const [selectedView, setSelectedView] = useState(initialView);

  // When view changes, notify parent component
  useEffect(() => {
    if (onViewChange) {
      onViewChange(selectedView);
    }
  }, [selectedView, onViewChange]);

  return (
    <div
      className="hidden md:flex h-[124px] rounded-[10px] flex-col gap-[12px] mt-[30px]
            pt-[20px] pr-[20px] pb-[12px] pl-[20px] bg-white shadow-[0px_4px_4px_0px_rgba(231,231,231,0.25),0px_3.94px_10px_0px_rgba(232,232,232,0.25),0px_4.34px_68px_0px_rgba(198,198,198,0.25)]"
    >
      <p className="font-bold text-[16px] leading-[100%] tracking-[0px] capitalize">
        Display
      </p>
      <div className="w-full h-[50px] flex justify-between rounded-[11px] px-[8px] items-center bg-[#F1F1F1]">
        <button
          onClick={() => setSelectedView("Grid")}
          className={`font-dmSans font-bold text-[14px] leading-[100%] tracking-[0px] w-[125px] h-[36px] rounded-[8px] cursor-pointer
            ${
              selectedView === "Grid"
                ? "bg-white shadow-md text-black"
                : "bg-transparent "
            }`}
        >
          Grid View
        </button>
        <button
          onClick={() => setSelectedView("List")}
          className={`font-dmSans font-bold text-[14px] leading-[100%] tracking-[0px] w-[125px] h-[36px] rounded-[8px] cursor-pointer
            ${
              selectedView === "List"
                ? "bg-white shadow-md text-black"
                : "bg-transparent "
            }`}
        >
          List View
        </button>
      </div>
    </div>
  );
};

export default Display;
