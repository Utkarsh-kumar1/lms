
export default function Quotes({quote}) {
    

  return (
    <div className="">
      <div className=" text-center" style={{fontFamily: '"Delius", serif' ,  fontWeight: 400, fontStyle: 'normal'}}>
      {quote?.quote ?? "No Quotes Available"}

      </div>
      <div className='font-semibold italic mt-2 underline decoration-red-500 underline-offset-3'>
        {quote?.author}
      </div>
    </div>
  )
}
