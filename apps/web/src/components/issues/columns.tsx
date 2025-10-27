"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"

export type Issue = {
  id: string
  title: string
  status: "open" | "in_progress" | "closed"
  priority: "low" | "medium" | "high"
}

export const columns: ColumnDef<Issue>[] = [
  {
    accessorKey: "title",
    header: "Incidencia",
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const variant = {
        open: "secondary",
        in_progress: "default",
        closed: "outline",
      }[status] ?? "default"

      return <Badge variant={variant as any}>{status}</Badge>
    }
  },
  {
    accessorKey: "priority",
    header: "Prioridad",
    cell: ({ row }) => {
        const priority = row.getValue("priority") as string
        const variant = {
          high: "destructive",
          medium: "warning",
          low: "secondary",
        }[priority] ?? "default"
  
        return <Badge variant={variant as any}>{priority}</Badge>
      }
  },
]