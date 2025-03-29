import React, { useState } from "react";

const SearchResults = ({ hits, loading }) => {
  const [hoveredDescription, setHoveredDescription] = useState(null);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-10">
        <p>Loading...</p>
      </div>
    );
  }

  if (!hits || hits.length === 0) {
    return (
      <div className="w-full flex justify-center items-center py-10">
        <p>No results found. Try adjusting your search criteria.</p>
      </div>
    );
  }

  // Helper function to format class codes (remove leading zeros)
  const formatClassCode = (code) => {
    // Convert to string if it's not already, then parse as integer to remove leading zeros
    return parseInt(String(code), 10).toString();
  };

  return (
    <div className="w-full hidden lg:block relative">
      <div className="font-semibold text-[16px] leading-[20px] tracking-[0px] text-[#313131] flex items-center justify-between gap-[20px] py-[10px] border-b-[1px] border-[#E7E6E6]">
        <div className="flex items-center gap-[20px] xl:gap-[45px]">
          <p className="w-[100px] xl:w-[158px] pl-[20px]">Mark</p>
          <p className="w-[150px] xl:w-[190px]">Details</p>
        </div>
        <div className="flex items-center gap-[20px] xl:gap-[45px]">
          <p className="w-[141px] pl-[20px]">Status</p>
          <p className="w-[180px] xl:w-[296.43px]">Class/Description</p>
        </div>
      </div>

      {hits.map((hit, index) => {
        // Safely extract data from the hit object with defaults
        const source = hit._source || {};
        const markName = source.mark_identification || "Unknown Mark";
        const owner = source.current_owner || "Unknown Owner";
        const serialNumber = hit._id || "-";
        const filingDate = source.registration_date
          ? new Date(source.filing_date).toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "-";
        const statusInfo = source.status_type || "Unknown";
        const registrationDate = source.registration_date
          ? new Date(source.registration_date).toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "-";
        const renewalDate = source.renewal_date
          ? new Date(source.renewal_date).toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "";
        const description =
          source.mark_description_description || "No description available";
        const classNumbers = source.class_codes || [];

        // Get only the first three class codes
        const displayClassNumbers = classNumbers.slice(0, 3);
        const remainingClassCount =
          classNumbers.length - displayClassNumbers.length;

        // Determine status styling
        const getStatusColor = (status) => {
          if (!status)
            return {
              bgColor: "bg-gray-500",
              textColor: "text-white",
              text: "Unknown",
            };

          status = status.toLowerCase();

          if (status.includes("live") || status.includes("registered"))
            return {
              bgColor: "bg-[#128807]",
              textColor: "text-[#41B65C]",
              text: "Live/Registered",
            };

          if (status.includes("pending"))
            return {
              bgColor: "bg-yellow",
              textColor: "text-yellow",
              text: "Live/Pending",
            };

          if (status.includes("dead") || status.includes("abandoned"))
            return {
              bgColor: "bg-redpri",
              textColor: "text-redpri",
              text: "Dead/Cancelled",
            };

          return {
            bgColor: "bg-primaryblue",
            textColor: "text-primaryblue",
            text: "Indifferent",
          };
        };

        const { bgColor, textColor, text } = getStatusColor(statusInfo);

        return (
          <div
            key={hit._id || `hit-${index}`}
            className="flex justify-between gap-[20px] items-center py-[15px] hover:bg-[#0000000b] rounded-2xl px-[2px]"
          >
            <div className="flex gap-[20px] xl:gap-[45px]">
              <div className="w-[100px] xl:w-[158px] h-[120px] flex items-center justify-center bg-white rounded-[10px] shadow-[0px_4px_4px_0px_rgba(231,231,231,0.25),0px_3.94px_10px_0px_rgba(232,232,232,0.25),0px_4.34px_68px_0px_rgba(198,198,198,0.25)]">
                <img src="/assets/Imageua.svg" alt={markName} />
              </div>
              <div className="flex flex-col gap-[27px] w-[150px] xl:w-[190px]">
                <div className="flex flex-col gap-[6px]">
                  <p className="font-bold text-[16px] leading-[100%] tracking-[0px]">
                    {markName}
                  </p>
                  <p className="text-[14px] font-normal">{owner}</p>
                </div>
                <div className="flex flex-col gap-[8px]">
                  <p className="font-semibold text-[14px] leading-[100%] tracking-[0px]">
                    {serialNumber}
                  </p>
                  <p className="font-medium text-[12px] leading-[100%] tracking-[0px] capitalize">
                    {filingDate}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-[20px] xl:gap-[45px] items-center">
              <div className="flex flex-col gap-[47px] xl:w-[141px]">
                <div className="flex flex-col gap-[5px]">
                  <div className="flex items-center gap-[5px]">
                    {/* Status Indicator Circle */}
                    <span
                      className={`w-[8px] h-[8px] rounded-full ${bgColor}`}
                    ></span>

                    {/* Status Text */}
                    <p
                      className={`font-bold text-[16px] leading-[24px] tracking-normal ${textColor}`}
                    >
                      {text}
                    </p>
                  </div>

                  <p className="font-regular text-[12px] leading-[100%] tracking-[0px] text-[#1A1A1A]">
                    on <span className="font-semibold">{registrationDate}</span>
                  </p>
                </div>
                {renewalDate && (
                  <div className="flex items-center gap-[5px]">
                    <img src="/assets/spinn.svg" alt="renewal" />
                    <span className="font-semibold text-[12px] leading-[100%] tracking-[0px] text-[#1A1A1A]">
                      {renewalDate}
                    </span>
                  </div>
                )}
              </div>
              <div className="w-[180px] xl:w-[296.43px] flex flex-col gap-[20px]">
                <div className="relative">
                  <p
                    className="font-medium text-[14px] leading-[21px] tracking-[0px] text-[#1D1C1D] line-clamp-2 overflow-hidden cursor-pointer"
                    onMouseEnter={() => setHoveredDescription(index)}
                    onMouseLeave={() => setHoveredDescription(null)}
                  >
                    {description}
                  </p>

                  {/* Description Tooltip/Card */}
                  {hoveredDescription === index && (
                    <div className="absolute z-10 left-0 mt-2 w-[300px] max-w-md bg-white rounded-md shadow-lg p-4 border border-gray-200">
                      <p className="font-medium text-[14px] leading-[21px] tracking-[0px] text-[#1D1C1D]">
                        {description}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {displayClassNumbers.length > 0 ? (
                    <>
                      {displayClassNumbers.map((classCode, idx) => (
                        <div
                          key={`class-${idx}`}
                          className="flex gap-[5px] items-center"
                        >
                          <img src="/assets/code.svg" alt="class" />
                          <p className="font-bold text-[12px] leading-[100%] tracking-[0px] align-bottom text-[#3A3A3A]">
                            Class {formatClassCode(classCode)}
                          </p>
                        </div>
                      ))}
                      {remainingClassCount > 0 && (
                        <div className="ml-[9px] font-bold text-[12px] px-[5.5px] py-[1px] leading-[100%] tracking-[0px] align-bottom text-black w-[20px] h-[20px] bg-[#EAEAEA] rounded-full flex items-center justify-center">
                          ...
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex gap-[5px] items-center">
                      <p className="font-bold text-[12px] leading-[100%] tracking-[0px] align-bottom text-[#3A3A3A]">
                        No class information
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SearchResults;
