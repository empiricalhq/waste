import { DataTable } from '@/components/issues/data-table';
import { columns, type Issue } from '@/components/issues/columns';
import { createIssue } from '@/features/issues/actions';

async function getIssues() {
  const issues = await createIssue();
  return issues;
}

export default async function IssuesPage() {
    const data = await getIssues();

    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Gestión de Incidencias</h1>
        <DataTable columns={columns} data={data} />
      </div>
    );
}