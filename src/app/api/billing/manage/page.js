// This file was mistakenly created as a page under the /api subtree.
// It should not render a client component here. Redirect to the proper page.
import { redirect } from "next/navigation";

export default function Page() {
  redirect("/billing/manage");
}
