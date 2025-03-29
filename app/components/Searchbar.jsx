import Image from "next/image";
import { useState, useEffect, useRef, memo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const Searchbar = memo(() => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inputQuery, setInputQuery] = useState("");
  const initialLoadRef = useRef(true);
  const searchParamsRef = useRef(searchParams.toString());

  // Only update the input query on initial load and when query param specifically changes
  useEffect(() => {
    const query = searchParams.get("query") || "nike";
    const newSearchParamsString = searchParams.toString();
    
    // Only update if it's the initial load or if the query param specifically changed
    // and if the overall search params have changed
    if ((initialLoadRef.current || inputQuery !== query) && 
        searchParamsRef.current !== newSearchParamsString) {
      setInputQuery(query);
      initialLoadRef.current = false;
      searchParamsRef.current = newSearchParamsString;
    }
  }, [searchParams]); // Keep searchParams dependency for initial load

  const handleSearch = () => {
    if (!inputQuery.trim()) return;

    // Update the URL only if the query has changed
    const currentQuery = searchParams.get("query") || "";
    if (currentQuery !== inputQuery.trim()) {
      const params = new URLSearchParams(searchParams);
      params.set("query", inputQuery.trim());
      router.push(`/?${params.toString()}`, { scroll: false });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-[20px] md:gap-[50px] py-[30px] items-center bg-lightblue border-b-[6px] border-secondryblue px-[10px] sm:px-[30px] lg:pl-[79.5px]">
      <Image
        src="/assets/Logo.svg"
        alt="Trademarkia logo"
        width={155}
        height={22}
      />
      <div className="flex flex-col">
        <div className="flex gap-[12px]">
          <div className="flex border-[1px] border-primarygrey w-full lg:w-[454.79px] h-[50px] rounded-[12px] relative px-[15.7px] gap-[8px] items-center">
            <img
              src="/assets/search.svg"
              alt="search"
              className="h-fit w-fit"
            />
            <input
              type="text"
              placeholder="Search Trademark Here eg. Mickey Mouse"
              className="font-medium text-[14px] text-secondrygrey placeholder:text-secondrygrey leading-[30.96px] tracking-[0%] w-full border-none outline-none"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <button
            className="w-[124px] h-[50px] cursor-pointer font-bold text-[16px] leading-[30.96px] text-center rounded-[12px] bg-primaryblue text-white"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
});

Searchbar.displayName = 'Searchbar';

export default Searchbar;
