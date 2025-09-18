"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Banknote, UploadCloud, FileCheck2, ReceiptIndianRupee, WalletCards } from "lucide-react";

export default function FinancialData() {
  return (
    <div className="space-y-6">
      <FeeCollection />
      <PayrollManagement />
      <BudgetExpenses />
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <WalletCards className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-lg font-medium leading-none tracking-tight">{title}</h2>
      </div>
      {description ? <p className="text-sm text-muted-foreground mt-1">{description}</p> : null}
    </div>
  );
}

function FeeCollection() {
  const { toast } = useToast();
  return (
    <Card className="p-4">
      <SectionHeader title="Fee Collection Input" description="Record fee payments from students" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label>Student</Label>
          <Input placeholder="Search by ID/Class (e.g., 8-A-102)" aria-label="Student search" />
        </div>
        <div>
          <Label>Amount</Label>
          <Input type="number" min={0} placeholder="Enter amount" aria-label="Fee amount" />
        </div>
        <div>
          <Label>Payment mode</Label>
          <Select defaultValue="upi">
            <SelectTrigger><SelectValue placeholder="Mode" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
              <SelectItem value="bank">Bank Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end gap-2">
          <Button onClick={() => toast({ description: "Payment recorded. Chart updated." })} className="gap-1"><Banknote className="h-4 w-4" /> Record Payment</Button>
          <Button variant="outline" className="gap-1"><ReceiptIndianRupee className="h-4 w-4" /> Receipt</Button>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <div className="rounded-md border bg-white p-3 text-sm">
          <div className="flex items-center justify-between"><span>Alice Johnson</span><Badge variant="secondary">Paid</Badge></div>
          <div className="text-xs text-muted-foreground">ST001 • Class 8</div>
        </div>
        <div className="rounded-md border bg-white p-3 text-sm">
          <div className="flex items-center justify-between"><span>Bob Smith</span><Badge>Pending</Badge></div>
          <div className="text-xs text-muted-foreground">ST002 • Class 7</div>
        </div>
        <div className="rounded-md border bg-white p-3 text-sm">
          <div className="flex items-center justify-between"><span>Carol Davis</span><Badge variant="destructive">Overdue</Badge></div>
          <div className="text-xs text-muted-foreground">ST003 • Class 9</div>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Note: Payment instantly updates Fee Collection widget.</p>
    </Card>
  );
}

function PayrollManagement() {
  const { toast } = useToast();
  return (
    <Card className="p-4">
      <SectionHeader title="Payroll Management" description="Upload and manage staff payroll data" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
        <Button onClick={() => toast({ description: "Payroll uploaded. Linked to dashboard." })} className="gap-1"><UploadCloud className="h-4 w-4" /> Upload</Button>
        <Button variant="secondary" className="gap-1"><FileCheck2 className="h-4 w-4" /> Download Template</Button>
      </div>
      <div className="mt-3 rounded-md border border-dashed bg-muted/40 p-6 text-center text-sm text-muted-foreground">
        Inline editing table placeholder (by department). Click a cell to edit.
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {['Administration','Teaching Staff','Support Staff','Maintenance'].map((dept) => (
          <div key={dept} className="rounded-md border bg-white p-3 text-sm">
            <div className="flex items-center justify-between"><span>{dept}</span><span className="text-xs font-medium text-emerald-600">₹2,45,000</span></div>
            <div className="text-xs text-muted-foreground">Synced</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function BudgetExpenses() {
  const { toast } = useToast();
  return (
    <Card className="p-4">
      <SectionHeader title="Budget Allocation & Expenses" description="Track department expenses and budget utilization" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label>Department</Label>
          <Select defaultValue="acad">
            <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="acad">Academics</SelectItem>
              <SelectItem value="ops">Operations</SelectItem>
              <SelectItem value="trans">Transport</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Amount</Label>
          <Input type="number" min={0} placeholder="Enter amount" />
        </div>
        <div>
          <Label>Status</Label>
          <Select defaultValue="approved">
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Input type="file" accept="image/*,application/pdf" aria-label="Upload receipt" />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={() => toast({ description: "Expense saved. Utilization gauge updated." })}>Add Expense</Button>
        <Button variant="outline">Save Draft</Button>
      </div>
      <div className="mt-3">
        <Button variant="secondary" className="w-full">Sync Budget Data</Button>
      </div>
    </Card>
  );
}



