import { LoaderCircle } from 'lucide-react'
import React from 'react'

function loading() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-lg">
                <LoaderCircle className="animate-spin text-blue-600" size={36} />
            </div>
        </div>
    )
}

export default loading