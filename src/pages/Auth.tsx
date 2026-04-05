import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Stethoscope, Building2, User, UserCog, Shield, CheckCircle, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { getUserRole, getRoleRedirect, ensureProfile, type AppRole } from "@/lib/auth";

const signInSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const signUpSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().trim().min(2, "Name must be at least 2 characters"),
  role: z.enum(["patient", "doctor", "hospital_admin", "admin"]),
});

type SignupRole = "patient" | "doctor" | "hospital_admin" | "admin";

const roles: { id: SignupRole; label: string; desc: string; icon: any }[] = [
  { id: "patient", label: "Patient", desc: "Book consultations with hospital doctors", icon: User },
  { id: "doctor", label: "Doctor", desc: "Provide telemedicine care for patients", icon: Stethoscope },
  { id: "hospital_admin", label: "Hospital Admin", desc: "Register & manage your hospital", icon: Building2 },
];

const features = [
  "Real-time text consultations",
  "Image & voice note sharing",
  "HD voice & video calls",
  "Secure patient records",
];

const Auth = () => {
  const [searchParams] = useSearchParams();
  const isSignUpDefault = searchParams.get("tab") === "signup";
  const defaultRole = (searchParams.get("role") as SignupRole) || "patient";

  const [tab, setTab] = useState<"signin" | "signup">(isSignUpDefault ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<SignupRole>(defaultRole);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const r = searchParams.get("role") as SignupRole;
    if (r && roles.find((x) => x.id === r)) setRole(r);
    if (searchParams.get("tab") === "signup") setTab("signup");
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
      if (error) {
        if (error.message?.includes("Email not confirmed")) {
          toast({
            title: "Email not verified",
            description: "Please check your inbox and verify your email before signing in.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        throw error;
      }

      const detectedRole = await getUserRole(data.user);
      toast({ title: "Welcome back!", description: "Signed in successfully." });
      navigate(getRoleRedirect(detectedRole));
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
          data: {
            full_name: validated.fullName,
            role: validated.role,
          },
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error("Sign up failed. Please try again.");

      // Check if email confirmation is required
      if (data.session) {
        // Auto-confirmed (e.g. during development) — redirect immediately
        await ensureProfile(data.user);
        toast({ title: "Account created!", description: "Welcome to Medweb Care." });
        navigate(getRoleRedirect(validated.role as AppRole));
      } else {
        // Email confirmation required
        toast({
          title: "Check your email",
          description: "We've sent a verification link to " + validated.email + ". Please verify your email before signing in.",
        });
        setTab("signin");
        setEmail(validated.email);
        setPassword("");
      }
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
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-gradient-hero p-10 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-white/5 rounded-full" />
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold">Medweb Care</span>
        </div>

        {/* Value prop */}
        <div className="space-y-8 relative z-10">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold leading-tight">
              Telemedicine built for hospitals
            </h2>
            <p className="text-white/80 text-lg leading-relaxed">
              Register your hospital, onboard your doctors, and deliver care through every channel patients need.
            </p>
          </div>
          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-3 w-3 text-white" />
                </div>
                <span className="text-white/90 text-sm">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-white/50 text-sm relative z-10">
          &copy; 2024 Medweb Care. Healthcare infrastructure for every hospital.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 p-4 border-b border-border">
          <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
            <Stethoscope className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold bg-gradient-hero bg-clip-text text-transparent">Medweb Care</span>
          <Link to="/" className="ml-auto text-sm text-muted-foreground hover:text-foreground">← Back</Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {tab === "signin" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {tab === "signin"
                  ? "Sign in to continue to Medweb Care"
                  : "Get started in less than 2 minutes"}
              </p>
            </div>

            {/* Tab switcher */}
            <div className="flex bg-muted rounded-xl p-1">
              <button
                onClick={() => setTab("signin")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  tab === "signin" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setTab("signup")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  tab === "signup" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>

            {tab === "signin" && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    autoComplete="email"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="input-email"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Your password"
                      value={password}
                      autoComplete="current-password"
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      data-testid="input-password"
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
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    className="text-sm text-primary font-medium hover:underline"
                    onClick={async () => {
                      if (!email.trim()) {
                        toast({ title: "Enter your email", description: "Please enter your email address first.", variant: "destructive" });
                        return;
                      }
                      setLoading(true);
                      try {
                        const { error } = await supabase.auth.resetPasswordForEmail(email, {
                          redirectTo: `${window.location.origin}/reset-password`,
                        });
                        if (error) throw error;
                        toast({ title: "Check your email", description: "We've sent a password reset link to " + email });
                      } catch (err: any) {
                        toast({ title: "Error", description: err.message, variant: "destructive" });
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
                <Button type="submit" className="w-full h-11 text-base" disabled={loading} data-testid="button-signin">
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <button type="button" className="text-primary font-medium hover:underline" onClick={() => setTab("signup")}>
                    Sign up
                  </button>
                </p>
              </form>
            )}

            {tab === "signup" && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    placeholder="Dr. John Doe"
                    value={fullName}
                    autoComplete="name"
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    data-testid="input-fullname"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email">Email address</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    autoComplete="email"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="input-signup-email"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={password}
                      autoComplete="new-password"
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      data-testid="input-signup-password"
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

                <div className="space-y-1.5">
                  <Label>I am a</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {roles.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRole(r.id)}
                        data-testid={`button-role-${r.id}`}
                        className={`flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all ${
                          role === r.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40 bg-card"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1.5 ${
                          role === r.id ? "bg-primary" : "bg-muted"
                        }`}>
                          <r.icon className={`h-3.5 w-3.5 ${role === r.id ? "text-white" : "text-muted-foreground"}`} />
                        </div>
                        <span className={`font-medium text-xs ${role === r.id ? "text-primary" : ""}`}>{r.label}</span>
                        <span className="text-xs text-muted-foreground leading-tight mt-0.5">{r.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 text-base" disabled={loading} data-testid="button-signup">
                  {loading ? "Creating account..." : "Create Account"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button type="button" className="text-primary font-medium hover:underline" onClick={() => setTab("signin")}>
                    Sign in
                  </button>
                </p>

                <p className="text-center text-xs text-muted-foreground">
                  By signing up you agree to our Terms of Service and Privacy Policy.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
