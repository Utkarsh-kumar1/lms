"use client"
import React from 'react'
import { toast } from "@/components/ui/use-toast";

function page() {

   
  return (
    <div
    className=' bg-green-400  border-2 border-gray-400 font-serif'
    >
        <div  className=' font-mono'> hello2</div>
        hello
        <button onClick={()=>{
        toast({
          variant: "success",
          title: "Message : ",
          description:"test",
        });
    }}>click</button>
        
    </div>
  )
}

export default page