'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Shield,
  Database,
  Server,
  Key,
  Users,
  Tags,
  FileText,
  CheckCircle2,
  ExternalLink,
  Settings as SettingsIcon,
  Globe,
  Sliders,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">System & Platform Settings</h1>
        <p className="text-muted-foreground text-sm">
          Platform configuration, database connectivity status, and system architecture parameters.
        </p>
      </div>

      {/* System Status Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" /> Connected
            </div>
            <p className="text-xs text-muted-foreground mt-1">Neon Serverless PostgreSQL</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Authentication</CardTitle>
            <Key className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">NextAuth v5</div>
            <p className="text-xs text-muted-foreground mt-1">JWT + Role-Based Guard</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">App Framework</CardTitle>
            <Server className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">Next.js 15</div>
            <p className="text-xs text-muted-foreground mt-1">React 19 App Router</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Environment</CardTitle>
            <Globe className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">Production-Ready</div>
            <p className="text-xs text-muted-foreground mt-1">Vercel Deployment Compatible</p>
          </CardContent>
        </Card>
      </div>

      {/* Administration Quick Jumps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-primary" />
            Administrative Controls
          </CardTitle>
          <CardDescription>
            Quick access to core platform maintenance, taxonomies, and user security.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <h4 className="font-semibold text-sm">User & Role Management</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Promote organizers, assign Super Admin privileges, and manage user accounts.
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/users">Manage Users</Link>
              </Button>
            </div>
          </div>

          <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Tags className="h-4 w-4 text-purple-500" />
                  <h4 className="font-semibold text-sm">Category Management</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Create and manage global event taxonomies and classification categories.
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/categories">Categories</Link>
              </Button>
            </div>
          </div>

          <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-500" />
                  <h4 className="font-semibold text-sm">Security & Audit Logs</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Inspect recorded administrative events, data modifications, and check-in history.
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/audit-logs">Audit Logs</Link>
              </Button>
            </div>
          </div>

          <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <SettingsIcon className="h-4 w-4 text-emerald-500" />
                  <h4 className="font-semibold text-sm">Personal Profile</h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Update your contact details, institution, and account password.
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/profile">My Profile</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Defaults & Policies */}
      <Card>
        <CardHeader>
          <CardTitle>System Configuration Defaults</CardTitle>
          <CardDescription>Default parameters used throughout the ticketing and event engine.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="font-medium">Currency Standard</p>
              <p className="text-xs text-muted-foreground">Default currency used in ticketing and transactions</p>
            </div>
            <Badge variant="secondary" className="font-mono">IDR (Rp)</Badge>
          </div>

          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="font-medium">QR Token Cryptography</p>
              <p className="text-xs text-muted-foreground">Cryptographic token generation algorithm for QR tickets</p>
            </div>
            <Badge variant="secondary" className="font-mono">UUID v4 / Base64</Badge>
          </div>

          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="font-medium">Default Timezone</p>
              <p className="text-xs text-muted-foreground">Server scheduling and check-in timeline reference</p>
            </div>
            <Badge variant="secondary" className="font-mono">Asia/Jakarta (UTC+7)</Badge>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Export Formats</p>
              <p className="text-xs text-muted-foreground">Supported formats for reporting and participant lists</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">XLSX (Excel)</Badge>
              <Badge variant="outline">CSV</Badge>
              <Badge variant="outline">PDF</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
