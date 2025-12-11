import { PoolsTable } from "@/components/dashboard/pools-table/pools-table";

export const Dashboard = () => {
  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold text-neutral-50">Pools</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Browse lending pools and click a row to view detailed pool
          information.
        </p>
      </header>

      <PoolsTable />
    </section>
  );
};
