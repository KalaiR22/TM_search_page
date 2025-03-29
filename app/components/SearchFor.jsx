"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const SearchFor = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const currentQuery = searchParams.get("query") || "nike";
    setQuery(currentQuery);

    // Generate the two suggestions
    const possibleSuggestions = [`${currentQuery}*`, `*${currentQuery}`];

    // Filter out already selected suggestions
    if (currentQuery.includes("*")) {
      setSuggestions(possibleSuggestions.filter((s) => s !== currentQuery));
    } else {
      setSuggestions(possibleSuggestions);
    }
  }, [searchParams]);

  const handleSelectSuggestion = (selectedQuery) => {
    // Set the selected query and remove it from the suggestions
    setQuery(selectedQuery);
    setSuggestions(suggestions.filter((s) => s !== selectedQuery));

    // Update the URL with the new query
    const params = new URLSearchParams(searchParams);
    params.set("query", selectedQuery);
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-[20px] py-[25px]">
      <p className="font-bold text-[16px] leading-[30px] tracking-[0%] px-[6px] text-darkgrey">
        Also try searching for{" "}
      </p>
      <div className="flex gap-[10px]">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => handleSelectSuggestion(suggestion)}
            className="border font-bold text-[12px] leading-[20px] tracking-[0%] text-center border-primaryorange text-primaryorange bg-secOrange rounded-[10px] px-[12px] w-fit h-[35px] flex items-center cursor-pointer"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchFor;
