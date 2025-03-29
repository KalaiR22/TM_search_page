"use client";
import { useState, useEffect, useMemo, useRef, memo } from "react";

const Options = memo(({
  aggregations,
  loading,
  onOptionsChange,
  selectedFilters,
}) => {
  const [activeTab, setActiveTab] = useState("Owners");
  const [selectedItems, setSelectedItems] = useState({
    Owners: [],
    "Law Firms": [],
    Attorneys: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const initialRenderRef = useRef(true);
  const optionsChangeTimeoutRef = useRef(null);

  const options = ["Owners", "Law Firms", "Attorneys"];

  // Initialize selected items from props
  useEffect(() => {
    if (selectedFilters) {
      setSelectedItems({
        Owners: selectedFilters.owners || [],
        "Law Firms": selectedFilters.law_firms || [],
        Attorneys: selectedFilters.attorneys || [],
      });
    }
  }, [selectedFilters]);

  // Add effect to call onOptionsChange when selectedItems change - with debounce
  useEffect(() => {
    // Skip the initial render to prevent unnecessary updates
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }
    
    // Clear any existing timeout
    if (optionsChangeTimeoutRef.current) {
      clearTimeout(optionsChangeTimeoutRef.current);
    }
    
    // Set a new timeout to debounce the callback
    optionsChangeTimeoutRef.current = setTimeout(() => {
      // Make sure the call to parent happens with the latest selection
      const hasSelectedItems = 
        selectedItems.Owners.length > 0 || 
        selectedItems["Law Firms"].length > 0 || 
        selectedItems.Attorneys.length > 0;
      
      onOptionsChange(selectedItems);
    }, 250);
    
    // Clean up on unmount or before next effect run
    return () => {
      if (optionsChangeTimeoutRef.current) {
        clearTimeout(optionsChangeTimeoutRef.current);
      }
    };
  }, [selectedItems, onOptionsChange]);

  // Mapping aggregation keys
  const getDataForTab = (tab) => {
    switch (tab) {
      case "Owners":
        return (
          aggregations?.current_owners?.buckets?.map((item) => item.key) || []
        );
      case "Law Firms":
        return aggregations?.law_firms?.buckets?.map((item) => item.key) || [];
      case "Attorneys":
        return aggregations?.attorneys?.buckets?.map((item) => item.key) || [];
      default:
        return [];
    }
  };

  // Memoizing the currentData
  const currentData = useMemo(
    () => getDataForTab(activeTab),
    [activeTab, aggregations]
  );

  // Update filtered data when tab or search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredData(currentData);
    } else {
      setFilteredData(
        currentData.filter((item) =>
          item.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, currentData]);

  const toggleSelection = (item) => {
    setSelectedItems((prev) => {
      const updatedList = prev[activeTab].includes(item)
        ? prev[activeTab].filter((i) => i !== item)
        : [...prev[activeTab], item];
      
      return { ...prev, [activeTab]: updatedList };
    });
  };

  // Memoize the filtered data rendering for better performance
  const renderFilteredData = useMemo(() => {
    if (loading) {
      return (
        <div className="w-full flex justify-center text-black items-center py-4">
          <p>Loading ...</p>
        </div>
      );
    }

    if (filteredData.length === 0) {
      if (searchTerm) {
        return (
          <p className="text-[#777777] text-[14px] py-[4px]">
            No results found for "{searchTerm}"
          </p>
        );
      }
      return (
        <p className="text-[#777777] text-[14px] py-[4px]">
          No data available
        </p>
      );
    }

    return (
      <div className="mt-[12px] max-h-[130px] flex flex-col gap-[12px] overflow-y-auto">
        {filteredData
          .filter((item) => item.trim() !== "") // Remove empty items
          .map((item, index) => (
            <div
              key={index}
              className={`flex gap-[12px] cursor-pointer rounded-md transition-colors ${
                selectedItems[activeTab].includes(item) ? " " : " text-black"
              }`}
              onClick={() => toggleSelection(item)}
            >
              <div
                className={`w-[24px] h-[24px] border-[1px] flex items-center justify-center font-medium text-[14px] leading-[100%] tracking-[0%] capitalize rounded-[6px] 
          ${
            selectedItems[activeTab].includes(item)
              ? "bg-blue-600 text-white border-blue-600"
              : "border-gray-400 bg-white"
          }`}
              >
                {selectedItems[activeTab].includes(item) && "✔"}
              </div>

              <div
                className={`capitalize w-[180px] ${
                  selectedItems[activeTab].includes(item)
                    ? "text-blue-600 font-semibold"
                    : ""
                }`}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </div>
            </div>
          ))}
      </div>
    );
  }, [filteredData, loading, searchTerm, selectedItems, activeTab]);

  return (
    <div className="w-[250px] lg:w-[296px] h-[265px] my-[8px] gap-[16px] rounded-[12px] pt-[20px] pr-[20px] pb-[12px] pl-[20px] shadow-md bg-white">
      {/* Tabs */}
      <div className="flex font-medium text-[14px] leading-[100%] tracking-[0px] capitalize text-[#000000] gap-[16px]">
        {options.map((option) => (
          <p
            key={option}
            className={`cursor-pointer py-[7px] ${
              activeTab === option
                ? "text-[#3A3A3A] font-bold border-b-[2px] border-[#3A3A3A]"
                : ""
            }`}
            onClick={() => {
              setActiveTab(option);
              setSearchTerm(""); // Clear search when changing tabs
            }}
          >
            {option}
          </p>
        ))}
      </div>

      {/* Search Box */}
      <div className="flex border-[1px] border-[#0000001A] bg-[#FCFCFE] w-full h-[40px] rounded-[12px] relative px-[13px] gap-[8px] items-center mt-[12px]">
        <img src="/assets/search.svg" alt="search" className="h-fit w-fit" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Search ${activeTab}`}
          className="font-medium text-[14px] placeholder:text-[14px] text-[#313131] placeholder:text-[#313131] leading-[30.96px] tracking-[0%] w-full border-none outline-none"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>

      {/* Data List */}
      {renderFilteredData}
    </div>
  );
});

Options.displayName = 'Options';

export default Options;
