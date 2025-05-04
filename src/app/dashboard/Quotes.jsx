
export default function Quotes({quote}) {
    

  return (
    <div className="">
      <div
        className="text-center text-lg md:text-xl text-gray-800 dark:text-gray-100"
        style={{ fontFamily: '"Delius", serif', fontWeight: 400 }}
      >
        “ {quote?.quote ?? "No Quotes Available"} ”
      </div>
      <div className="text-right font-semibold italic mt-3 text-red-600 dark:text-red-400 underline underline-offset-4 decoration-red-400">
        — {quote?.author ?? "Unknown"}
      </div>
    </div>
  );
}
