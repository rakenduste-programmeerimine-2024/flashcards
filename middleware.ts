import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function middleware(request: Request) {

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.next();
  }

  return NextResponse.next(); 
}

export const config = {
  matcher: ['/my-profile'],  
};
