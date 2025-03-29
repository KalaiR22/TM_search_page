"use client";
import { useState, useEffect } from "react";

const FilterHeader = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Close filters when screen size becomes large
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // lg breakpoint
        setIsFilterOpen(false);

        // Also update the global state
        if (typeof window !== "undefined") {
          window.isFilterOpenState = false;
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Set up global variables for communication
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.isFilterOpenState = isFilterOpen;
      window.toggleFilter = function () {
        setIsFilterOpen(!isFilterOpen);
      };
    }
  }, [isFilterOpen]);

  const handleFilterClick = () => {
    const newState = !isFilterOpen;
    setIsFilterOpen(newState);

    // Update global state
    if (typeof window !== "undefined") {
      window.isFilterOpenState = newState;
    }
  };

  return (
    <div className="flex items-center gap-[25px] py-[25px] justify-center">
      <button
        className="flex items-center cursor-pointer justify-center w-[95px] h-[42px] border-[1.5px] border-solid border-greyborder rounded-[8px] p-[9px] gap-[10px]"
        onClick={handleFilterClick}
      >
        <img src="/assets/filter.svg" alt="filter" />
        <span className="font-medium text-[12px] leading-[100%] tracking-[0%] text-secdarkgrey">
          Filter
        </span>
      </button>
      <button className="w-[32px] cursor-pointer h-[32px] rounded-full border-[1.5px] border-solid border-greyborder items-center flex justify-center">
        <img src="/assets/share.svg" alt="" />
      </button>
      <button className="w-[32px] cursor-pointer h-[32px] rounded-full border-[1.5px] border-solid border-greyborder items-center flex justify-center">
        <img src="/assets/graph.svg" alt="" />
      </button>
    </div>
  );
};

export default FilterHeader;
