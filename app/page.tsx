import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function Index() {
  return (
    <main className="flex-1 flex flex-col gap-6 px-4 justify-center items-center">
      <h1 className="font-medium text-xl mb-4 text-center">How do you want to study?</h1>
      <h2 className="font-small text-center">Unlock your learning potential with interactive flashcards, practice tests, and engaging study activities.</h2>
      <Link href="/sign-up">
        <Button variant="default" className="mt-6">
          Try it out! ->
        </Button>
      </Link>
    </main>
  );
}
