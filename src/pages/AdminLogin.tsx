import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getUserRole, getRoleRedirect } from "@/lib/auth";
import { Shield, Eye, EyeOff, Stethoscope } from "lucide-react";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const validated = schema.parse({ email, password });
      const { data, error } = await supabase.auth.signInWithPassword({
        email: validated.email,
        password: validated.password,
      });
      if (error) throw error;

      const role = await getUserRole(data.user);
      if (role !== "admin") {
        await supabase.auth.signOut();
        throw new Error("This login is for platform administrators only.");
      }

      toast({ title: "Welcome, Admin" });
      navigate("/admin");
    } catch (error: any) {
      toast({
        title: error instanceof z.ZodError ? "Validation Error" : "Access Denied",
        description: error instanceof z.ZodError ? error.errors[0].message : error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border/50 shadow-lg">
        <CardHeader className="text-center space-y-3">
          <div className="w-14 h-14 bg-gradient-hero rounded-2xl flex items-center justify-center mx-auto">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">Platform Admin</CardTitle>
            <CardDescription>Medweb Care administration portal</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-email">Admin Email</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@medwebcare.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? "Signing in..." : "Sign In as Admin"}
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Not an admin?{" "}
            <a href="/auth" className="text-primary hover:underline">Go to regular login</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
