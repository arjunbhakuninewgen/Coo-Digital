import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  MapPin, 
  MessageSquare, 
  FileText, 
  Mail, 
  Phone, 
  Calendar, 
  Clock,
  ArrowRight,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import AddClientDialog from "@/components/AddClientDialog";
import AddFeedbackDialog from "@/components/AddFeedbackDialog";
import ScheduleVisitDialog from "@/components/ScheduleVisitDialog";
import AddOpportunityDialog from "@/components/AddOpportunityDialog";

// Client types
interface ClientFeedback {
  id: string;
  clientId: string;
  date: string;
  text: string;
  sentiment: "positive" | "neutral" | "negative";
  project: string;
}

interface ClientVisit {
  id: string;
  clientId: string;
  date: string;
  purpose: string;
  attendees: string[];
  notes?: string;
}

interface ClientOpportunity {
  id: string;
  clientId: string;
  title: string;
  description: string;
  estimatedValue: number;
  probability: number;
  nextSteps: string;
}

interface Client {
  id: string;
  name: string;
  logoInitials: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  activeProjects: number;
  totalBilled: number;
  totalPaid: number;
  overdue: number;
  status: "active" | "inactive" | "prospect";
}

// Mock data
const clientsData: Client[] = [
  {
    id: "c1",
    name: "ABC Retail",
    logoInitials: "AR",
    email: "contact@abcretail.com",
    phone: "+91 9876543210",
    address: "123 Main Street, Mumbai, Maharashtra",
    contactPerson: "Rajiv Mehta",
    activeProjects: 2,
    totalBilled: 850000,
    totalPaid: 400000,
    overdue: 0,
    status: "active"
  },
  {
    id: "c2",
    name: "XYZ Corp",
    logoInitials: "XC",
    email: "info@xyzcorp.com",
    phone: "+91 8765432109",
    address: "456 Tech Park, Bangalore, Karnataka",
    contactPerson: "Priya Sharma",
    activeProjects: 1,
    totalBilled: 225000,
    totalPaid: 225000,
    overdue: 0,
    status: "active"
  },
  {
    id: "c3",
    name: "LMN Brands",
    logoInitials: "LB",
    email: "contact@lmnbrands.com",
    phone: "+91 7654321098",
    address: "789 Fashion Street, Delhi, NCR",
    contactPerson: "Kiran Joshi",
    activeProjects: 1,
    totalBilled: 320000,
    totalPaid: 0,
    overdue: 0,
    status: "active"
  },
  {
    id: "c4",
    name: "PQR Solutions",
    logoInitials: "PS",
    email: "hello@pqrsolutions.com",
    phone: "+91 6543210987",
    address: "101 Business Hub, Chennai, Tamil Nadu",
    contactPerson: "Vikram Reddy",
    activeProjects: 1,
    totalBilled: 175000,
    totalPaid: 140000,
    overdue: 35000,
    status: "active"
  },
  {
    id: "c5",
    name: "Global Tech",
    logoInitials: "GT",
    email: "info@globaltech.com",
    phone: "+91 5432109876",
    address: "202 Innovation Center, Hyderabad, Telangana",
    contactPerson: "Neha Patel",
    activeProjects: 1,
    totalBilled: 1250000,
    totalPaid: 625000,
    overdue: 625000,
    status: "active"
  },
  {
    id: "c6",
    name: "Future Innovations",
    logoInitials: "FI",
    email: "contact@futureinnovations.com",
    phone: "+91 4321098765",
    address: "303 Next Gen Plaza, Pune, Maharashtra",
    contactPerson: "Amit Verma",
    activeProjects: 0,
    totalBilled: 0,
    totalPaid: 0,
    overdue: 0,
    status: "prospect"
  }
];

const feedbackData: ClientFeedback[] = [
  {
    id: "f1",
    clientId: "c1",
    date: "2025-04-28",
    text: "The website redesign is coming along nicely. Very impressed with the new UI elements.",
    sentiment: "positive",
    project: "E-commerce Website Redesign"
  },
  {
    id: "f2",
    clientId: "c2",
    date: "2025-04-25",
    text: "Maintenance was completed on time. No issues to report.",
    sentiment: "positive",
    project: "Monthly Website Maintenance"
  },
  {
    id: "f3",
    clientId: "c3",
    date: "2025-04-20",
    text: "The social campaign concepts need more work. Not quite hitting our brand voice.",
    sentiment: "negative",
    project: "Social Media Campaign"
  },
  {
    id: "f4",
    clientId: "c4",
    date: "2025-04-15",
    text: "SEO results are showing improvement, but slower than expected.",
    sentiment: "neutral",
    project: "SEO Optimization"
  },
  {
    id: "f5",
    clientId: "c5",
    date: "2025-04-10",
    text: "App development is delayed. Need to discuss timeline adjustments.",
    sentiment: "negative",
    project: "Mobile App Development"
  }
];

