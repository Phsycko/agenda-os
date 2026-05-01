import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function DataTable({ columns, rows }: { columns: string[]; rows: Array<(string | number | React.ReactNode)[]> }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader><TableRow>{columns.map((col)=><TableHead key={col}>{col}</TableHead>)}</TableRow></TableHeader>
        <TableBody>{rows.map((row, idx)=><TableRow key={idx}>{row.map((cell, i)=><TableCell key={`${idx}-${i}`}>{cell}</TableCell>)}</TableRow>)}</TableBody>
      </Table>
    </div>
  );
}
