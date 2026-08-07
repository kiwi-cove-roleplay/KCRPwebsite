import { ServerOff } from "lucide-react";
import { Card } from "@/components/ui/Card";

// Shown by admin pages when a portal-api /admin/* call throws - typically
// because portal-api or the game server's MySQL database is unreachable,
// not because the signed-in actor lacks permission (portal-api would return
// a 403 for that, which still surfaces as a thrown error here since
// lib/adminApi.ts doesn't distinguish the two - either way there's nothing
// useful to show but "try again once it's back").
export function PortalApiUnavailable() {
  return (
    <Card className="flex items-center gap-4 border-gold-600/40 text-sm text-muted">
      <ServerOff className="h-6 w-6 shrink-0 text-gold-400" />
      <div>
        <p className="font-medium text-bone">Can&apos;t reach portal-api right now</p>
        <p className="mt-1">
          This data lives in the game server&apos;s database via portal-api. Once it&apos;s back online, reload this
          page.
        </p>
      </div>
    </Card>
  );
}
