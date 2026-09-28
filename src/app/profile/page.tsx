import { redirect } from "next/navigation";

// This is a static export (ADR-0003) — there is no server to issue a real
// HTTP redirect, so this only takes effect after client-side hydration
// (same trade-off the root page used to make in the other direction; see
// ADR-0006). The former-homepage content that used to live at this route now
// lives at / — this route only exists so old bookmarks/links to /profile
// keep working instead of 404ing.
export default function ProfilePage() {
  redirect("/");
}
