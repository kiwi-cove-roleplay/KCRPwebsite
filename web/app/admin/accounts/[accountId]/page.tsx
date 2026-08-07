import { notFound } from "next/navigation";
import { requireAdminActor } from "@/lib/requireAdmin";
import {
  listAccountPermissions,
  listPermissionCatalog,
  listPlayerNotes,
  searchAccounts,
  type AccountPermissionRow,
  type AccountSearchResult,
  type PermissionCatalogRow,
  type PlayerNoteRow,
} from "@/lib/adminApi";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BanControls } from "@/components/admin/BanControls";
import { PlayerNotes } from "@/components/admin/PlayerNotes";
import { PermissionsEditor } from "@/components/admin/PermissionsEditor";
import { PortalApiUnavailable } from "@/components/admin/PortalApiUnavailable";

export default async function AdminAccountDetailPage({ params }: { params: { accountId: string } }) {
  const actorAccountId = await requireAdminActor();
  if (actorAccountId === null) {
    return null;
  }

  const accountId = Number(params.accountId);
  if (!Number.isInteger(accountId)) {
    notFound();
  }

  let data: {
    matches: AccountSearchResult[];
    notes: PlayerNoteRow[];
    catalog: PermissionCatalogRow[];
    granted: AccountPermissionRow[];
  } | null = null;
  try {
    const [matches, notes, catalog, granted] = await Promise.all([
      searchAccounts(actorAccountId, String(accountId)),
      listPlayerNotes(actorAccountId, accountId),
      listPermissionCatalog(actorAccountId),
      listAccountPermissions(actorAccountId, accountId),
    ]);
    data = { matches, notes, catalog, granted };
  } catch (error) {
    console.error("Failed to load account detail", error);
  }

  if (!data) {
    return <PortalApiUnavailable />;
  }

  const { notes, catalog, granted } = data;
  const account = data.matches.find((row) => row.account_id === accountId);
  if (!account) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl text-bone">{account.fivem_username}</h1>
        <span className="text-muted">#{account.account_id}</span>
        {account.is_banned && <Badge tone="danger">Banned</Badge>}
      </header>

      <Card>
        <h2 className="text-lg text-bone">Ban</h2>
        <BanControls accountId={account.account_id} isBanned={account.is_banned} />
      </Card>

      <Card>
        <h2 className="text-lg text-bone">Player Notes</h2>
        <PlayerNotes accountId={account.account_id} notes={notes} />
      </Card>

      <Card>
        <h2 className="text-lg text-bone">Permissions</h2>
        <PermissionsEditor accountId={account.account_id} catalog={catalog} granted={granted} />
      </Card>
    </div>
  );
}
