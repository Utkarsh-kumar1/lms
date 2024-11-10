
export default function Quotes({quote}) {
    

  return (
    <div className="">
      <div className='font-semibold '>
      {quote.quote}

      </div>
      <div className='italic mt-2'>
        {quote.author}
      </div>
    </div>
  )
}