const visitsData: ClientVisit[] = [
  {
    id: "v1",
    clientId: "c1",
    date: "2025-05-10",
    purpose: "Project Review Meeting",
    attendees: ["Raj Kumar", "Priya Singh", "Rajiv Mehta"],
    notes: "Discuss progress on e-commerce redesign and gather feedback"
  },
  {
    id: "v2",
    clientId: "c3",
    date: "2025-05-15",
    purpose: "Campaign Strategy Meeting",
    attendees: ["Vikram Reddy", "Sneha Jain", "Kiran Joshi"],
    notes: "Address concerns about social campaign direction"
  },
  {
    id: "v3",
    clientId: "c5",
    date: "2025-05-05",
    purpose: "Emergency Meeting",
    attendees: ["Raj Kumar", "Deepak Mehta", "Neha Patel"],
    notes: "Discuss app development delays and revised timeline"
  }
];

const opportunitiesData: ClientOpportunity[] = [
  {
    id: "o1",
    clientId: "c1",
    title: "E-commerce Mobile App",
    description: "Development of mobile app to complement the redesigned website",
    estimatedValue: 1200000,
    probability: 70,
    nextSteps: "Send proposal by May 15"
  },
  {
    id: "o2",
    clientId: "c2",
    title: "SEO Services",
    description: "Ongoing SEO optimization and content strategy",
    estimatedValue: 240000,
    probability: 85,
    nextSteps: "Follow-up meeting scheduled for May 12"
  },
  {
    id: "o3",
    clientId: "c5",
    title: "Website Redesign",
    description: "Complete overhaul of corporate website",
    estimatedValue: 950000,
    probability: 50,
    nextSteps: "Prepare competitive analysis by May 20"
  },
  {
    id: "o4",
    clientId: "c6",
    title: "Digital Transformation Consultation",
    description: "Strategic consultation for digital transformation initiatives",
    estimatedValue: 1800000,
    probability: 30,
    nextSteps: "Initial presentation scheduled for May 18"
  }
];

