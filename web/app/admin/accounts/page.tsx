import { PageHeader } from "@/components/ui/PageHeader";
import { AccountSearch } from "@/components/admin/AccountSearch";

export default function AdminAccountsPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Accounts">Search for a player account to manage bans, notes, and permissions.</PageHeader>
      <AccountSearch />
    </div>
  );
}
