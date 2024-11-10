
export default function Quotes({quote}) {
    

  return (
    <div className="">
      <div className='font-semibold text-center'>
      {quote?.quote ?? "No Quotes Available"}

      </div>
      <div className='italic mt-2 underline decoration-red-500 underline-offset-3'>
        {quote?.author}
      </div>
    </div>
  )
}
