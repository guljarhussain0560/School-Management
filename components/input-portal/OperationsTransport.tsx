"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { BusFront, Wrench, ShieldAlert } from "lucide-react";

export default function OperationsTransport() {
  return (
    <div className="space-y-6">
      <BusRoutes />
      <MaintenanceLog />
      <SafetyAlerts />
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <BusFront className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-lg font-medium leading-none tracking-tight">{title}</h2>
      </div>
      {description ? <p className="text-sm text-muted-foreground mt-1">{description}</p> : null}
    </div>
  );
}

function BusRoutes() {
  const { toast } = useToast();
  return (
    <Card className="p-4">
      <SectionHeader title="Bus Route & Tracking" description="Manage bus routes and real-time tracking" />
      <div className="grid gap-4">
        {["Route A","Route B","Route C"].map((route, i) => (
          <div key={route} className="rounded-md border bg-white p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-medium">{route} <span className="text-xs text-muted-foreground">Bus #{i === 0 ? 25 : i === 1 ? 30 : 22}</span></div>
              <Badge variant={i === 1 ? "destructive" : "secondary"}>{i === 1 ? "Delayed" : "On Time"}</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label>Status Override</Label>
                <Select defaultValue={i === 1 ? "delayed" : "ontime"}>
                  <SelectTrigger><SelectValue placeholder="Override" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ontime">On Time</SelectItem>
                    <SelectItem value="delayed">Delayed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Delay Reason</Label>
                <Select defaultValue={i === 1 ? "traffic" : ""}>
                  <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="traffic">Traffic</SelectItem>
                    <SelectItem value="breakdown">Breakdown</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline">Live GPS</Button>
              </div>
            </div>
          </div>
        ))}
        <div className="rounded-md border bg-white p-3">
          <div className="mb-2 font-medium">Student Route Assignment</div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label>Student</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="st1">Alice Johnson</SelectItem>
                  <SelectItem value="st2">Bob Smith</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Assign to Route</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select route" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Route A</SelectItem>
                  <SelectItem value="B">Route B</SelectItem>
                  <SelectItem value="C">Route C</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button>Assign Student</Button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 rounded-md border border-dashed bg-muted/40 p-6 text-center text-sm text-muted-foreground">
        Live GPS map placeholder. Manual override enabled. Use delay + reason to send alert.
      </div>
      <div className="mt-3 flex gap-2">
        <Button onClick={() => toast({ description: "Transport alert synced to dashboard." })}>Sync Alert</Button>
        <Button variant="outline">Save Draft</Button>
      </div>
    </Card>
  );
}

function MaintenanceLog() {
  const items = [
    { name: "Library Air Conditioning", last: "2024-01-15", badge: "OK" },
    { name: "Playground Equipment", last: "2024-01-10", badge: "Needs Repair" },
    { name: "Computer Lab", last: "2024-01-12", badge: "In Progress" },
  ];
  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center gap-2"><Wrench className="h-4 w-4 text-muted-foreground" /><h2 className="text-lg font-medium leading-none tracking-tight">Maintenance Log</h2></div>
      <p className="text-sm text-muted-foreground mb-3">Track facility maintenance and repair status</p>
      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.name} className="rounded-md border bg-white p-3">
            <div className="mb-2 flex items-center justify-between text-sm">
              <div>
                <div className="font-medium">{it.name}</div>
                <div className="text-xs text-muted-foreground">Last checked: {it.last}</div>
              </div>
              <div className="text-xs text-muted-foreground">{it.badge}</div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label>Status</Label>
                <Select defaultValue={it.badge === "Needs Repair" ? "needs" : it.badge === "In Progress" ? "progress" : "ok"}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ok">OK</SelectItem>
                    <SelectItem value="needs">Needs Repair</SelectItem>
                    <SelectItem value="progress">In Progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <Input placeholder="Maintenance notes..." />
              </div>
              <div className="sm:col-span-2">
                <Label>Proof Upload</Label>
                <div className="flex items-center gap-2">
                  <Input type="file" accept="image/*,application/pdf" aria-label="Upload maintenance proof" />
                  <Button variant="outline">Upload Photo</Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <Button variant="secondary" className="w-full">Update Maintenance Status</Button>
      </div>
    </Card>
  );
}

function SafetyAlerts() {
  const { toast } = useToast();
  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-muted-foreground" /><h2 className="text-lg font-medium leading-none tracking-tight">Safety Alerts</h2></div>
      <p className="text-sm text-muted-foreground mb-2">Report and manage safety incidents and alerts</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label>Alert Type</Label>
          <Select defaultValue="delay">
            <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fire">Fire Drill</SelectItem>
              <SelectItem value="accident">Accident</SelectItem>
              <SelectItem value="delay">Delay</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Priority</Label>
          <Select defaultValue="medium">
            <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2 lg:col-span-4">
          <Label>Description</Label>
          <Textarea placeholder="Enter details" />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="secondary" className="w-full sm:w-auto" onClick={() => toast({ description: "Alerts synced to dashboard." })}>Sync Alerts to Dashboard</Button>
        <Button variant="outline">Save Draft</Button>
      </div>
    </Card>
  );
}


