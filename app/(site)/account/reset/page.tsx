import type { Metadata } from "next";
import Link from "next/link";

import { ComingSoon } from "@/components/coming-soon";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false },
};

/** Where the link in a "reset your password" email lands. */
export default async function ResetPasswordPage() {
  if (!isSupabaseConfigured) return <ComingSoon page="account" />;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <section className="flex min-h-[calc(100svh-5rem)] flex-col items-center justify-center bg-background px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="text-center text-5xl leading-[0.95] tracking-[-0.045em] text-ink sm:text-6xl">
        Choose a new password
      </h1>
      {user ? (
        <>
          <p className="mb-10 mt-4 max-w-sm text-center font-sans text-sm leading-relaxed text-ink-muted">
            Pick something you haven&rsquo;t used before.
          </p>
          <ResetPasswordForm />
        </>
      ) : (
        <p className="mt-6 max-w-sm text-center font-sans text-sm leading-relaxed text-ink-muted">
          This link has expired or has already been used.{" "}
          <Link
            href="/account"
            className="text-ink underline underline-offset-4 transition-colors hover:text-primary"
          >
            Ask for a new one
          </Link>{" "}
          from the log in page.
        </p>
      )}
    </section>
  );
}
