import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { sessionDetail } from '../medical-agent/[sessionId]/page'
import { Button } from '@/components/ui/button'
import moment from 'moment';
import ViewReportDialog from './ViewReportDialog';

type Props = {
  HistoryList: sessionDetail[]
}

function HistoryTable({ HistoryList }: Props) {
  const [showAll, setShowAll] = useState(false);
  const visibleHistory = showAll ? HistoryList : HistoryList.slice(0, 5);

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-sm">
      <Table>
        <TableCaption className="py-4 text-xs uppercase tracking-[0.14em] text-muted-foreground">Previous consultation reports</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>AI Medical Specialist</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleHistory.map((record: sessionDetail, index: number) => (
            <TableRow key={record.sessionId || index}>
              <TableCell className="font-medium text-foreground">{record.selectedDoctor.specialist}</TableCell>
              <TableCell className="max-w-xs text-muted-foreground">{record.notes}</TableCell>
              <TableCell>{moment(new Date(record.createdOn)).fromNow()}</TableCell>
              <TableCell className="text-right">
                <ViewReportDialog record={record} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {HistoryList.length > 5 && (
        <div className="mt-4 flex justify-center pb-4">
          <Button variant="outline" onClick={() => setShowAll(!showAll)} className="rounded-full">
            {showAll ? 'Show Less' : `Show More (${HistoryList.length - 5} more)`}
          </Button>
        </div>
      )}
    </div>
  )
}

export default HistoryTable
