import { redirect } from "next/navigation";

// This is a static export (ADR-0003) — there is no server to issue a real
// HTTP redirect, so this only takes effect after client-side hydration.
// That's an intentional trade-off here (unlike /lab, which became a real
// landing page for exactly this reason): the root layout's metadata
// (title/description/OpenGraph/canonical) is still emitted into <head>
// regardless of this redirect, so link previews and crawlers that read
// <head> without running JS still see developer.cleanbrain.me's real
// identity — only the interactive body is skipped for a real browser,
// which lands on the RelayHub Live Lab instead. The full profile/portfolio
// narrative that used to live here still exists at /profile.
export default function Home() {
  redirect("/lab/relayhub");
}
