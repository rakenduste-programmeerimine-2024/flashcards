import Link from "next/link";

type CardProps = {
  title: string;
  id: string;
  termCount: number;
  link: string;
};

export default function Card({ title, id, termCount, link }: CardProps) {
  return (
    <div className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 p-4">
      <div className="flex flex-col h-full p-4 border border-gray-300 rounded-lg shadow-md">
        {/* Title Link */}
        <Link href={link} className="text-pink-500 hover:underline font-semibold text-xl">
          {title}
        </Link>

        {/* Term Count */}
        <p className="text-sm text-gray-600 mt-2">{termCount} terms</p>
      </div>
    </div>
  );
}
