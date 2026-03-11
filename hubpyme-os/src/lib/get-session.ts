import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { redirect } from "next/navigation";

/**
 * Gets the current server session.
 * Redirects to /login if the user is not authenticated.
 */
export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return session;
}

/**
 * Gets the organizationId from the session.
 * Redirects to /login if the user is not authenticated.
 */
export async function requireOrgId(): Promise<string> {
  const session = await requireSession();
  return session.user.organizationId;
}
