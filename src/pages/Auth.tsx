import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Stethoscope, ArrowLeft } from "lucide-react";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  role: z.enum(["patient", "doctor", "hospital_admin"]),
});

type Role = "patient" | "doctor" | "hospital_admin";

const roleConfig: Record<Role, { label: string; description: string }> = {
  patient: { label: "Patient", description: "Book consultations with doctors" },
  doctor: { label: "Doctor", description: "Provide care for patients" },
  hospital_admin: { label: "Hospital Admin", description: "Manage your hospital & doctors" },
};

const Auth = () => {
  const [searchParams] = useSearchParams();
  const defaultRole = (searchParams.get("role") as Role) || "patient";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<Role>(defaultRole);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (searchParams.get("role") === "hospital_admin") setRole("hospital_admin");
  }, [searchParams]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const validated = signInSchema.parse({ email, password });
      const { data, error } = await supabase.auth.signInWithPassword({
        email: validated.email,
        password: validated.password,
      });
      if (error) throw error;

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .single();

      toast({ title: "Welcome back!", description: "You've successfully signed in." });

      if (roleData?.role === "doctor") navigate("/doctor-dashboard");
      else if (roleData?.role === "hospital_admin") navigate("/hospital-dashboard");
      else navigate("/patient-dashboard");
    } catch (error: any) {
      toast({
        title: error instanceof z.ZodError ? "Validation Error" : "Sign In Failed",
        description: error instanceof z.ZodError ? error.errors[0].message : error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const validated = signUpSchema.parse({ email, password, fullName, role });
      const { data, error } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          data: { full_name: validated.fullName, role: validated.role },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;

      toast({ title: "Account created!", description: "Welcome to Medweb Care." });

      if (validated.role === "doctor") navigate("/doctor-dashboard");
      else if (validated.role === "hospital_admin") navigate("/hospital-setup");
      else navigate("/patient-dashboard");
    } catch (error: any) {
      toast({
        title: error instanceof z.ZodError ? "Validation Error" : "Sign Up Failed",
        description: error instanceof z.ZodError ? error.errors[0].message : error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="p-4">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
              <Stethoscope className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-hero bg-clip-text text-transparent">Medweb Care</span>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md shadow-medium">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to Medweb Care</CardTitle>
            <CardDescription>Sign in or create your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      data-testid="input-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      data-testid="input-password"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading} data-testid="button-signin">
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      placeholder="Dr. John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      data-testid="input-fullname"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      data-testid="input-signup-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      data-testid="input-signup-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>I am a</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {(Object.keys(roleConfig) as Role[]).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          data-testid={`button-role-${r}`}
                          className={`flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                            role === r
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm">{roleConfig[r].label}</div>
                            <div className="text-xs text-muted-foreground">{roleConfig[r].description}</div>
                          </div>
                          {role === r && (
                            <div className="w-4 h-4 rounded-full bg-primary flex-shrink-0 mt-0.5" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading} data-testid="button-signup">
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
