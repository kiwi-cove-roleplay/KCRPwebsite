import { ServerOff } from "lucide-react";
import { Card } from "@/components/ui/Card";

// Shown wherever a portal-api call throws or simply hasn't resolved a game
// link yet - typically because portal-api or the game server's MySQL
// database is unreachable/not deployed. Not used to distinguish "forbidden"
// from "unreachable" (lib/adminApi.ts doesn't either); either way there's
// nothing useful to show but "try again once it's back."
export function PortalApiUnavailable({
  title = "Can't reach the game server right now",
  message = "This data lives in the game server's database via portal-api. Once it's back online, reload this page.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <Card className="flex items-center gap-4 border-gold-600/40 text-sm text-muted">
      <ServerOff className="h-6 w-6 shrink-0 text-gold-400" />
      <div>
        <p className="font-medium text-bone">{title}</p>
        <p className="mt-1">{message}</p>
      </div>
    </Card>
  );
}
