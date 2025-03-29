import { useSearchParams } from "next/navigation";

const Counts = ({total}) => {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "nike";

  return (
    <div className="font-bold text-[16px] leading-[30px] tracking-[0%] px-[6px] text-darkgrey py-[14px] border-b-[2px] border-teriterygrey">
      About {total} Trademarks found for "{query}"
    </div>
  );
};

export default Counts;
