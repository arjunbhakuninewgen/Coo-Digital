import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { MapPin, MessageSquare, FileText, Mail, Phone, Calendar, Clock, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AddFeedbackDialog from "@/components/AddFeedbackDialog";
import ScheduleVisitDialog from "@/components/ScheduleVisitDialog";
import AddOpportunityDialog from "@/components/AddOpportunityDialog";

const ClientProfile = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [client, setClient] = useState<any | null>(null);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("get-clients-dashboard");
      if (error) throw error;
      if (data) {
        const found = data.clients.find((c: any) => c.id === clientId);
        setClient(found || null);
        setFeedback(data.feedback.filter((f: any) => f.client_id === clientId));
        setVisits(data.visits.filter((v: any) => v.client_id === clientId));
        setOpportunities(data.opportunities.filter((o: any) => o.client_id === clientId));
      }
    } catch (e: any) {
      toast({ title: "Error fetching client", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, [clientId]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  if (loading) {
    return (
      <DashboardLayout title="Loading...">
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-muted-foreground">Loading client details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!client) {
    return (
      <DashboardLayout title="Client Not Found">
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <h2 className="text-xl font-semibold mb-4">Client not found</h2>
          <Button onClick={() => navigate("/clients")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Clients
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`${client.name} Profile`}>
      <div className="flex items-center mb-6">
        <Button variant="outline" className="mr-4" onClick={() => navigate("/clients")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Clients
        </Button>
        <h1 className="text-2xl font-bold">{client.name}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Client Overview */}
        <Card className="h-fit">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-semibold">
                  {client.logo_initials || client.name.charAt(0)}
                </div>
                <div>
                  <CardTitle>{client.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{client.contact_person}</p>
                </div>
              </div>
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
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{client.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{client.phone}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <span>{client.address}</span>
              </div>
            </div>

            <Separator />

            <h4 className="font-semibold">Financial Summary</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Total Billed</p>
                <p className="font-medium">{formatCurrency(client.total_billed || 0)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="font-medium">{formatCurrency(client.total_paid || 0)}</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Payment Status</span>
                <span>{client.total_billed ? Math.round((client.total_paid / client.total_billed) * 100) : 0}%</span>
              </div>
              <Progress value={client.total_billed ? (client.total_paid / client.total_billed) * 100 : 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Right Columns: Tabs for Interactions */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="feedback" className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="feedback" className="flex-1">Feedback</TabsTrigger>
              <TabsTrigger value="visits" className="flex-1">Visits</TabsTrigger>
              <TabsTrigger value="opportunities" className="flex-1">Opportunities</TabsTrigger>
            </TabsList>

            {/* Feedback Tab */}
            <TabsContent value="feedback" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Client Feedback</h3>
                <AddFeedbackDialog clientId={client.id} clientName={client.name} onAdded={fetchClientData} />
              </div>

              {feedback.length > 0 ? (
                feedback.map((fb) => (
                  <Card key={fb.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between">
                        <p className="font-medium">{fb.project_name || "General"}</p>
                        <Badge
                          variant="outline"
                          className={
                            fb.sentiment === "positive"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : fb.sentiment === "negative"
                              ? "bg-red-100 text-red-800 border-red-200"
                              : "bg-blue-100 text-blue-800 border-blue-200"
                          }
                        >
                          {fb.sentiment}
                        </Badge>
                      </div>
                      <p className="text-sm mt-2">{fb.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(fb.date).toLocaleDateString("en-IN")}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card><CardContent className="p-6 text-center"><MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" /><p>No feedback records found.</p></CardContent></Card>
              )}
            </TabsContent>

            {/* Visits Tab */}
            <TabsContent value="visits" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Visit Schedule</h3>
                <ScheduleVisitDialog clientId={client.id} clientName={client.name} onAdded={fetchClientData} />
              </div>

              {visits.length > 0 ? (
                visits.map((v) => (
                  <Card key={v.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{v.purpose}</p>
                          <p className="text-sm text-muted-foreground">{new Date(v.date).toLocaleDateString("en-IN")}</p>
                        </div>
                        <Badge variant="outline">
                          {new Date(v.date) > new Date() ? "Upcoming" : "Completed"}
                        </Badge>
                      </div>
                      {v.notes && <p className="text-sm mt-2">{v.notes}</p>}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card><CardContent className="p-6 text-center"><MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" /><p>No visits found.</p></CardContent></Card>
              )}
            </TabsContent>

            {/* Opportunities Tab */}
            <TabsContent value="opportunities" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Opportunities</h3>
                <AddOpportunityDialog clientId={client.id} clientName={client.name} onAdded={fetchClientData} />
              </div>

              {opportunities.length > 0 ? (
                opportunities.map((o) => (
                  <Card key={o.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{o.title}</h4>
                        <div className="text-sm font-medium">{(o.estimated_value / 100000).toFixed(1)}L</div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{o.description}</p>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm">
                          <span>Probability</span>
                          <span>{o.probability}%</span>
                        </div>
                        <Progress
                          value={o.probability}
                          className={cn(
                            "h-2",
                            o.probability >= 70 ? "bg-green-500" :
                            o.probability >= 40 ? "bg-amber-500" :
                            "bg-red-500"
                          )}
                        />
                      </div>
                      <div className="mt-2 flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{o.next_steps}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card><CardContent className="p-6 text-center"><FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" /><p>No opportunities found.</p></CardContent></Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientProfile;
