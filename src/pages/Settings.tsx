
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Save, 
  Settings as SettingsIcon,
  Users, 
  Building, 
  ShieldCheck, 
  Bell, 
  Mail,
  Plus,
  Lock,
  User,
  Trash2
} from "lucide-react";

// Mock data for users
interface RolePermission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

interface Role {
  id: string;
  name: string;
  permissions: {
    projects: RolePermission;
    clients: RolePermission;
    employees: RolePermission;
    finance: RolePermission;
    reports: RolePermission;
    settings: RolePermission;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatar: string;
  lastActive: string;
}

const roles: Role[] = [
  {
    id: "admin",
    name: "Admin",
    permissions: {
      projects: { view: true, create: true, edit: true, delete: true },
      clients: { view: true, create: true, edit: true, delete: true },
      employees: { view: true, create: true, edit: true, delete: true },
      finance: { view: true, create: true, edit: true, delete: true },
      reports: { view: true, create: true, edit: true, delete: true },
      settings: { view: true, create: true, edit: true, delete: true }
    }
  },
  {
    id: "manager",
    name: "Manager",
    permissions: {
      projects: { view: true, create: true, edit: true, delete: false },
      clients: { view: true, create: true, edit: true, delete: false },
      employees: { view: true, create: true, edit: true, delete: false },
      finance: { view: true, create: true, edit: true, delete: false },
      reports: { view: true, create: true, edit: false, delete: false },
      settings: { view: false, create: false, edit: false, delete: false }
    }
  },
  {
    id: "teamlead",
    name: "Team Lead",
    permissions: {
      projects: { view: true, create: true, edit: true, delete: false },
      clients: { view: true, create: false, edit: false, delete: false },
      employees: { view: true, create: false, edit: false, delete: false },
      finance: { view: false, create: false, edit: false, delete: false },
      reports: { view: true, create: false, edit: false, delete: false },
      settings: { view: false, create: false, edit: false, delete: false }
    }
  },
  {
    id: "employee",
    name: "Employee",
    permissions: {
      projects: { view: true, create: false, edit: false, delete: false },
      clients: { view: true, create: false, edit: false, delete: false },
      employees: { view: false, create: false, edit: false, delete: false },
      finance: { view: false, create: false, edit: false, delete: false },
      reports: { view: false, create: false, edit: false, delete: false },
      settings: { view: false, create: false, edit: false, delete: false }
    }
  }
];

const users: User[] = [
  {
    id: "u1",
    name: "Admin User",
    email: "admin@agency.com",
    role: "Admin",
    department: "Management",
    avatar: "AU",
    lastActive: "2025-05-05"
  },
  {
    id: "u2",
    name: "Raj Kumar",
    email: "raj@agency.com",
    role: "Manager",
    department: "Development",
    avatar: "RK",
    lastActive: "2025-05-04"
  },
  {
    id: "u3",
    name: "Neha Patel",
    email: "neha@agency.com",
    role: "Team Lead",
    department: "Maintenance",
    avatar: "NP",
    lastActive: "2025-05-05"
  },
  {
    id: "u4",
    name: "Vikram Reddy",
    email: "vikram@agency.com",
    role: "Team Lead",
    department: "Social",
    avatar: "VR",
    lastActive: "2025-05-03"
  },
  {
    id: "u5",
    name: "Karthik Iyer",
    email: "karthik@agency.com",
    role: "Team Lead",
    department: "Performance",
    avatar: "KI",
    lastActive: "2025-05-04"
  },
];

const Settings = () => {
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<string>("admin");
  
  const handleSaveSettings = (settingType: string) => {
    toast({
      title: "Settings Updated",
      description: `${settingType} settings have been saved successfully.`,
    });
  };

  return (
    <DashboardLayout title="Settings">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="users">Users & Permissions</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        {/* General Settings Tab */}
        <TabsContent value="general" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" /> General Settings
            </h2>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
              <CardDescription>Configure general application settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="app-name">Application Name</Label>
                  <Input id="app-name" defaultValue="Agency Command Centre" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time-zone">Default Time Zone</Label>
                  <Select defaultValue="Asia/Kolkata">
                    <SelectTrigger id="time-zone">
                      <SelectValue placeholder="Select time zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">India (GMT+5:30)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">New York (GMT-4)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT+1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select defaultValue="INR">
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="GBP">British Pound (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-medium">Display Options</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable dark mode for the application
                    </p>
                  </div>
                  <Switch id="dark-mode" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="compact-view">Compact View</Label>
                    <p className="text-sm text-muted-foreground">
                      Show more content with less spacing
                    </p>
                  </div>
                  <Switch id="compact-view" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings("General")} className="ml-auto">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Settings</CardTitle>
              <CardDescription>Configure your dashboard view</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-medium">Widget Visibility</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="financial-widgets">Financial Widgets</Label>
                    <p className="text-sm text-muted-foreground">
                      Show financial metrics on dashboard
                    </p>
                  </div>
                  <Switch id="financial-widgets" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="project-widgets">Project Widgets</Label>
                    <p className="text-sm text-muted-foreground">
                      Show project metrics on dashboard
                    </p>
                  </div>
                  <Switch id="project-widgets" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="client-widgets">Client Widgets</Label>
                    <p className="text-sm text-muted-foreground">
                      Show client metrics on dashboard
                    </p>
                  </div>
                  <Switch id="client-widgets" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="employee-widgets">Employee Widgets</Label>
                    <p className="text-sm text-muted-foreground">
                      Show employee metrics on dashboard
                    </p>
                  </div>
                  <Switch id="employee-widgets" defaultChecked />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="refresh-interval">Auto Refresh Interval</Label>
                <Select defaultValue="15">
                  <SelectTrigger id="refresh-interval">
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Every 5 minutes</SelectItem>
                    <SelectItem value="15">Every 15 minutes</SelectItem>
                    <SelectItem value="30">Every 30 minutes</SelectItem>
                    <SelectItem value="60">Every hour</SelectItem>
                    <SelectItem value="0">Manual refresh only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings("Dashboard")} className="ml-auto">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Users & Permissions Tab */}
        <TabsContent value="users" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" /> Users & Permissions
            </h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>User List</CardTitle>
                <CardDescription>Manage users and their roles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{user.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.role}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{user.department}</Badge>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">Total users: {users.length}</p>
              </CardFooter>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Role Permissions</CardTitle>
                <CardDescription>Define access levels for each role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-4">
                    {roles.map((role) => (
                      <div
                        key={role.id}
                        className={`border rounded-md p-3 cursor-pointer transition-colors ${
                          selectedRole === role.id ? "border-primary bg-primary/5" : ""
                        }`}
                        onClick={() => setSelectedRole(role.id)}
                      >
                        <h3 className="font-semibold">{role.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {Object.entries(role.permissions).filter(([, perms]) => perms.view).length} accessible modules
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Permission Settings</h3>
                    {selectedRole && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="text-xs uppercase bg-muted">
                            <tr>
                              <th className="px-4 py-3 text-left">Module</th>
                              <th className="px-4 py-3 text-center">View</th>
                              <th className="px-4 py-3 text-center">Create</th>
                              <th className="px-4 py-3 text-center">Edit</th>
                              <th className="px-4 py-3 text-center">Delete</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(roles.find(r => r.id === selectedRole)?.permissions || {}).map(([module, perms]) => (
                              <tr key={module} className="border-b">
                                <td className="px-4 py-3 font-medium capitalize">{module}</td>
                                <td className="px-4 py-3 text-center">
                                  <Switch checked={perms.view} />
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <Switch checked={perms.create} />
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <Switch checked={perms.edit} />
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <Switch checked={perms.delete} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">
                  Add New Role
                </Button>
                <Button onClick={() => handleSaveSettings("Permissions")}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Permissions
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Company Tab */}
        <TabsContent value="company" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Building className="h-5 w-5" /> Company Settings
            </h2>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Company Profile</CardTitle>
              <CardDescription>Update your company information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input id="company-name" defaultValue="ABC Digital Agency" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-website">Company Website</Label>
                  <Input id="company-website" defaultValue="https://www.abcagency.com" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company-address">Company Address</Label>
                <Input id="company-address" defaultValue="123 Tech Park, Koramangala, Bangalore" />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company-email">Contact Email</Label>
                  <Input id="company-email" defaultValue="info@abcagency.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-phone">Contact Phone</Label>
                  <Input id="company-phone" defaultValue="+91 98765 43210" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company-gstin">GSTIN</Label>
                <Input id="company-gstin" defaultValue="29ABCDE1234F1Z5" />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="fiscal-year">Fiscal Year Start</Label>
                <Select defaultValue="04-01">
                  <SelectTrigger id="fiscal-year">
                    <SelectValue placeholder="Select fiscal year start" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="04-01">April 1 (India Financial Year)</SelectItem>
                    <SelectItem value="01-01">January 1 (Calendar Year)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings("Company")} className="ml-auto">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Department Settings</CardTitle>
              <CardDescription>Manage departments and their settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["Development", "Maintenance", "Social", "Performance"].map((dept) => (
                  <div key={dept} className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <h3 className="font-medium">{dept}</h3>
                      <p className="text-sm text-muted-foreground">
                        {dept === "Development" ? "Software development and design services" :
                         dept === "Maintenance" ? "Website maintenance and support" :
                         dept === "Social" ? "Social media management and marketing" :
                         "SEO and performance optimization"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full mt-2">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Department
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" /> Security Settings
            </h2>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Password Policy</CardTitle>
              <CardDescription>Configure password requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="min-length">Minimum Password Length</Label>
                  <p className="text-sm text-muted-foreground">
                    Minimum number of characters required
                  </p>
                </div>
                <Select defaultValue="8">
                  <SelectTrigger className="w-[100px]" id="min-length">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="require-uppercase">Require Uppercase</Label>
                  <p className="text-sm text-muted-foreground">
                    Require at least one uppercase letter
                  </p>
                </div>
                <Switch id="require-uppercase" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="require-number">Require Number</Label>
                  <p className="text-sm text-muted-foreground">
                    Require at least one number
                  </p>
                </div>
                <Switch id="require-number" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="require-special">Require Special Character</Label>
                  <p className="text-sm text-muted-foreground">
                    Require at least one special character
                  </p>
                </div>
                <Switch id="require-special" defaultChecked />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="password-expiry">Password Expiration</Label>
                <Select defaultValue="90">
                  <SelectTrigger id="password-expiry">
                    <SelectValue placeholder="Select expiration period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings("Password Policy")} className="ml-auto">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Configure additional security measures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-2fa">Enable 2FA</Label>
                  <p className="text-sm text-muted-foreground">
                    Require two-factor authentication for all users
                  </p>
                </div>
                <Switch id="enable-2fa" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="2fa-method">Default 2FA Method</Label>
                <Select defaultValue="app">
                  <SelectTrigger id="2fa-method">
                    <SelectValue placeholder="Select 2FA method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="app">Authenticator App</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="required-for-admin">Required for Admin Role</Label>
                  <p className="text-sm text-muted-foreground">
                    Always require 2FA for administrator accounts
                  </p>
                </div>
                <Switch id="required-for-admin" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings("2FA")} className="ml-auto">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Session Settings</CardTitle>
              <CardDescription>Configure user session behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout</Label>
                <Select defaultValue="30">
                  <SelectTrigger id="session-timeout">
                    <SelectValue placeholder="Select timeout period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="240">4 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="max-sessions">Maximum Concurrent Sessions</Label>
                  <p className="text-sm text-muted-foreground">
                    Maximum number of active sessions per user
                  </p>
                </div>
                <Select defaultValue="1">
                  <SelectTrigger className="w-[100px]" id="max-sessions">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enforce-ip">IP Restriction</Label>
                  <p className="text-sm text-muted-foreground">
                    Limit access to specific IP ranges
                  </p>
                </div>
                <Switch id="enforce-ip" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings("Session")} className="ml-auto">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5" /> Notification Settings
            </h2>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Configure email notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <h3 className="font-medium">Project Notifications</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="project-created">Project Created</Label>
                    <p className="text-sm text-muted-foreground">
                      When a new project is created
                    </p>
                  </div>
                  <Switch id="project-created" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="project-status">Project Status Change</Label>
                    <p className="text-sm text-muted-foreground">
                      When a project status is updated
                    </p>
                  </div>
                  <Switch id="project-status" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="project-deadline">Project Deadline Approaching</Label>
                    <p className="text-sm text-muted-foreground">
                      When a project deadline is within 3 days
                    </p>
                  </div>
                  <Switch id="project-deadline" defaultChecked />
                </div>
                
                <Separator />
                
                <h3 className="font-medium">Financial Notifications</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="payment-received">Payment Received</Label>
                    <p className="text-sm text-muted-foreground">
                      When a payment is received from a client
                    </p>
                  </div>
                  <Switch id="payment-received" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="payment-overdue">Payment Overdue</Label>
                    <p className="text-sm text-muted-foreground">
                      When a client payment becomes overdue
                    </p>
                  </div>
                  <Switch id="payment-overdue" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="invoice-sent">Invoice Sent</Label>
                    <p className="text-sm text-muted-foreground">
                      When an invoice is sent to a client
                    </p>
                  </div>
                  <Switch id="invoice-sent" defaultChecked />
                </div>
                
                <Separator />
                
                <h3 className="font-medium">Client Notifications</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="client-feedback">Client Feedback</Label>
                    <p className="text-sm text-muted-foreground">
                      When a client provides feedback
                    </p>
                  </div>
                  <Switch id="client-feedback" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="client-visit">Client Visit Scheduled</Label>
                    <p className="text-sm text-muted-foreground">
                      When a client visit is scheduled
                    </p>
                  </div>
                  <Switch id="client-visit" defaultChecked />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings("Email Notifications")} className="ml-auto">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>System Notifications</CardTitle>
              <CardDescription>Configure in-app notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-notifications">Enable In-App Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Show notifications within the application
                  </p>
                </div>
                <Switch id="enable-notifications" defaultChecked />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notification-display">Notification Display Duration</Label>
                <Select defaultValue="5">
                  <SelectTrigger id="notification-display">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 seconds</SelectItem>
                    <SelectItem value="5">5 seconds</SelectItem>
                    <SelectItem value="10">10 seconds</SelectItem>
                    <SelectItem value="0">Until dismissed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sound-notifications">Sound Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Play sound when receiving notifications
                  </p>
                </div>
                <Switch id="sound-notifications" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings("System Notifications")} className="ml-auto">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Report Scheduling</CardTitle>
              <CardDescription>Configure automated report delivery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="daily-summary">Daily Summary Report</Label>
                    <p className="text-sm text-muted-foreground">
                      Daily summary of key metrics
                    </p>
                  </div>
                  <Switch id="daily-summary" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="weekly-summary">Weekly Summary Report</Label>
                    <p className="text-sm text-muted-foreground">
                      Weekly summary of project and financial data
                    </p>
                  </div>
                  <Switch id="weekly-summary" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="monthly-summary">Monthly Summary Report</Label>
                    <p className="text-sm text-muted-foreground">
                      Monthly detailed financial and performance data
                    </p>
                  </div>
                  <Switch id="monthly-summary" defaultChecked />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="report-recipients">Report Recipients</Label>
                <Input 
                  id="report-recipients" 
                  placeholder="email@example.com, another@example.com" 
                  defaultValue="admin@agency.com, manager@agency.com"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Comma-separated list of email addresses
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings("Report Scheduling")} className="ml-auto">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Settings;
