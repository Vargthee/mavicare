import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Stethoscope, Building2, User, CheckCircle, Eye, EyeOff, ArrowLeft, UserPlus } from "lucide-react";
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
  { id: "patient", label: "Patient", desc: "Book consultations with doctors", icon: User },
  { id: "doctor", label: "Doctor", desc: "Provide telemedicine care", icon: Stethoscope },
  { id: "hospital_admin", label: "Hospital Admin", desc: "Register & manage hospital", icon: Building2 },
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
  const [resetCooldown, setResetCooldown] = useState(0);
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

      if (data.session) {
        await ensureProfile(data.user);
        toast({ title: "Account created!", description: "Welcome to Medweb Care." });
        navigate(getRoleRedirect(validated.role as AppRole));
      } else {
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

  const handleForgotPassword = async () => {
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
      setResetCooldown(60);
      const interval = setInterval(() => {
        setResetCooldown((prev) => {
          if (prev <= 1) { clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-gradient-hero p-10 text-white relative overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-white/[0.04] rounded-full" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/[0.04] rounded-full" />
          <div className="absolute top-[30%] right-[15%] w-4 h-4 bg-white/20 rounded-full animate-float" />
          <div className="absolute top-[60%] left-[20%] w-3 h-3 bg-white/15 rounded-full animate-float-slow" />
          <div className="absolute top-[20%] left-[40%] w-2 h-2 bg-white/10 rounded-full animate-float" style={{ animationDelay: "1s" }} />
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Medweb Care</span>
        </div>

        {/* Value prop */}
        <div className="space-y-8 relative z-10">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold leading-tight tracking-tight">
              Telemedicine built{" "}
              <br />
              for hospitals
            </h2>
            <p className="text-white/70 text-lg leading-relaxed max-w-sm">
              Register your hospital, onboard your doctors, and deliver care through every channel.
            </p>
          </div>
          <ul className="space-y-3">
            {features.map((f, i) => (
              <li key={f} className="flex items-center gap-3 opacity-0 animate-slide-in-right" style={{ animationDelay: `${400 + i * 100}ms` }}>
                <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-3 w-3 text-white" />
                </div>
                <span className="text-white/85 text-sm">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-white/40 text-sm relative z-10">
          &copy; {new Date().getFullYear()} Medweb Care
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col bg-background relative">
        {/* Subtle mesh background */}
        <div className="absolute inset-0 mesh-bg pointer-events-none opacity-50" />

        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-2 p-4 border-b border-border/50 glass relative z-10">
          <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center shadow-soft">
            <Stethoscope className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-gradient">Medweb Care</span>
          <Link to="/" className="ml-auto text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
            <ArrowLeft className="h-3 w-3" /> Back
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
          <div className="w-full max-w-md space-y-6 animate-fade-in">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                {tab === "signin" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="text-muted-foreground mt-1.5 text-sm">
                {tab === "signin"
                  ? "Sign in to continue to Medweb Care"
                  : "Get started in less than 2 minutes"}
              </p>
            </div>

            {/* Tab switcher */}
            <div className="flex bg-muted/60 rounded-xl p-1 backdrop-blur-sm">
              <button
                onClick={() => setTab("signin")}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  tab === "signin"
                    ? "bg-background shadow-soft text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setTab("signup")}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  tab === "signup"
                    ? "bg-background shadow-soft text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <UserPlus className="h-3.5 w-3.5" />
                Sign Up
              </button>
            </div>

            {tab === "signin" && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    autoComplete="email"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 bg-background"
                    data-testid="input-email"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <button
                      type="button"
                      disabled={resetCooldown > 0 || loading}
                      className={`text-xs font-medium transition-colors ${
                        resetCooldown > 0 ? "text-muted-foreground cursor-not-allowed" : "text-primary hover:text-primary/80"
                      }`}
                      onClick={handleForgotPassword}
                    >
                      {resetCooldown > 0 ? `Resend in ${resetCooldown}s` : "Forgot password?"}
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Your password"
                      value={password}
                      autoComplete="current-password"
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 bg-background pr-10"
                      data-testid="input-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 text-sm font-medium bg-gradient-hero hover:opacity-90 shadow-soft hover:shadow-medium transition-all duration-300"
                  disabled={loading}
                  data-testid="button-signin"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <button type="button" className="text-primary font-medium hover:text-primary/80 transition-colors" onClick={() => setTab("signup")}>
                    Sign up
                  </button>
                </p>
              </form>
            )}

            {tab === "signup" && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-sm font-medium">Full name</Label>
                  <Input
                    id="fullName"
                    placeholder="Dr. John Doe"
                    value={fullName}
                    autoComplete="name"
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="h-11 bg-background"
                    data-testid="input-fullname"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email" className="text-sm font-medium">Email address</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    autoComplete="email"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 bg-background"
                    data-testid="input-signup-email"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={password}
                      autoComplete="new-password"
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 bg-background pr-10"
                      data-testid="input-signup-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">I am a</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {roles.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRole(r.id)}
                        data-testid={`button-role-${r.id}`}
                        className={`flex flex-col items-center p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                          role === r.id
                            ? "border-primary bg-primary/5 shadow-soft"
                            : "border-border hover:border-primary/30 bg-background"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 transition-all duration-200 ${
                          role === r.id ? "bg-gradient-hero shadow-soft" : "bg-muted"
                        }`}>
                          <r.icon className={`h-4 w-4 ${role === r.id ? "text-white" : "text-muted-foreground"}`} />
                        </div>
                        <span className={`font-medium text-xs ${role === r.id ? "text-primary" : "text-foreground"}`}>{r.label}</span>
                        <span className="text-[10px] text-muted-foreground leading-tight mt-0.5 hidden sm:block">{r.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-sm font-medium bg-gradient-hero hover:opacity-90 shadow-soft hover:shadow-medium transition-all duration-300"
                  disabled={loading}
                  data-testid="button-signup"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button type="button" className="text-primary font-medium hover:text-primary/80 transition-colors" onClick={() => setTab("signin")}>
                    Sign in
                  </button>
                </p>

                <p className="text-center text-xs text-muted-foreground/70">
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
