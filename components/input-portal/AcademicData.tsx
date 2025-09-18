"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { UploadCloud, CalendarDays, Save } from "lucide-react";

export default function AcademicData() {
  return (
    <div className="space-y-6">
      <StudentPerformanceUpload />
      <AttendanceEntry />
      <AssignmentUpdates />
      <CurriculumProgress />
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

function StudentPerformanceUpload() {
  const { toast } = useToast();
  const [fileName, setFileName] = useState<string>("");
  const students = ["Alice Johnson", "Bob Smith", "Carol Davis", "David Wilson", "Eva Brown"];

  return (
    <Card className="p-4">
      <SectionHeader title="Student Performance Upload" description="Upload grades and assessments for students" />
      <div className="rounded-md border border-dashed bg-muted/40 p-10 text-center text-sm text-muted-foreground">
        <UploadCloud className="mx-auto mb-2 h-5 w-5" />
        Bulk Upload Grades
        <div className="mt-1 text-[11px]">Accepted: .csv, .xlsx</div>
      </div>
      <div className="mt-5 text-sm font-medium">Individual Entry</div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label>Class</Label>
          <Select defaultValue="8">
            <SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="8">Class 8</SelectItem>
              <SelectItem value="9">Class 9</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Subject</Label>
          <Select defaultValue="math">
            <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="math">Mathematics</SelectItem>
              <SelectItem value="sci">Science</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Marks</Label>
          <Input type="number" min={0} max={100} placeholder="0-100" />
        </div>
        <div>
          <Label>Comment</Label>
          <Input placeholder="Optional feedback" />
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {students.map((s) => (
          <div key={s} className="flex items-center justify-between rounded-md border bg-white p-2 pl-3 text-sm">
            <div className="flex items-center gap-2">
              <span>{s}</span>
              <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pending</Badge>
            </div>
            <Button size="sm" variant="outline">Save</Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AttendanceEntry() {
  const { toast } = useToast();
  const [present, setPresent] = useState<Record<string, boolean>>({
    "Alice Johnson": true,
    "Bob Smith": true,
    "Carol Davis": false,
    "David Wilson": true,
    "Eva Brown": true,
  });
  const names = Object.keys(present);
  const presentCount = names.filter((n) => present[n]).length;
  const markAll = () => setPresent(names.reduce((acc, n) => ({ ...acc, [n]: true }), {} as Record<string, boolean>));

  return (
    <Card className="p-4">
      <SectionHeader title="Attendance Entry" description="Mark student attendance for the selected date" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label>Date</Label>
          <Input type="date" />
        </div>
        <div>
          <Label>Class</Label>
          <Select defaultValue="8">
            <SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="8">Class 8</SelectItem>
              <SelectItem value="9">Class 9</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end gap-2">
          <Button variant="secondary" onClick={markAll}>Mark All Present</Button>
          <Button variant="outline">Import biometric</Button>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {names.map((n) => (
          <div key={n} className="flex items-center justify-between rounded-md border bg-white p-2 pl-3 text-sm">
            <span>{n}</span>
            <div className="flex items-center gap-2">
              <Label htmlFor={`present-${n}`} className="text-xs">Present</Label>
              <Switch id={`present-${n}`} checked={present[n]} onCheckedChange={(v) => setPresent({ ...present, [n]: Boolean(v) })} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-muted-foreground">Present {presentCount}/{names.length}</div>
      <div className="mt-3"><Button onClick={() => toast({ description: "Attendance saved." })}>Save Attendance</Button></div>
    </Card>
  );
}

function AssignmentUpdates() {
  return (
    <Card className="p-4">
      <SectionHeader title="Assignment Updates" description="Update assignment status and upload graded files." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label>Class</Label>
          <Select defaultValue="8">
            <SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="8">Class 8</SelectItem>
              <SelectItem value="9">Class 9</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Subject</Label>
          <Select defaultValue="math">
            <SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="math">Mathematics</SelectItem>
              <SelectItem value="sci">Science</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Assignment</Label>
          <Select defaultValue="a1">
            <SelectTrigger><SelectValue placeholder="Assignment" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="a1">Assignment 1</SelectItem>
              <SelectItem value="a2">Assignment 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3 pt-6">
          <Switch id="status" />
          <Label htmlFor="status">Completed</Label>
        </div>
      </div>
      <div className="mt-3">
        <Label>Graded files</Label>
        <div className="mt-1 rounded-md border border-dashed bg-muted/40 p-8 text-center text-sm text-muted-foreground">Drag & drop files here or click to upload</div>
      </div>
    </Card>
  );
}

function CurriculumProgress() {
  const [modules, setModules] = useState([
    { name: "Module 1: Algebra", pct: 85 },
    { name: "Module 2: Geometry", pct: 65 },
    { name: "Module 3: Statistics", pct: 55 },
  ]);

  const updatePct = (index: number, values: number[]) => {
    setModules((prev) => prev.map((m, i) => (i === index ? { ...m, pct: values[0] } : m)));
  };

  return (
    <Card className="p-4">
      <SectionHeader title="Curriculum Progress" description="Update module completion percentages" />
      <div className="space-y-5">
        {modules.map((m, i) => (
          <div key={m.name} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{m.name}</span>
              <span className="text-xs font-medium">{m.pct}%</span>
            </div>
            <Slider value={[m.pct]} min={0} max={100} step={1} onValueChange={(v) => updatePct(i, v)} />
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button variant="secondary">Sync Progress to Dashboard</Button>
        <Button variant="outline">Save Draft</Button>
      </div>
    </Card>
  );
}


