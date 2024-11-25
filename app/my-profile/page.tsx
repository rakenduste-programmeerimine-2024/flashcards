import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ProfileEdit from "@/components/profile-edit";

export default async function ProfilePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await (await supabase).auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const username = user.user_metadata?.email || user.email;

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <h2 className="font-bold text-2xl mb-4">My profile</h2>
        <ProfileEdit email={username} />
      </div>
    </div>
  );
}
