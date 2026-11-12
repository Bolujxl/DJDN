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
    <section className="bg-surface px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pb-24 lg:pt-24">
      <div className="lg:ml-[calc(25%+1rem)]">
        <h1 className="text-4xl leading-[0.95] tracking-[-0.04em] text-ink sm:text-5xl">
          Choose a new password
        </h1>
        {user ? (
          <ResetPasswordForm />
        ) : (
          <p className="mt-8 max-w-md font-sans text-sm leading-relaxed text-ink-muted">
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
      </div>
    </section>
  );
}
