import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Index() {
  const supabase = createClient();

  const {
    data: { user },
  } = await (await supabase).auth.getUser();

  const redirectTo = user ? "/homepage" : "/sign-up";

  return (
    <main className="flex-1 flex flex-col gap-6 px-4 justify-center items-center">
      <h1 className="font-medium text-xl mb-4 text-center">How do you want to study?</h1>
      <h2 className="font-small text-center">
        Unlock your learning potential with interactive flashcards, practice tests, and engaging study activities.
      </h2>
      <Link href={redirectTo}>
        <Button variant="default" className="mt-6">
          Try it out! ->
        </Button>
      </Link>
    </main>
  );
}
