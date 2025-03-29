const GridResult = ({ hits, loading }) => {
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

  return (
    <div className="w-full">
      {/* Responsive grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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

          const { bgColor, textColor, text } = getStatusColor(statusInfo);

          return (
            <div
              key={hit._id || `hit-${index}`}
              className="p-4 border border-greyborder rounded-xl flex flex-col gap-3 h-full"
            >
              <div className="flex gap-3 justify-between items-center">
                <div className="w-24 h-20 flex items-center justify-center bg-white rounded-lg shadow-md">
                  <img
                    src="/assets/imageua.svg"
                    alt={markName}
                    className="max-w-full max-h-full"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    {/* Status Indicator Circle */}
                    <span className={`w-2 h-2 rounded-full ${bgColor}`}></span>

                    {/* Status Text */}
                    <p className={`font-bold text-sm ${textColor}`}>{text}</p>
                  </div>

                  <p className="text-xs text-gray-800">
                    on <span className="font-semibold">{registrationDate}</span>
                  </p>
                </div>
              </div>

              <div className="flex justify-between">
                <div className="flex flex-col flex-grow max-w-full">
                  <div className="flex flex-col gap-1 max-w-full">
                    <p
                      className="font-bold text-base truncate max-w-full"
                      title={markName}
                    >
                      {markName}
                    </p>
                    <p
                      className="text-sm font-normal truncate max-w-full"
                      title={owner}
                    >
                      {owner}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <p className="font-semibold text-sm">{serialNumber}</p>
                      <p className="font-medium text-xs capitalize">
                        {filingDate}
                      </p>
                    </div>
                    {renewalDate && (
                      <div className="flex items-center gap-1 shrink-0 ">
                        <img src="/assets/spinn.svg" alt="renewal" />
                        <span className="font-semibold text-xs">
                          {renewalDate}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 mt-auto">
                <div className="flex flex-wrap gap-2">
                  {displayClassNumbers.length > 0 ? (
                    <>
                      {displayClassNumbers.map((classCode, idx) => (
                        <div
                          key={`class-${idx}`}
                          className="flex gap-1 items-center"
                        >
                          <img src="/assets/code.svg" alt="class" />
                          <p className="font-bold text-xs text-gray-700">
                            Class {formatClassCode(classCode)}
                          </p>
                        </div>
                      ))}
                      {remainingClassCount > 0 && (
                        <div className="flex gap-1 items-center">
                          <p className="font-bold text-xs text-gray-700">
                            +{remainingClassCount} more
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex gap-1 items-center">
                      <p className="font-bold text-xs text-gray-700">
                        No class information
                      </p>
                    </div>
                  )}
                </div>

                <p className="font-medium text-sm text-gray-800 line-clamp-2 overflow-hidden">
                  {description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GridResult;
