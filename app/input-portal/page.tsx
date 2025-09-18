"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Shield, UserCog } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import AcademicData from "@/components/input-portal/AcademicData";
import FinancialData from "@/components/input-portal/FinancialData";
import OperationsTransport from "@/components/input-portal/OperationsTransport";
import Admissions from "@/components/input-portal/Admissions";

type UserRole = "Teacher" | "Admin" | "Transport Manager";

const ALL_TABS = [
  { key: "academic", label: "Academic Data" },
  { key: "financial", label: "Financial Data" },
  { key: "operations", label: "Operations & Transport" },
  { key: "admissions", label: "Admissions" },
];

const ROLE_ACCESS: Record<UserRole, string[]> = {
  Teacher: ["academic"],
  Admin: ["financial", "admissions"],
  "Transport Manager": ["operations"],
};

export default function InputPortalPage() {
  const [role, setRole] = useState<UserRole>("Teacher");

  const visibleTabs = useMemo(() => {
    const allowed = new Set(ROLE_ACCESS[role]);
    return ALL_TABS.filter((t) => allowed.has(t.key));
  }, [role]);

  const defaultTab = visibleTabs[0]?.key ?? "academic";

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-6">
      <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">School Management Input Portal</h1>
          <p className="text-sm text-muted-foreground">Data input interface for academic, financial, and operational management</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>Last sync: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
      <Card className="mb-4 p-3">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary" className="flex items-center gap-1"><Shield className="h-3 w-3" /> Current Role:</Badge>
          <div className="flex items-center gap-3">
            <Label htmlFor="role" className="text-sm flex items-center gap-1"><UserCog className="h-4 w-4" /> Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger id="role" className="w-[220px]">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Teacher">Teacher</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Transport Manager">Transport Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Tabs defaultValue={defaultTab} className="mt-2" key={role}>
        <div className="sticky top-0 z-10 -mx-4 mb-3 border-b bg-background/80 px-4 py-2 backdrop-blur md:-mx-6 md:px-6">
          <TabsList className="flex w-full flex-wrap overflow-x-auto">
          {visibleTabs.map((t) => (
            <TabsTrigger key={t.key} value={t.key} className="whitespace-nowrap">
              {t.label}
            </TabsTrigger>
          ))}
          </TabsList>
        </div>

        <TabsContent value="academic">
          <AcademicData />
        </TabsContent>
        <TabsContent value="financial">
          <FinancialData />
        </TabsContent>
        <TabsContent value="operations">
          <OperationsTransport />
        </TabsContent>
        <TabsContent value="admissions">
          <Admissions />
        </TabsContent>
      </Tabs>

      <div className="sticky bottom-0 mt-6 -mx-4 border-t bg-background/80 px-4 py-2 text-xs text-muted-foreground backdrop-blur md:-mx-6 md:px-6">
        Syncing data with monitoring dashboard...
      </div>
    </div>
  );
}


