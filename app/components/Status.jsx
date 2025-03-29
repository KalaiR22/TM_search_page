"use client";
import { useState, useEffect, useRef, memo } from "react";
import { useSearchParams } from "next/navigation";

const statusesData = [
  { label: "All", color: "", isActive: true },
  { label: "Registered", color: "bg-green", isActive: false },
  { label: "Pending", color: "bg-yellow", isActive: false },
  { label: "Abandoned", color: "bg-redsec", isActive: false },
  { label: "Others", color: "bg-primaryblue", isActive: false },
];

const Status = memo(({ onStatusChange, selectedStatus }) => {
  const searchParams = useSearchParams();
  const [statuses, setStatuses] = useState(statusesData);
  const initialRenderRef = useRef(true);
  const prevStatusesRef = useRef([]);
  const statusChangeTimeoutRef = useRef(null);

  console.log("searchParam1", searchParams);

  // Initialize statuses from URL params only once on mount
  useEffect(() => {
    const statusParams = searchParams.getAll("status") || [];

    if (statusParams.length === 0) {
      setStatuses((prevStatuses) =>
        prevStatuses.map((status) => ({
          ...status,
          isActive: status.label === "All",
        }))
      );
      return;
    }

    const activeStatusLabels = statusParams.map(
      (param) => param.charAt(0).toUpperCase() + param.slice(1)
    );

    setStatuses((prevStatuses) =>
      prevStatuses.map((status) => ({
        ...status,
        isActive: activeStatusLabels.includes(status.label),
      }))
    );
  }, []); // Empty dependency array ensures this only runs once on mount

  // Only call onStatusChange when statuses actually change, and not on first render
  useEffect(() => {
    // Skip the initial render
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      prevStatusesRef.current = statuses.map(status => ({ 
        label: status.label, 
        isActive: status.isActive 
      }));
      return;
    }

    // Check if statuses have actually changed
    const activeStatusesChanged = !prevStatusesRef.current.every(prevStatus => {
      const currentStatus = statuses.find(s => s.label === prevStatus.label);
      return currentStatus && prevStatus.isActive === currentStatus.isActive;
    });

    if (activeStatusesChanged) {
      // Clear any existing timeout
      if (statusChangeTimeoutRef.current) {
        clearTimeout(statusChangeTimeoutRef.current);
      }
      
      // Set a new timeout to debounce the callback
      statusChangeTimeoutRef.current = setTimeout(() => {
        const activeStatusLabels = statuses
          .filter((status) => status.isActive && status.label !== "All")
          .map((status) => (status.label ? status.label.toLowerCase() : ""));

        // Update the previous statuses reference
        prevStatusesRef.current = statuses.map(status => ({ 
          label: status.label, 
          isActive: status.isActive 
        }));
        
        // Call the callback with the new active statuses
        onStatusChange(activeStatusLabels);
      }, 250);
      
      // Clean up on unmount or before next effect run
      return () => {
        if (statusChangeTimeoutRef.current) {
          clearTimeout(statusChangeTimeoutRef.current);
        }
      };
    }
  }, [statuses, onStatusChange]);

  const handleStatusClick = (clickedLabel) => {
    setStatuses((prevStatuses) => {
      let newStatuses;

      if (clickedLabel === "All") {
        newStatuses = prevStatuses.map((status) => ({
          ...status,
          isActive: status.label === "All",
        }));
      } else {
        newStatuses = prevStatuses.map((status) => {
          if (status.label === "All") {
            return { ...status, isActive: false };
          } else if (status.label === clickedLabel) {
            return { ...status, isActive: !status.isActive };
          }
          return status;
        });

        const anySpecificActive = newStatuses.some(
          (status) => status.label !== "All" && status.isActive
        );

        if (!anySpecificActive) {
          newStatuses = newStatuses.map((status) => ({
            ...status,
            isActive: status.label === "All",
          }));
        }
      }

      return newStatuses;
    });
  };

  return (
    <div
      className="h-fit bg-white rounded-[12px] flex flex-col gap-[10px] mt-[25px]
  pt-[14px] pr-[20px] pb-[25px] pl-[20px] shadow-[0px_4px_4px_0px_rgba(231,231,231,0.25),0px_3.94px_10px_0px_rgba(232,232,232,0.25),0px_4.34px_68px_0px_rgba(198,198,198,0.25)]"
    >
      <p className="font-bold text-[16px] leading-[100%] tracking-[0px] capitalize">
        Status
      </p>
      <div className="flex flex-wrap gap-[8px]">
        {statuses.map((status) => (
          <button
            key={status.label}
            onClick={() => handleStatusClick(status.label)}
            className={`flex items-center border-[1px] rounded-[12px] gap-[8px] px-[10px] h-[37px] cursor-pointer
              ${
                status.isActive
                  ? "border-primaryblue text-primaryblue bg-bgblue"
                  : "border-[#D1D1D1] text-black"
              }`}
          >
            {status.color && (
              <div
                className={`w-[10.24px] h-[10.24px] rounded-full ${status.color}`}
              ></div>
            )}
            <p className="font-semibold text-[14px] leading-[100%] tracking-[0px] capitalize">
              {status.label}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
});

Status.displayName = 'Status';

export default Status;
