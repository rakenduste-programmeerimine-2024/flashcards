"use client"

import { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu"
import Link from "next/link"
import { useTheme } from "next-themes"

type FlashcardSet = {
  id: number
  title: string
  created_date: string
  termCount: number
  is_public: boolean
}

type SortingDropdownProps = {
  flashcardSets: FlashcardSet[]
  pageTitle: string 
}

export default function SortingDropdown({ flashcardSets, pageTitle }: SortingDropdownProps) {
  const [sortedSets, setSortedSets] = useState<FlashcardSet[]>([])
  const [sortOption, setSortOption] = useState<"Newest First" | "Oldest First" | "Alphabetical">("Newest First")
  const { theme } = useTheme() 

  useEffect(() => {
    if (flashcardSets && flashcardSets.length > 0) {
      const sorted = [...flashcardSets].sort(
        (a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
      )
      setSortedSets(sorted)
    }
  }, [flashcardSets])

  const handleSort = (option: "Newest First" | "Oldest First" | "Alphabetical") => {
    setSortOption(option)
    let sorted: FlashcardSet[] = []
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{pageTitle}</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="px-2 py-1 bg-[#A59CFF] text-white rounded-md shadow-lg hover:bg-[#BDB2FF] transition-colors text-sm">
              Sort: {sortOption}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className={`${
              theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"
            } border border-gray-200 rounded-lg shadow-md w-40 mt-2`}
          >
            <DropdownMenuItem
              onClick={() => handleSort("Newest First")}
              className={`px-4 py-1 hover:${theme === "dark" ? "bg-gray-700" : "bg-gray-100"} cursor-pointer text-sm`}
            >
              Newest First
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSort("Oldest First")}
              className={`px-4 py-1 hover:${theme === "dark" ? "bg-gray-700" : "bg-gray-100"} cursor-pointer text-sm`}
            >
              Oldest First
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSort("Alphabetical")}
              className={`px-4 py-1 hover:${theme === "dark" ? "bg-gray-700" : "bg-gray-100"} cursor-pointer text-sm`}
            >
              Alphabetical
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {sortedSets.length === 0 ? (
        <p>No flashcard sets available. Create one to get started.</p>
      ) : (
        <div className="flex flex-wrap gap-4 mt-4">
          {sortedSets.map((set) => (
            <Link key={set.id} href={`/flashcards/${set.id}/view-set`} passHref>
              <div
                className={`flex flex-col justify-between p-6 border rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-600 hover:bg-gray-700"
                    : "bg-white border-gray-300 hover:bg-gray-100"
                } h-[150px] w-[270px] cursor-pointer`}
              >
                <div className="flex items-center mb-2">
                  <span className="text-pink-600 hover:text-pink-700 font-semibold text-lg md:text-xl">
                    {set.title}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mt-4">{set.termCount} terms</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
