import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "./ui/sonner";
import { supabase } from "@/integrations/supabase/client";

const feedbackSchema = z.object({
  project: z.string().min(1, { message: "Project name is required." }),
  text: z.string().min(10, { message: "Feedback must be at least 10 characters." }),
  sentiment: z.enum(["positive", "neutral", "negative"], {
    required_error: "Please select a sentiment.",
  }),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

interface AddFeedbackDialogProps {
  clientId: string;
  clientName: string;
  onAdded?: () => Promise<void>; // ✅ Add refresh callback
}

export default function AddFeedbackDialog({ clientId, clientName, onAdded }: AddFeedbackDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      project: "",
      text: "",
      sentiment: "positive",
    },
  });

  const onSubmit = async (data: FeedbackFormValues) => {
    try {
      const payload = {
        client_id: clientId,
        project: data.project,
        text: data.text,
        sentiment: data.sentiment,
      };

      // ✅ Call Supabase Edge Function
      const { data: result, error } = await supabase.functions.invoke("add-feedback", {
        body: payload,
      });

      if (error) throw error;

      toast.success("Feedback added successfully", {
        description: `Feedback for ${clientName} recorded.`,
      });

      setOpen(false);
      form.reset();

      if (onAdded) await onAdded(); // ✅ refresh parent
    } catch (e: any) {
      toast.error("Failed to add feedback", { description: e.message });
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Add Feedback
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Client Feedback</DialogTitle>
            <DialogDescription>
              Record feedback from {clientName}. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Project Field */}
              <FormField
                control={form.control}
                name="project"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <FormControl>
                      <Input placeholder="Website Redesign" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sentiment Field */}
              <FormField
                control={form.control}
                name="sentiment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sentiment</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sentiment" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="positive">Positive</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="negative">Negative</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Feedback Field */}
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feedback</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter client feedback..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Feedback</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
