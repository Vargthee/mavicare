import { supabase } from "@/integrations/supabase/client";

export type AppRole = "patient" | "doctor" | "hospital_admin" | "admin";

/**
 * Determines the user's role. Checks intended_role in metadata first (handles
 * hospital_admin workaround), then user_roles table, then falls back to metadata.role.
 */
export const getUserRole = async (user: any): Promise<AppRole> => {
  // Priority 1: intended_role in metadata (used for hospital_admin workaround)
  if (user?.user_metadata?.intended_role) {
    return user.user_metadata.intended_role as AppRole;
  }
  // Priority 2: user_roles table
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();
  if (data?.role === "admin") return "admin";
  if (data?.role === "doctor") return "doctor";
  if (data?.role === "patient") return "patient";

  // Priority 3: metadata.role
  return (user?.user_metadata?.role as AppRole) || "patient";
};

/**
 * Redirect path based on role.
 */
export const getRoleRedirect = (role: AppRole): string => {
  switch (role) {
    case "admin": return "/admin";
    case "hospital_admin": return "/hospital-dashboard";
    case "doctor": return "/doctor-dashboard";
    default: return "/patient-dashboard";
  }
};

/**
 * Ensures a profile row exists for the user (in case the DB trigger failed).
 */
export const ensureProfile = async (user: any): Promise<void> => {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!existing) {
    await supabase.from("profiles").insert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
    });
  }
};
