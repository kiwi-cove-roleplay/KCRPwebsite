import { StatusBoard } from "@/components/StatusBoard";
import { PageHeader } from "@/components/ui/PageHeader";

export default function StatusPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Who's on Duty">
        Updates automatically about once a minute while the server is online.
      </PageHeader>
      <StatusBoard />
    </div>
  );
}
