
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { handlePasswordChange } from "@/utils/authUtils";
import { validatePasswords } from "@/utils/passwordValidation";
import { PasswordInput } from "./PasswordInput";

interface FirstTimeLoginFormProps {
  email: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const FirstTimeLoginForm: React.FC<FirstTimeLoginFormProps> = ({
  email,
  onSuccess,
  onCancel
}) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validatePasswords(newPassword, confirmPassword);
    if (!validation.isValid) {
      toast({
        title: "Error",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Starting password change for:", email);
      
      const result = await handlePasswordChange(email, newPassword);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Password set successfully. You are now logged in.",
        });
        onSuccess();
      }
    } catch (error) {
      console.error("Password change error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to set password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Agency Command Centre</h1>
          <p className="text-muted-foreground mt-2">Set your new password</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>First Time Login</CardTitle>
            <CardDescription>
              Please set a new password for your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-10"
                    value={email}
                    disabled
                  />
                </div>
              </div>

              <PasswordInput
                id="newPassword"
                label="New Password"
                placeholder="Enter new password (min 6 characters)"
                value={newPassword}
                onChange={setNewPassword}
                disabled={isSubmitting}
                required
              />

              <PasswordInput
                id="confirmPassword"
                label="Confirm Password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                disabled={isSubmitting}
                required
              />
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                <Lock className="mr-2 h-4 w-4" />
                {isSubmitting ? "Setting Password..." : "Set Password"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};
