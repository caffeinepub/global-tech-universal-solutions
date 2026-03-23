import { ApplicationStatus, JobRole, UserRole } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  AlertCircle,
  ChevronLeft,
  ExternalLink,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  RefreshCw,
  RotateCcw,
  Shield,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { JobApplication, VisitorLog } from "../backend";

const JOB_ROLE_LABELS: Record<JobRole, string> = {
  [JobRole.fullStackDeveloper]: "Full Stack Developer",
  [JobRole.securityEngineer]: "Security Engineer",
  [JobRole.cybersecurityAnalyst]: "Cybersecurity Analyst",
  [JobRole.softwareEngineer]: "Software Engineer",
  [JobRole.networkEngineer]: "Network Engineer",
  [JobRole.dataScientist]: "Data Scientist",
};

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.pending]:
    "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  [ApplicationStatus.reviewed]:
    "bg-blue-500/20 text-blue-300 border-blue-500/30",
  [ApplicationStatus.interview]:
    "bg-purple-500/20 text-purple-300 border-purple-500/30",
  [ApplicationStatus.offered]:
    "bg-green-500/20 text-green-300 border-green-500/30",
  [ApplicationStatus.rejected]: "bg-red-500/20 text-red-300 border-red-500/30",
};

function formatTimestamp(ns: bigint): string {
  const ms = Number(ns / BigInt(1_000_000));
  return new Date(ms).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface AdminDashboardProps {
  onBack: () => void;
}

function StatCard({
  label,
  value,
  color,
  isLoading,
}: {
  label: string;
  value: string | number;
  color: string;
  isLoading: boolean;
}) {
  return (
    <Card
      style={{
        background: "oklch(0.12 0.022 255)",
        border: "1px solid oklch(0.22 0.035 255)",
      }}
    >
      <CardContent className="pt-5 pb-5">
        <p
          className="text-xs font-medium uppercase tracking-widest mb-1"
          style={{ color: "oklch(0.55 0.025 230)" }}
        >
          {label}
        </p>
        <p
          className="text-3xl font-bold"
          style={{ color, fontFamily: "Syne, sans-serif" }}
        >
          {isLoading ? "—" : value}
        </p>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
  const { identity, clear } = useInternetIdentity();
  const { actor, isFetching } = useActor();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [isClaimingAdmin, setIsClaimingAdmin] = useState(false);
  const [isResettingAdmin, setIsResettingAdmin] = useState(false);

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [blockedEmails, setBlockedEmails] = useState<string[]>([]);
  const [acceptingApps, setAcceptingApps] = useState(true);
  const [totalApps, setTotalApps] = useState<bigint>(BigInt(0));
  const [isLoading, setIsLoading] = useState(false);
  const [isTogglingApps, setIsTogglingApps] = useState(false);
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>([]);
  const [isLoadingVisitors, setIsLoadingVisitors] = useState(false);

  const loadData = useCallback(async () => {
    if (!actor) return;
    setIsLoading(true);
    try {
      const [apps, blocked, accepting, total] = await Promise.all([
        actor.getAllApplications(),
        actor.getBlockedEmails(),
        actor.isAcceptingApplications(),
        actor.getTotalApplications(),
      ]);
      setApplications(apps);
      setBlockedEmails(blocked);
      setAcceptingApps(accepting);
      setTotalApps(total);
    } catch {
      toast.error("Failed to load admin data");
    } finally {
      setIsLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    if (!actor || isFetching) return;
    setIsCheckingAdmin(true);
    actor
      .isCallerAdmin()
      .then((result) => {
        setIsAdmin(result);
        if (result) loadData();
      })
      .catch(() => setIsAdmin(false))
      .finally(() => setIsCheckingAdmin(false));
  }, [actor, isFetching, loadData]);

  const handleClaimAdmin = async () => {
    if (!actor || !identity) return;
    setIsClaimingAdmin(true);
    try {
      const principal = identity.getPrincipal();
      await actor.assignCallerUserRole(principal, UserRole.admin);
      toast.success("Admin access claimed!");
      setIsAdmin(true);
      await loadData();
    } catch {
      toast.error(
        "Failed to claim admin access. The admin role may already be assigned.",
      );
    } finally {
      setIsClaimingAdmin(false);
    }
  };

  const handleResetAdminClaim = async (requireConfirm = false) => {
    if (!actor) return;
    if (requireConfirm) {
      const confirmed = window.confirm(
        "Are you sure? This will log out all admins.",
      );
      if (!confirmed) return;
    }
    setIsResettingAdmin(true);
    try {
      await (actor as any).resetAdminClaim();
      toast.success("Admin claim reset. You can now claim admin access.");
      // Immediately re-register as admin
      await handleClaimAdmin();
    } catch {
      toast.error("Failed to reset admin claim.");
    } finally {
      setIsResettingAdmin(false);
    }
  };

  const handleToggleApplications = async (value: boolean) => {
    if (!actor) return;
    setIsTogglingApps(true);
    try {
      await actor.setAcceptingApplications(value);
      setAcceptingApps(value);
      toast.success(
        value ? "Applications are now open" : "Applications are now closed",
      );
    } catch {
      toast.error("Failed to update application status");
    } finally {
      setIsTogglingApps(false);
    }
  };

  const handleStatusChange = async (
    id: bigint,
    newStatus: ApplicationStatus,
  ) => {
    if (!actor) return;
    try {
      await actor.updateApplicationStatus(id, newStatus);
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: newStatus } : app,
        ),
      );
      if (selectedApp?.id === id) {
        setSelectedApp((prev) =>
          prev ? { ...prev, status: newStatus } : prev,
        );
      }
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleUnblock = async (email: string) => {
    if (!actor) return;
    try {
      await actor.unblockEmail(email);
      setBlockedEmails((prev) => prev.filter((e) => e !== email));
      toast.success(`Unblocked ${email}`);
    } catch {
      toast.error("Failed to unblock email");
    }
  };

  const handleLogout = () => {
    clear();
    onBack();
  };

  const countByStatus = (status: ApplicationStatus) =>
    applications.filter((a) => a.status === status).length;

  if (isCheckingAdmin || isFetching) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.09 0.018 255)" }}
        data-ocid="admin.loading_state"
      >
        <div className="text-center">
          <Loader2
            className="h-10 w-10 animate-spin mx-auto mb-4"
            style={{ color: "oklch(0.84 0.18 200)" }}
          />
          <p style={{ color: "oklch(0.55 0.025 230)" }}>
            Verifying admin access...
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: "oklch(0.09 0.018 255)" }}
      >
        <Card
          className="max-w-md w-full text-center"
          style={{
            background: "oklch(0.12 0.022 255)",
            border: "1px solid oklch(0.22 0.035 255)",
          }}
          data-ocid="admin.panel"
        >
          <CardHeader>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "oklch(0.84 0.18 200 / 0.15)" }}
            >
              <Shield size={32} style={{ color: "oklch(0.84 0.18 200)" }} />
            </div>
            <CardTitle
              className="text-xl"
              style={{
                fontFamily: "Syne, sans-serif",
                color: "oklch(0.94 0.01 230)",
              }}
            >
              Admin Access Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p style={{ color: "oklch(0.55 0.025 230)" }}>
              Your account does not have admin privileges. If you are the first
              admin, you can claim access below.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleClaimAdmin}
                disabled={isClaimingAdmin || isResettingAdmin}
                className="w-full font-semibold"
                style={{
                  background: "oklch(0.84 0.18 200)",
                  color: "oklch(0.09 0.018 255)",
                }}
                data-ocid="admin.primary_button"
              >
                {isClaimingAdmin ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Claiming...
                  </>
                ) : (
                  "Claim Admin Access"
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => handleResetAdminClaim(false)}
                disabled={isResettingAdmin || isClaimingAdmin}
                className="w-full font-semibold"
                style={{
                  borderColor: "oklch(0.65 0.20 30 / 0.5)",
                  color: "oklch(0.72 0.18 30)",
                  background: "transparent",
                }}
                data-ocid="admin.secondary_button"
              >
                {isResettingAdmin ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <RotateCcw size={15} className="mr-2" />
                    Reset &amp; Claim Admin Access
                  </>
                )}
              </Button>
              <p className="text-xs" style={{ color: "oklch(0.45 0.020 230)" }}>
                Use this if you previously claimed admin but lost access.
              </p>

              <Button
                variant="ghost"
                onClick={onBack}
                style={{ color: "oklch(0.55 0.025 230)" }}
                data-ocid="admin.close_button"
              >
                <ChevronLeft size={16} className="mr-1" /> Back to Site
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.09 0.018 255)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between"
        style={{
          background: "oklch(0.09 0.018 255 / 0.95)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid oklch(0.22 0.035 255)",
        }}
        data-ocid="admin.panel"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            style={{ color: "oklch(0.55 0.025 230)" }}
            data-ocid="admin.secondary_button"
          >
            <ChevronLeft size={16} className="mr-1" /> Site
          </Button>
          <div className="flex items-center gap-2">
            <Shield size={20} style={{ color: "oklch(0.84 0.18 200)" }} />
            <h1
              className="text-lg font-bold"
              style={{
                fontFamily: "Syne, sans-serif",
                color: "oklch(0.94 0.01 230)",
              }}
            >
              Admin Dashboard
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            style={{ color: "oklch(0.84 0.18 200)" }}
            data-ocid="admin.secondary_button"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <RefreshCw size={14} className="mr-1" /> Refresh
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleResetAdminClaim(true)}
            disabled={isResettingAdmin || isClaimingAdmin}
            className="text-xs"
            style={{ color: "oklch(0.72 0.18 30)" }}
            data-ocid="admin.delete_button"
          >
            {isResettingAdmin ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
            ) : (
              <RotateCcw size={13} className="mr-1" />
            )}
            Reset Admin
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            style={{ color: "oklch(0.6 0.22 30)" }}
            data-ocid="admin.close_button"
          >
            <LogOut size={16} className="mr-1" /> Logout
          </Button>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList
            className="inline-flex h-11 gap-1 p-1 rounded-xl"
            style={{
              background: "oklch(0.12 0.022 255)",
              border: "1px solid oklch(0.22 0.035 255)",
            }}
            data-ocid="admin.tab"
          >
            {["overview", "applicants", "blocked"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="capitalize text-sm font-medium px-5 rounded-lg data-[state=active]:text-[oklch(0.09_0.018_255)]"
                style={{
                  color: "oklch(0.60 0.025 230)",
                }}
                data-ocid={`admin.${tab}.tab`}
              >
                {tab === "blocked"
                  ? "Blocked Emails"
                  : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </TabsTrigger>
            ))}
            <TabsTrigger
              value="visitors"
              className="text-sm font-medium px-5 rounded-lg data-[state=active]:text-[oklch(0.09_0.018_255)]"
              style={{ color: "oklch(0.60 0.025 230)" }}
              data-ocid="admin.visitors.tab"
              onClick={() => {
                if (!actor) return;
                setIsLoadingVisitors(true);
                actor
                  .getVisitorLogs()
                  .then((logs) => setVisitorLogs(logs))
                  .catch(() => toast.error("Failed to load visitor logs"))
                  .finally(() => setIsLoadingVisitors(false));
              }}
            >
              Visitors{visitorLogs.length > 0 ? ` (${visitorLogs.length})` : ""}
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard
                label="Total"
                value={totalApps.toString()}
                color="oklch(0.94 0.01 230)"
                isLoading={isLoading}
              />
              <StatCard
                label="Pending"
                value={countByStatus(ApplicationStatus.pending)}
                color="oklch(0.85 0.15 85)"
                isLoading={isLoading}
              />
              <StatCard
                label="Reviewed"
                value={countByStatus(ApplicationStatus.reviewed)}
                color="oklch(0.72 0.15 230)"
                isLoading={isLoading}
              />
              <StatCard
                label="Interview"
                value={countByStatus(ApplicationStatus.interview)}
                color="oklch(0.75 0.18 290)"
                isLoading={isLoading}
              />
              <StatCard
                label="Offered"
                value={countByStatus(ApplicationStatus.offered)}
                color="oklch(0.75 0.18 145)"
                isLoading={isLoading}
              />
              <StatCard
                label="Rejected"
                value={countByStatus(ApplicationStatus.rejected)}
                color="oklch(0.65 0.20 30)"
                isLoading={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Accept Applications Card */}
              <Card
                style={{
                  background: "oklch(0.12 0.022 255)",
                  border: "1px solid oklch(0.22 0.035 255)",
                }}
              >
                <CardHeader className="pb-3">
                  <CardTitle
                    className="text-sm font-semibold"
                    style={{ color: "oklch(0.94 0.01 230)" }}
                  >
                    Application Intake
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: "oklch(0.94 0.01 230)" }}
                      >
                        Accept New Applications
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "oklch(0.55 0.025 230)" }}
                      >
                        {acceptingApps
                          ? "Application form is visible to visitors"
                          : "Application form is hidden from visitors"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        className={`text-xs border ${
                          acceptingApps
                            ? "bg-green-500/20 text-green-300 border-green-500/30"
                            : "bg-red-500/20 text-red-300 border-red-500/30"
                        }`}
                      >
                        {acceptingApps ? "Open" : "Closed"}
                      </Badge>
                      {isTogglingApps ? (
                        <Loader2
                          className="h-5 w-5 animate-spin"
                          style={{ color: "oklch(0.84 0.18 200)" }}
                        />
                      ) : (
                        <Switch
                          checked={acceptingApps}
                          onCheckedChange={handleToggleApplications}
                          disabled={isTogglingApps}
                          data-ocid="admin.toggle"
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Blocked Emails Card */}
              <Card
                style={{
                  background: "oklch(0.12 0.022 255)",
                  border: "1px solid oklch(0.22 0.035 255)",
                }}
              >
                <CardHeader className="pb-3">
                  <CardTitle
                    className="text-sm font-semibold"
                    style={{ color: "oklch(0.94 0.01 230)" }}
                  >
                    Blocked Emails
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: "oklch(0.6 0.22 30 / 0.12)" }}
                    >
                      <Mail
                        size={18}
                        style={{ color: "oklch(0.65 0.20 30)" }}
                      />
                    </div>
                    <div>
                      <p
                        className="text-2xl font-bold"
                        style={{
                          color: "oklch(0.94 0.01 230)",
                          fontFamily: "Syne, sans-serif",
                        }}
                      >
                        {isLoading ? "—" : blockedEmails.length}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "oklch(0.55 0.025 230)" }}
                      >
                        addresses blocked
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* APPLICANTS TAB */}
          <TabsContent value="applicants" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2
                  className="text-lg font-bold"
                  style={{
                    fontFamily: "Syne, sans-serif",
                    color: "oklch(0.94 0.01 230)",
                  }}
                >
                  All Applicants
                </h2>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "oklch(0.55 0.025 230)" }}
                >
                  {applications.length} total applicant
                  {applications.length !== 1 ? "s" : ""} — click any row to view
                  full details
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                  style={{
                    background: "oklch(0.84 0.18 200 / 0.08)",
                    border: "1px solid oklch(0.84 0.18 200 / 0.2)",
                  }}
                >
                  <Users size={14} style={{ color: "oklch(0.84 0.18 200)" }} />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "oklch(0.84 0.18 200)" }}
                  >
                    {isLoading ? "—" : totalApps.toString()}
                  </span>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div
                className="flex items-center justify-center py-20"
                data-ocid="admin.loading_state"
              >
                <Loader2
                  className="h-8 w-8 animate-spin"
                  style={{ color: "oklch(0.84 0.18 200)" }}
                />
              </div>
            ) : applications.length === 0 ? (
              <div
                className="rounded-xl border py-20 text-center"
                style={{
                  borderColor: "oklch(0.22 0.035 255)",
                  background: "oklch(0.12 0.022 255)",
                }}
                data-ocid="admin.empty_state"
              >
                <AlertCircle
                  size={40}
                  className="mx-auto mb-3"
                  style={{ color: "oklch(0.55 0.025 230)" }}
                />
                <p style={{ color: "oklch(0.55 0.025 230)" }}>
                  No applications yet.
                </p>
              </div>
            ) : (
              <div
                className="rounded-xl border overflow-hidden"
                style={{
                  borderColor: "oklch(0.22 0.035 255)",
                  background: "oklch(0.12 0.022 255)",
                }}
                data-ocid="admin.table"
              >
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow
                        style={{ borderColor: "oklch(0.22 0.035 255)" }}
                      >
                        {[
                          "#",
                          "Name",
                          "Email",
                          "Role",
                          "Location",
                          "Status",
                          "Applied",
                          "Actions",
                        ].map((h) => (
                          <TableHead
                            key={h}
                            className="text-xs font-semibold uppercase tracking-wider"
                            style={{ color: "oklch(0.55 0.025 230)" }}
                          >
                            {h}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((app, idx) => (
                        <TableRow
                          key={app.id.toString()}
                          className="cursor-pointer transition-colors hover:bg-white/[0.02]"
                          style={{ borderColor: "oklch(0.22 0.035 255)" }}
                          data-ocid={`admin.item.${idx + 1}`}
                          onClick={() => setSelectedApp(app)}
                        >
                          <TableCell
                            className="text-xs"
                            style={{ color: "oklch(0.45 0.025 230)" }}
                          >
                            {idx + 1}
                          </TableCell>
                          <TableCell
                            className="font-medium whitespace-nowrap"
                            style={{ color: "oklch(0.94 0.01 230)" }}
                          >
                            {app.fullName}
                          </TableCell>
                          <TableCell
                            className="text-sm"
                            style={{ color: "oklch(0.72 0.03 230)" }}
                          >
                            {app.email}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="text-xs whitespace-nowrap"
                              style={{
                                borderColor: "oklch(0.84 0.18 200 / 0.4)",
                                color: "oklch(0.84 0.18 200)",
                              }}
                            >
                              {JOB_ROLE_LABELS[app.role] ?? app.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {app.location ? (
                              <div className="flex items-center gap-1.5">
                                <MapPin
                                  size={12}
                                  style={{ color: "oklch(0.75 0.18 145)" }}
                                />
                                <span
                                  className="text-xs font-mono"
                                  style={{ color: "oklch(0.65 0.025 230)" }}
                                >
                                  {app.location.latitude.toFixed(4)},{" "}
                                  {app.location.longitude.toFixed(4)}
                                </span>
                              </div>
                            ) : (
                              <span
                                className="text-xs"
                                style={{ color: "oklch(0.40 0.020 230)" }}
                              >
                                Not provided
                              </span>
                            )}
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Select
                              value={app.status}
                              onValueChange={(val) =>
                                handleStatusChange(
                                  app.id,
                                  val as ApplicationStatus,
                                )
                              }
                            >
                              <SelectTrigger
                                className={`h-7 text-xs w-28 border ${STATUS_COLORS[app.status]}`}
                                data-ocid="admin.select"
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent
                                style={{
                                  background: "oklch(0.14 0.025 255)",
                                  borderColor: "oklch(0.22 0.035 255)",
                                }}
                              >
                                {Object.values(ApplicationStatus).map((s) => (
                                  <SelectItem
                                    key={s}
                                    value={s}
                                    className="text-xs capitalize"
                                  >
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell
                            className="text-xs whitespace-nowrap"
                            style={{ color: "oklch(0.55 0.025 230)" }}
                          >
                            {formatTimestamp(app.timestamp)}
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs"
                              onClick={() => setSelectedApp(app)}
                              style={{ color: "oklch(0.84 0.18 200)" }}
                              data-ocid="admin.edit_button"
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </TabsContent>

          {/* BLOCKED EMAILS TAB */}
          <TabsContent value="blocked" className="space-y-4">
            <div>
              <h2
                className="text-lg font-bold"
                style={{
                  fontFamily: "Syne, sans-serif",
                  color: "oklch(0.94 0.01 230)",
                }}
              >
                Blocked Email Addresses
              </h2>
              <p
                className="text-xs mt-0.5"
                style={{ color: "oklch(0.55 0.025 230)" }}
              >
                These addresses cannot submit new applications.
              </p>
            </div>

            {isLoading ? (
              <div
                className="flex items-center justify-center py-16"
                data-ocid="admin.loading_state"
              >
                <Loader2
                  className="h-6 w-6 animate-spin"
                  style={{ color: "oklch(0.84 0.18 200)" }}
                />
              </div>
            ) : blockedEmails.length === 0 ? (
              <div
                className="rounded-xl border py-16 text-center"
                style={{
                  borderColor: "oklch(0.22 0.035 255)",
                  background: "oklch(0.12 0.022 255)",
                }}
                data-ocid="admin.empty_state"
              >
                <Mail
                  size={36}
                  className="mx-auto mb-3"
                  style={{ color: "oklch(0.40 0.025 230)" }}
                />
                <p style={{ color: "oklch(0.55 0.025 230)" }}>
                  No blocked emails.
                </p>
              </div>
            ) : (
              <div
                className="rounded-xl border divide-y overflow-hidden"
                style={{
                  borderColor: "oklch(0.22 0.035 255)",
                  background: "oklch(0.12 0.022 255)",
                }}
              >
                {blockedEmails.map((email, idx) => (
                  <div
                    key={email}
                    className="flex items-center justify-between px-5 py-3.5"
                    style={{ borderColor: "oklch(0.22 0.035 255)" }}
                    data-ocid={`admin.item.${idx + 1}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: "oklch(0.6 0.22 30 / 0.10)" }}
                      >
                        <Mail
                          size={13}
                          style={{ color: "oklch(0.65 0.20 30)" }}
                        />
                      </div>
                      <span
                        className="text-sm"
                        style={{ color: "oklch(0.72 0.03 230)" }}
                      >
                        {email}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUnblock(email)}
                      className="text-xs h-7"
                      style={{
                        color: "oklch(0.84 0.18 200)",
                        borderColor: "oklch(0.84 0.18 200 / 0.3)",
                      }}
                      data-ocid="admin.delete_button"
                    >
                      Unblock
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* VISITORS TAB */}
          <TabsContent value="visitors" className="space-y-4">
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: "oklch(0.12 0.022 255)",
                border: "1px solid oklch(0.22 0.035 255)",
              }}
            >
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{ borderBottom: "1px solid oklch(0.18 0.028 255)" }}
              >
                <div className="flex items-center gap-3">
                  <MapPin
                    className="h-5 w-5"
                    style={{ color: "oklch(0.62 0.18 255)" }}
                  />
                  <h2
                    className="text-lg font-semibold"
                    style={{ color: "oklch(0.92 0.018 255)" }}
                  >
                    Visitor Locations
                  </h2>
                  {visitorLogs.length > 0 && (
                    <span
                      className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                      style={{
                        background: "oklch(0.22 0.05 255)",
                        color: "oklch(0.75 0.12 255)",
                      }}
                    >
                      {visitorLogs.length}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isLoadingVisitors}
                  data-ocid="admin.visitors.button"
                  onClick={() => {
                    if (!actor) return;
                    setIsLoadingVisitors(true);
                    actor
                      .getVisitorLogs()
                      .then((logs) => setVisitorLogs(logs))
                      .catch(() => toast.error("Failed to load visitor logs"))
                      .finally(() => setIsLoadingVisitors(false));
                  }}
                  style={{ color: "oklch(0.60 0.025 230)" }}
                >
                  {isLoadingVisitors ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span className="ml-2">
                    {isLoadingVisitors ? "Loading..." : "Refresh"}
                  </span>
                </Button>
              </div>

              {isLoadingVisitors ? (
                <div
                  className="flex items-center justify-center py-16 gap-3"
                  data-ocid="admin.visitors.loading_state"
                  style={{ color: "oklch(0.55 0.025 230)" }}
                >
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Loading visitor data...</span>
                </div>
              ) : visitorLogs.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-16 gap-3"
                  data-ocid="admin.visitors.empty_state"
                >
                  <MapPin
                    className="h-10 w-10 opacity-30"
                    style={{ color: "oklch(0.55 0.025 230)" }}
                  />
                  <p
                    className="text-sm"
                    style={{ color: "oklch(0.55 0.025 230)" }}
                  >
                    No visitor location data yet.
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.42 0.022 255)" }}
                  >
                    Visitors who allow location access will appear here.
                  </p>
                </div>
              ) : (
                <div
                  className="overflow-x-auto"
                  data-ocid="admin.visitors.table"
                >
                  <Table>
                    <TableHeader>
                      <TableRow
                        style={{ borderColor: "oklch(0.18 0.028 255)" }}
                      >
                        <TableHead
                          className="text-xs font-semibold uppercase tracking-wider pl-6"
                          style={{ color: "oklch(0.50 0.025 230)" }}
                        >
                          #
                        </TableHead>
                        <TableHead
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{ color: "oklch(0.50 0.025 230)" }}
                        >
                          Date / Time
                        </TableHead>
                        <TableHead
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{ color: "oklch(0.50 0.025 230)" }}
                        >
                          GPS Coordinates
                        </TableHead>
                        <TableHead
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{ color: "oklch(0.50 0.025 230)" }}
                        >
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visitorLogs.map((log, idx) => {
                        const ts = Number(log.timestamp) / 1_000_000;
                        const date = new Date(ts);
                        const formatted = date.toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        });
                        const lat = log.latitude.toFixed(6);
                        const lng = log.longitude.toFixed(6);
                        const mapsUrl = `https://maps.google.com/?q=${log.latitude},${log.longitude}`;
                        return (
                          <TableRow
                            key={String(log.id)}
                            data-ocid={`admin.visitors.row.${idx + 1}`}
                            style={{ borderColor: "oklch(0.16 0.025 255)" }}
                          >
                            <TableCell
                              className="pl-6 text-sm font-mono"
                              style={{ color: "oklch(0.50 0.025 230)" }}
                            >
                              {idx + 1}
                            </TableCell>
                            <TableCell
                              className="text-sm"
                              style={{ color: "oklch(0.78 0.018 255)" }}
                            >
                              {formatted}
                            </TableCell>
                            <TableCell
                              className="text-sm font-mono"
                              style={{ color: "oklch(0.78 0.018 255)" }}
                            >
                              {lat}, {lng}
                            </TableCell>
                            <TableCell>
                              <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                data-ocid={`admin.visitors.link.${idx + 1}`}
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1.5 text-xs"
                                  style={{ color: "oklch(0.62 0.18 255)" }}
                                >
                                  <MapPin className="h-3.5 w-3.5" />
                                  View on Google Maps
                                  <ExternalLink className="h-3 w-3 opacity-60" />
                                </Button>
                              </a>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Applicant Detail Sheet */}
      <Sheet
        open={!!selectedApp}
        onOpenChange={(open) => {
          if (!open) setSelectedApp(null);
        }}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl overflow-y-auto"
          style={{
            background: "oklch(0.11 0.020 255)",
            borderLeft: "1px solid oklch(0.22 0.035 255)",
          }}
          data-ocid="admin.sheet"
        >
          {selectedApp && (
            <>
              <SheetHeader className="pb-4">
                <SheetTitle
                  className="text-xl font-bold"
                  style={{
                    fontFamily: "Syne, sans-serif",
                    color: "oklch(0.94 0.01 230)",
                  }}
                >
                  Applicant Details
                </SheetTitle>
              </SheetHeader>

              {/* Top line */}
              <div
                className="h-px w-full mb-6"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, oklch(0.84 0.18 200 / 0.4), transparent)",
                }}
              />

              <div className="space-y-6">
                {/* Name & Role */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className="text-xs uppercase tracking-widest mb-1"
                      style={{ color: "oklch(0.50 0.025 230)" }}
                    >
                      Full Name
                    </p>
                    <p
                      className="text-xl font-bold"
                      style={{ color: "oklch(0.97 0.01 230)" }}
                    >
                      {selectedApp.fullName}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs mt-1 whitespace-nowrap shrink-0"
                    style={{
                      borderColor: "oklch(0.84 0.18 200 / 0.4)",
                      color: "oklch(0.84 0.18 200)",
                    }}
                  >
                    {JOB_ROLE_LABELS[selectedApp.role] ?? selectedApp.role}
                  </Badge>
                </div>

                {/* Email */}
                <div>
                  <p
                    className="text-xs uppercase tracking-widest mb-1"
                    style={{ color: "oklch(0.50 0.025 230)" }}
                  >
                    Email
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "oklch(0.80 0.03 230)" }}
                  >
                    {selectedApp.email}
                  </p>
                </div>

                {/* Applied */}
                <div>
                  <p
                    className="text-xs uppercase tracking-widest mb-1"
                    style={{ color: "oklch(0.50 0.025 230)" }}
                  >
                    Applied
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "oklch(0.80 0.03 230)" }}
                  >
                    {formatTimestamp(selectedApp.timestamp)}
                  </p>
                </div>

                {/* Status */}
                <div>
                  <p
                    className="text-xs uppercase tracking-widest mb-2"
                    style={{ color: "oklch(0.50 0.025 230)" }}
                  >
                    Application Status
                  </p>
                  <Select
                    value={selectedApp.status}
                    onValueChange={(val) =>
                      handleStatusChange(
                        selectedApp.id,
                        val as ApplicationStatus,
                      )
                    }
                  >
                    <SelectTrigger
                      className={`h-9 text-sm w-44 border ${STATUS_COLORS[selectedApp.status]}`}
                      data-ocid="admin.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      style={{
                        background: "oklch(0.14 0.025 255)",
                        borderColor: "oklch(0.22 0.035 255)",
                      }}
                    >
                      {Object.values(ApplicationStatus).map((s) => (
                        <SelectItem
                          key={s}
                          value={s}
                          className="text-sm capitalize"
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Resume */}
                <div>
                  <p
                    className="text-xs uppercase tracking-widest mb-2"
                    style={{ color: "oklch(0.50 0.025 230)" }}
                  >
                    Resume / LinkedIn
                  </p>
                  {selectedApp.resumeUrl ? (
                    <a
                      href={selectedApp.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm underline underline-offset-2"
                      style={{ color: "oklch(0.84 0.18 200)" }}
                    >
                      <ExternalLink size={14} />
                      View Profile / Resume
                    </a>
                  ) : (
                    <p
                      className="text-sm"
                      style={{ color: "oklch(0.45 0.025 230)" }}
                    >
                      Not provided
                    </p>
                  )}
                </div>

                {/* Cover Note */}
                <div>
                  <p
                    className="text-xs uppercase tracking-widest mb-2"
                    style={{ color: "oklch(0.50 0.025 230)" }}
                  >
                    Cover Note
                  </p>
                  <div
                    className="rounded-lg p-4 text-sm leading-relaxed"
                    style={{
                      background: "oklch(0.09 0.018 255)",
                      border: "1px solid oklch(0.20 0.032 255)",
                      color: "oklch(0.75 0.025 230)",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {selectedApp.coverNote || (
                      <span style={{ color: "oklch(0.45 0.025 230)" }}>
                        No cover note provided.
                      </span>
                    )}
                  </div>
                </div>

                {/* Location Section */}
                <div>
                  <p
                    className="text-xs uppercase tracking-widest mb-3"
                    style={{ color: "oklch(0.50 0.025 230)" }}
                  >
                    Location at Application
                  </p>
                  {selectedApp.location ? (
                    <div
                      className="rounded-xl p-5 space-y-4"
                      style={{
                        background: "oklch(0.75 0.18 145 / 0.06)",
                        border: "1px solid oklch(0.75 0.18 145 / 0.25)",
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: "oklch(0.75 0.18 145 / 0.15)" }}
                        >
                          <MapPin
                            size={15}
                            style={{ color: "oklch(0.75 0.18 145)" }}
                          />
                        </div>
                        <div>
                          <p
                            className="text-xs font-semibold"
                            style={{ color: "oklch(0.75 0.18 145)" }}
                          >
                            GPS Coordinates Captured
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: "oklch(0.55 0.025 230)" }}
                          >
                            Applicant location at time of application
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div
                          className="rounded-lg p-3"
                          style={{
                            background: "oklch(0.09 0.018 255)",
                            border: "1px solid oklch(0.20 0.030 255)",
                          }}
                        >
                          <p
                            className="text-xs mb-1"
                            style={{ color: "oklch(0.50 0.025 230)" }}
                          >
                            Latitude
                          </p>
                          <p
                            className="text-sm font-mono font-semibold"
                            style={{ color: "oklch(0.90 0.01 230)" }}
                          >
                            {selectedApp.location.latitude.toFixed(6)}°
                          </p>
                        </div>
                        <div
                          className="rounded-lg p-3"
                          style={{
                            background: "oklch(0.09 0.018 255)",
                            border: "1px solid oklch(0.20 0.030 255)",
                          }}
                        >
                          <p
                            className="text-xs mb-1"
                            style={{ color: "oklch(0.50 0.025 230)" }}
                          >
                            Longitude
                          </p>
                          <p
                            className="text-sm font-mono font-semibold"
                            style={{ color: "oklch(0.90 0.01 230)" }}
                          >
                            {selectedApp.location.longitude.toFixed(6)}°
                          </p>
                        </div>
                      </div>

                      {selectedApp.locationLabel && (
                        <div>
                          <p
                            className="text-xs mb-1"
                            style={{ color: "oklch(0.50 0.025 230)" }}
                          >
                            Location Label
                          </p>
                          <p
                            className="text-sm font-mono"
                            style={{ color: "oklch(0.75 0.025 230)" }}
                          >
                            {selectedApp.locationLabel}
                          </p>
                        </div>
                      )}

                      <a
                        href={`https://maps.google.com/?q=${selectedApp.location.latitude},${selectedApp.location.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-opacity hover:opacity-80"
                        style={{
                          background: "oklch(0.75 0.18 145 / 0.15)",
                          border: "1px solid oklch(0.75 0.18 145 / 0.35)",
                          color: "oklch(0.75 0.18 145)",
                        }}
                        data-ocid="admin.link"
                      >
                        <MapPin size={14} />
                        View on Google Maps
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  ) : (
                    <div
                      className="rounded-xl p-4 flex items-center gap-3"
                      style={{
                        background: "oklch(0.12 0.022 255)",
                        border: "1px solid oklch(0.22 0.035 255)",
                      }}
                    >
                      <MapPin
                        size={16}
                        style={{ color: "oklch(0.40 0.020 230)" }}
                      />
                      <p
                        className="text-sm"
                        style={{ color: "oklch(0.50 0.025 230)" }}
                      >
                        Location not provided
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8">
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setSelectedApp(null)}
                  style={{ color: "oklch(0.55 0.025 230)" }}
                  data-ocid="admin.close_button"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
