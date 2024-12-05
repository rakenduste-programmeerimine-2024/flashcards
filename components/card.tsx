import Link from "next/link";
import { FaLock } from "react-icons/fa";

type CardProps = {
  title: string;
  id: string;
  termCount: number;
  link: string;
  isPublic: boolean;
};

export default function Card({ title, id, termCount, link, isPublic }: CardProps) {
  return (
    <div className="flex flex-col justify-between p-6 border border-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white h-[150px] w-[270px]">

      <div className="flex items-center mb-2">
        <Link href={link} className="text-pink-600 hover:text-pink-700 font-semibold text-lg md:text-xl">
          {title}
        </Link>
        {!isPublic && (
          <FaLock className="ml-2 text-lg text-pink-600" />
        )}
      </div>


      <p className="text-sm text-gray-600 mt-4">{termCount} terms</p>
    </div>
  );
}
