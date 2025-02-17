'use client'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { ActivityItem } from './ActivityItem'

export default function BuildingBlocks() {


  const [buildingBlocks, setBuildingBlocks] = useState([])


  useEffect(() => {
    // Fetch building blocks

    const fetchBuildingBlocks = async () => {
      try {
        const data = await axios.get('/api/buildingBlocks')
        // const data = await response.json()
        setBuildingBlocks(data.data.data)
        console.log("Data" , data.data.data)
      } catch (error) {
        console.error(error)
      }
    }
    fetchBuildingBlocks()
  }, [])

  return (
    <div>
      <div>Building Blocks</div>
      <div className='overflow-auto max-h-[600px] border border-gray-200 dark:border-gray-700 rounded-lg p-1 sm:p-4 bg-gray-50 dark:bg-gray-800'>
        {buildingBlocks?.map((block) => (
          <ActivityItem key={block.id} className="mr-2" activity={block} />
        ))}
      </div>
    </div>
  )
}
