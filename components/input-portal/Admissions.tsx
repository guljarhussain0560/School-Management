"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { UploadCloud, UserPlus2 } from "lucide-react";

export default function Admissions() {
  return (
    <div className="space-y-6">
      <OnboardingForm />
      <BatchUpload />
      <RecentAdmissions />
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-medium leading-none tracking-tight">{title}</h2>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}

function OnboardingForm() {
  const { toast } = useToast();
  return (
    <Card className="p-4">
      <SectionHeader title="Student Onboarding Form" description="Add new student to the system" />
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <div className="mb-2 text-sm font-medium">Student Information</div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <Label>Full Name</Label>
              <Input placeholder="Enter student's full name" />
            </div>
            <div>
              <Label>Age</Label>
              <Input type="number" min={3} placeholder="Age" />
            </div>
            <div>
              <Label>Grade</Label>
              <Input placeholder="Select grade" aria-label="Grade" />
            </div>
            <div className="lg:col-span-2">
              <Label>Address</Label>
              <Input placeholder="Home address" />
            </div>
          </div>
        </div>
        <div>
          <div className="mb-2 text-sm font-medium">Parent/Guardian Information</div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <Label>Parent/Guardian Name</Label>
              <Input placeholder="Enter parent/guardian name" />
            </div>
            <div>
              <Label>Contact Number</Label>
              <Input placeholder="Phone number" />
            </div>
            <div>
              <Label>Email Address</Label>
              <Input placeholder="Email address" />
            </div>
            <div className="lg:col-span-2">
              <Label>ID Proof Upload</Label>
              <div className="mt-1 rounded-md border border-dashed bg-muted/40 p-10 text-center text-sm text-muted-foreground">
                <UploadCloud className="mx-auto mb-2 h-5 w-5" />
                Upload ID Proof
                <div className="mt-1 text-[11px]">Accepted: .pdf, .jpg, .png</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button onClick={() => toast({ description: "Profile created and synced." })} className="gap-1"><UserPlus2 className="h-4 w-4" /> Create Student Profile</Button>
        <Button variant="outline">Save Draft</Button>
      </div>
    </Card>
  );
}

function BatchUpload() {
  const { toast } = useToast();
  return (
    <Card className="p-4">
      <SectionHeader title="Batch Upload" description="Import multiple student records from spreadsheet" />
      <div className="rounded-md border border-dashed bg-muted/40 p-12 text-center text-sm text-muted-foreground">
        <UploadCloud className="mx-auto mb-2 h-5 w-5" />
        Upload Student Data
        <div className="mt-1 text-[11px]">Accepted: .csv, .xlsx</div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Button variant="secondary">Download Template</Button>
          <Button onClick={() => toast({ description: "File validated. Ready to sync." })} className="gap-1"><Badge variant="secondary">Validate</Badge></Button>
          <Button onClick={() => toast({ description: "Batch synced to system." })} className="gap-1"><UploadCloud className="h-4 w-4" /> Sync</Button>
        </div>
      </div>
    </Card>
  );
}

function RecentAdmissions() {
  return (
    <Card className="p-4">
      <SectionHeader title="Recent Admissions" description="View and manage recently enrolled students" />
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-muted" /> New Student Applications</div>
        <div>3 applications</div>
      </div>
      <div className="space-y-2">
        {[{name:'Emma Wilson', meta:'Grade 8 • Enrolled: 2024-01-15', status:'Pending'},{name:'Jack Brown', meta:'Grade 8 • Enrolled: 2024-01-14', status:'Approved'},{name:'Sophia Davis', meta:'Grade 7 • Enrolled: 2024-01-13', status:'Under Review'}].map((s) => (
          <div key={s.name} className="flex items-center justify-between rounded-md border bg-white p-3 text-sm">
            <div>
              <div className="font-medium">{s.name}</div>
              <div className="text-xs text-muted-foreground">{s.meta}</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={s.status === 'Approved' ? 'secondary' : s.status === 'Pending' ? 'default' : 'secondary'}>{s.status}</Badge>
              <Button variant="outline" size="sm">Review</Button>
              <Button size="sm">Approve</Button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
        <div className="rounded-md border bg-white p-3"><div className="text-emerald-600 text-base font-semibold">12</div><div className="text-muted-foreground">Approved</div></div>
        <div className="rounded-md border bg-white p-3"><div className="text-amber-600 text-base font-semibold">5</div><div className="text-muted-foreground">Pending</div></div>
        <div className="rounded-md border bg-white p-3"><div className="text-blue-600 text-base font-semibold">3</div><div className="text-muted-foreground">Under Review</div></div>
      </div>
    </Card>
  );
}


