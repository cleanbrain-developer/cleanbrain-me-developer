import { redirect } from "next/navigation";

// This is a static export (ADR-0003) — there is no server to issue a real
// HTTP redirect, so this only takes effect after client-side hydration. This
// route used to be a real, thin landing page (RelayHub was the only Live
// destination, so it just linked onward) — the header now links straight to
// /lab/relayhub instead of routing through here (ADR-0006, "direct
// navigation"), so this only exists so old bookmarks/links to /lab keep
// working instead of 404ing. If a second Live system is ever added, this
// becomes a real overview page again rather than a redirect.
export default function LabIndexPage() {
  redirect("/lab/relayhub");
}
