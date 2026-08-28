import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  let cookieStore: any = null;
  let useInMemory = false;
  try {
    cookieStore = await cookies();
  } catch (error) {
    useInMemory = true;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const memoryCookies = new Map<string, string>();

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          if (useInMemory || !cookieStore) {
            return memoryCookies.get(name);
          }
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          if (useInMemory || !cookieStore) {
            memoryCookies.set(name, value);
            return;
          }
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Called from Server Component
          }
        },
        remove(name: string, options: CookieOptions) {
          if (useInMemory || !cookieStore) {
            memoryCookies.delete(name);
            return;
          }
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Called from Server Component
          }
        },
      },
    }
  );
}