const Clients = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const navigate = useNavigate();
  
  // Filter clients based on search
  const filteredClients = clientsData.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    client.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Format currency as Indian Rupees
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Get related data for selected client
  const getClientFeedback = (clientId: string) => {
    return feedbackData.filter(feedback => feedback.clientId === clientId);
  };
  
  const getClientVisits = (clientId: string) => {
    return visitsData.filter(visit => visit.clientId === clientId);
  };
  
  const getClientOpportunities = (clientId: string) => {
    return opportunitiesData.filter(opp => opp.clientId === clientId);
  };

  // Handle view full profile
  const handleViewFullProfile = () => {
    if (selectedClient) {
      navigate(`/client/${selectedClient.id}`);
    }
  };

  return (
    <DashboardLayout title="Clients">
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Client List - First Column */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Client List</h3>
            <AddClientDialog />
          </div>
          
          <div className="space-y-2 max-h-[75vh] overflow-y-auto pr-2">
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <Card
                  key={client.id}
                  className={cn(
                    "cursor-pointer hover:border-primary transition-colors",
                    selectedClient?.id === client.id && "border-primary bg-primary/5"
                  )}
                  onClick={() => setSelectedClient(client)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                        {client.logoInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium truncate">{client.name}</h4>
                          <Badge
                            variant={client.status === "active" ? "default" : "outline"}
                            className={
                              client.status === "active" 
                                ? "bg-green-100 text-green-800 border-green-200" 
                                : "bg-blue-100 text-blue-800 border-blue-200"
                            }
                          >
                            {client.status === "active" ? "Active" : "Prospect"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {client.contactPerson}
                        </p>
                        {client.overdue > 0 && (
                          <p className="text-sm text-red-500">
                            Overdue: {formatCurrency(client.overdue)}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No clients found</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Client Details - Second & Third Column */}
        {selectedClient ? (
          <>
            {/* Client Profile - Second Column */}
            <Card className="h-fit">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-semibold">
                      {selectedClient.logoInitials}
                    </div>
                    <div>
                      <CardTitle>{selectedClient.name}</CardTitle>
                      <CardDescription>{selectedClient.contactPerson}</CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant={selectedClient.status === "active" ? "default" : "outline"}
                    className={
                      selectedClient.status === "active" 
                        ? "bg-green-100 text-green-800 border-green-200" 
                        : "bg-blue-100 text-blue-800 border-blue-200"
                    }
                  >
                    {selectedClient.status === "active" ? "Active" : "Prospect"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedClient.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedClient.phone}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <span>{selectedClient.address}</span>
                  </div>
                </div>
                
                <Separator />
                
                {selectedClient.status === "active" && (
                  <>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Financial Summary</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Billed</p>
                          <p className="font-medium">{formatCurrency(selectedClient.totalBilled)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Paid</p>
                          <p className="font-medium">{formatCurrency(selectedClient.totalPaid)}</p>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Payment Status</span>
                          <span>{Math.round((selectedClient.totalPaid / selectedClient.totalBilled) * 100)}%</span>
                        </div>
                        <Progress value={(selectedClient.totalPaid / selectedClient.totalBilled) * 100} className="h-2" />
                      </div>
                      {selectedClient.overdue > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-red-500 font-semibold">
                            Overdue: {formatCurrency(selectedClient.overdue)}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-semibold">Active Projects</h4>
                      <p className="text-2xl font-bold mt-1">
                        {selectedClient.activeProjects} <span className="text-sm font-normal text-muted-foreground">projects</span>
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleViewFullProfile}>
                  View Full Profile
                </Button>
              </CardFooter>
            </Card>
            
            {/* Client Interactions - Third Column */}
            <div className="space-y-4">
              <Tabs defaultValue="feedback" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="feedback" className="flex-1">Feedback</TabsTrigger>
                  <TabsTrigger value="visits" className="flex-1">Visits</TabsTrigger>
                  <TabsTrigger value="opportunities" className="flex-1">Opportunities</TabsTrigger>
                </TabsList>
                
                <TabsContent value="feedback" className="mt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Recent Feedback</h3>
                    <AddFeedbackDialog 
                      clientId={selectedClient.id} 
                      clientName={selectedClient.name} 
                    />
                  </div>
                  
                  {getClientFeedback(selectedClient.id).length > 0 ? (
                    <div className="space-y-3">
                      {getClientFeedback(selectedClient.id).map((feedback) => (
                        <Card key={feedback.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-medium">{feedback.project}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(feedback.date).toLocaleDateString('en-IN')}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className={
                                  feedback.sentiment === "positive"
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : feedback.sentiment === "negative"
                                    ? "bg-red-100 text-red-800 border-red-200"
                                    : "bg-blue-100 text-blue-800 border-blue-200"
                                }
                              >
                                {feedback.sentiment.charAt(0).toUpperCase() + feedback.sentiment.slice(1)}
                              </Badge>
                            </div>
                            <p className="mt-2 text-sm">"{feedback.text}"</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No feedback records found</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="visits" className="mt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Client Visits</h3>
                    <ScheduleVisitDialog 
                      clientId={selectedClient.id} 
                      clientName={selectedClient.name} 
                    />
                  </div>
                  
                  {getClientVisits(selectedClient.id).length > 0 ? (
                    <div className="space-y-3">
                      {getClientVisits(selectedClient.id).map((visit) => (
                        <Card key={visit.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-primary" />
                                  <p className="font-medium">{new Date(visit.date).toLocaleDateString('en-IN')}</p>
                                </div>
                                <p className="text-sm font-medium mt-1">{visit.purpose}</p>
                              </div>
                              <Badge variant="outline">
                                {new Date(visit.date) > new Date() ? "Upcoming" : "Completed"}
                              </Badge>
                            </div>
                            
                            <div className="mt-2">
                              <p className="text-sm text-muted-foreground">Attendees:</p>
                              <div className="flex mt-1">
                                {visit.attendees.map((attendee, i) => (
                                  <div 
                                    key={i} 
                                    className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs -ml-1 first:ml-0 border border-background"
                                  >
                                    {attendee.charAt(0)}
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {visit.notes && (
                              <p className="mt-2 text-sm text-muted-foreground">
                                {visit.notes}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <MapPin className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No visits scheduled</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="opportunities" className="mt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Business Opportunities</h3>
                    <AddOpportunityDialog 
                      clientId={selectedClient.id} 
                      clientName={selectedClient.name} 
                    />
                  </div>
                  
                  {getClientOpportunities(selectedClient.id).length > 0 ? (
                    <div className="space-y-3">
                      {getClientOpportunities(selectedClient.id).map((opportunity) => (
                        <Card key={opportunity.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between">
                              <h4 className="font-medium">{opportunity.title}</h4>
                              <div className="text-sm font-medium rupee-symbol">
                                {(opportunity.estimatedValue / 100000).toFixed(1)}L
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mt-1">
                              {opportunity.description}
                            </p>
                            
                            <div className="mt-2">
                              <div className="flex justify-between text-sm">
                                <span>Probability</span>
                                <span>{opportunity.probability}%</span>
                              </div>
                              <Progress 
                                value={opportunity.probability} 
                                className={cn(
                                  "h-2",
                                  opportunity.probability >= 70 ? "bg-green-500" :
                                  opportunity.probability >= 40 ? "bg-amber-500" :
                                  "bg-red-500"
                                )}
                              />
                            </div>
                            
                            <div className="mt-3 flex justify-between items-center">
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{opportunity.nextSteps}</span>
                              </div>
                              <Button variant="ghost" size="sm" className="h-8 gap-1">
                                Details <ArrowRight className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No opportunities recorded</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : (
          <Card className="col-span-2 flex items-center justify-center h-[50vh]">
            <div className="text-center p-6">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">Select a Client</h3>
              <p className="text-muted-foreground">
                Click on a client from the list to view their details, feedback, visits, and opportunities.
              </p>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Clients;
