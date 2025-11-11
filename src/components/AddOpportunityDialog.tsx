
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Slider } from "./ui/slider";
import { toast } from "./ui/sonner";

const opportunitySchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  estimatedValue: z.coerce.number().min(1000, { message: "Estimated value must be at least ₹1,000." }),
  probability: z.coerce.number().min(1, { message: "Probability must be at least 1%." }).max(100, { message: "Probability cannot exceed 100%." }),
  nextSteps: z.string().min(5, { message: "Next steps must be at least 5 characters." }),
});

type OpportunityFormValues = z.infer<typeof opportunitySchema>;

interface AddOpportunityDialogProps {
  clientId: string;
  clientName: string;
}

export default function AddOpportunityDialog({ clientId, clientName }: AddOpportunityDialogProps) {
  const [open, setOpen] = useState(false);
  
  const form = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      title: "",
      description: "",
      estimatedValue: 100000,
      probability: 50,
      nextSteps: "",
    },
  });

  const watchedProbability = form.watch("probability");

  function onSubmit(data: OpportunityFormValues) {
    // In a real app, this would add the opportunity to the database
    console.log("New opportunity data:", { ...data, clientId });
    
    toast.success("Opportunity added successfully", {
      description: `New opportunity "${data.title}" for ${clientName} has been recorded.`,
    });
    
    setOpen(false);
    form.reset();
  }

  // Format currency as Indian Rupees
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Add Opportunity
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Business Opportunity</DialogTitle>
            <DialogDescription>
              Record a new business opportunity with {clientName}.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Website Redesign" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of the opportunity..." 
                        className="min-h-[80px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="estimatedValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Value</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="100000" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(field.value)}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="probability"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Success Probability</FormLabel>
                      <span className="text-sm font-medium">{watchedProbability}%</span>
                    </div>
                    <FormControl>
                      <Slider
                        min={1}
                        max={100}
                        step={1}
                        defaultValue={[field.value]}
                        onValueChange={(values) => field.onChange(values[0])}
                        className="py-4"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="nextSteps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Steps</FormLabel>
                    <FormControl>
                      <Input placeholder="Send proposal by May 15" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Opportunity</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
