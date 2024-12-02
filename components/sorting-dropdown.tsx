"use client"

import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu"
import Link from "next/link"

type FlashcardSet = {
  id: number
  title: string
  created_date: string
}

export default function SortingDropdown({ flashcardSets }: { flashcardSets: FlashcardSet[] }) {
  const [sortedSets, setSortedSets] = useState(flashcardSets)
  const [sortOption, setSortOption] = useState<"Newest First" | "Oldest First" | "Alphabetical">("Newest First")

  const handleSort = (option: "Newest First" | "Oldest First" | "Alphabetical") => {
    setSortOption(option)
    let sorted
    if (option === "Newest First") {
      sorted = [...flashcardSets].sort(
        (a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
      )
    } else if (option === "Oldest First") {
      sorted = [...flashcardSets].sort(
        (a, b) => new Date(a.created_date).getTime() - new Date(b.created_date).getTime()
      )
    } else if (option === "Alphabetical") {
      sorted = [...flashcardSets].sort((a, b) => a.title.localeCompare(b.title))
    }
    setSortedSets(sorted)
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-lg hover:bg-blue-700 transition-colors">
            Sort: {sortOption}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="bg-white border border-gray-200 rounded-lg shadow-md w-48 mt-2"
        >
          <DropdownMenuItem
            onClick={() => handleSort("Newest First")}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
          >
            Newest First
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleSort("Oldest First")}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
          >
            Oldest First
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleSort("Alphabetical")}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
          >
            Alphabetical
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex flex-col gap-2">
        {sortedSets.map((set) => (
          <div
            key={set.id}
            className="flex justify-between items-center bg-gray-50 p-3 rounded-md shadow-sm hover:bg-gray-100 transition-colors"
          >
            <Link href={`/flashcards/${set.id}/view-set`} className="text-blue-600 hover:underline">
              {set.title}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
