// Shared with lib/auth.ts (which needs it for the admin bypass below) and
// lib/requireAdmin.ts - pulled out on its own so auth.ts doesn't have to
// import from requireAdmin.ts (which itself imports authOptions from
// lib/auth.ts) and create a circular import.
export const STAFF_ADMIN_PERMISSION = "sfos.staff.admin";
