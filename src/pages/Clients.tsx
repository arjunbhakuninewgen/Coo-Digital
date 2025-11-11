import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Search, MapPin, MessageSquare, FileText, Mail, Phone, Calendar, Clock, ArrowRight, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AddClientDialog from "@/components/AddClientDialog";
import AddFeedbackDialog from "@/components/AddFeedbackDialog";
import ScheduleVisitDialog from "@/components/ScheduleVisitDialog";
import AddOpportunityDialog from "@/components/AddOpportunityDialog";

const Clients = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchClientsData = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("get-clients-dashboard");
    if (error) {
      toast({ title: "Error loading clients", description: error.message, variant: "destructive" });
    } else if (data) {
      setClients(data.clients || []);
      setFeedback(data.feedback || []);
      setVisits(data.visits || []);
      setOpportunities(data.opportunities || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClientsData();
  }, []);

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.contact_person || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getClientFeedback = (id: string) => feedback.filter((f) => f.client_id === id);
  const getClientVisits = (id: string) => visits.filter((v) => v.client_id === id);
  const getClientOpportunities = (id: string) => opportunities.filter((o) => o.client_id === id);

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  const handleViewFullProfile = () => {
    if (selectedClient) navigate(`/client/${selectedClient.id}`);
  };

  return (
    <DashboardLayout title="Clients">
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Client List */}
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
            <AddClientDialog onClientAdded={fetchClientsData} />
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground">Loading clients...</p>
          ) : (
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
                          {client.logo_initials || client.name.charAt(0)}
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
                              {client.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{client.contact_person}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-6">No clients found</p>
              )}
            </div>
          )}
        </div>

        {/* Client Details */}
        {selectedClient ? (
          <>
            <Card className="h-fit">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-semibold">
                      {selectedClient.logo_initials || selectedClient.name.charAt(0)}
                    </div>
                    <div>
                      <CardTitle>{selectedClient.name}</CardTitle>
                      <CardDescription>{selectedClient.contact_person}</CardDescription>
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
                    {selectedClient.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{selectedClient.email}</div>
                  <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{selectedClient.phone}</div>
                  <div className="flex items-start gap-2"><MapPin className="h-4 w-4 text-muted-foreground mt-1" />{selectedClient.address}</div>
                </div>
                <Separator />
                <h4 className="font-semibold">Financial Summary</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Billed</p>
                    <p className="font-medium">{formatCurrency(selectedClient.total_billed || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Paid</p>
                    <p className="font-medium">{formatCurrency(selectedClient.total_paid || 0)}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleViewFullProfile}>
                  View Full Profile
                </Button>
              </CardFooter>
            </Card>

            {/* Tabs for Feedback/Visits/Opportunities */}
            <div className="space-y-4">
              <Tabs defaultValue="feedback" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="feedback" className="flex-1">Feedback</TabsTrigger>
                  <TabsTrigger value="visits" className="flex-1">Visits</TabsTrigger>
                  <TabsTrigger value="opportunities" className="flex-1">Opportunities</TabsTrigger>
                </TabsList>

                <TabsContent value="feedback" className="space-y-3">
                  <AddFeedbackDialog clientId={selectedClient.id} clientName={selectedClient.name} onAdded={fetchClientsData} />
                  {getClientFeedback(selectedClient.id).map((fb) => (
                    <Card key={fb.id}><CardContent className="p-4">{fb.text}</CardContent></Card>
                  ))}
                </TabsContent>

                <TabsContent value="visits" className="space-y-3">
                  <ScheduleVisitDialog clientId={selectedClient.id} clientName={selectedClient.name} onAdded={fetchClientsData} />
                  {getClientVisits(selectedClient.id).map((v) => (
                    <Card key={v.id}><CardContent className="p-4">{v.purpose}</CardContent></Card>
                  ))}
                </TabsContent>

                <TabsContent value="opportunities" className="space-y-3">
                  <AddOpportunityDialog clientId={selectedClient.id} clientName={selectedClient.name} onAdded={fetchClientsData} />
                  {getClientOpportunities(selectedClient.id).map((o) => (
                    <Card key={o.id}><CardContent className="p-4">{o.title}</CardContent></Card>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : (
          <Card className="col-span-2 flex items-center justify-center h-[50vh]">
            <div className="text-center">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p>Select a client to view details.</p>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Clients;
