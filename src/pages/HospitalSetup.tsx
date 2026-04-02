import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Building2, CheckCircle, Stethoscope } from "lucide-react";

const plans = [
  { id: "basic", name: "Basic", price: "₦50,000/mo", doctors: "Up to 5 doctors", features: ["Text & images"] },
  { id: "professional", name: "Professional", price: "₦150,000/mo", doctors: "Up to 20 doctors", features: ["Text, images, voice & video"] },
  { id: "enterprise", name: "Enterprise", price: "₦400,000/mo", doctors: "Unlimited doctors", features: ["All features + analytics"] },
];

const HospitalSetup = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState("professional");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({ title: "Hospital name is required", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const trialExpiry = new Date();
      trialExpiry.setDate(trialExpiry.getDate() + 14);

      const { error } = await supabase.from("hospitals").insert({
        name: name.trim(),
        address: address.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        admin_id: user.id,
        subscription_plan: plan,
        subscription_status: "trial",
        subscription_expires_at: trialExpiry.toISOString(),
      });

      if (error) throw error;

      toast({ title: "Hospital registered!", description: "Your 14-day trial has started." });
      navigate("/hospital-dashboard");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center mx-auto">
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Set Up Your Hospital</h1>
          <p className="text-muted-foreground">Just two steps and you're live.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step >= s ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`}>
                {step > s ? <CheckCircle className="h-4 w-4" /> : s}
              </div>
              <span className={`text-sm ${step >= s ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                {s === 1 ? "Hospital Info" : "Choose Plan"}
              </span>
              {s < 2 && <div className={`flex-1 h-0.5 ${step > s ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Hospital Information
              </CardTitle>
              <CardDescription>Tell us about your hospital or clinic</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Hospital / Clinic Name *</Label>
                <Input
                  id="name"
                  placeholder="St. Luke's Medical Centre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  data-testid="input-hospital-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="12 Marina Road, Lagos"
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+234 800 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hemail">Hospital Email</Label>
                  <Input
                    id="hemail"
                    type="email"
                    placeholder="info@hospital.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <Button className="w-full" onClick={() => setStep(2)} disabled={!name.trim()}>
                Continue to Plan Selection
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Plan</CardTitle>
              <CardDescription>14-day free trial on all plans. Cancel anytime.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={plan} onValueChange={setPlan} className="space-y-3">
                {plans.map((p) => (
                  <Label
                    key={p.id}
                    htmlFor={`plan-${p.id}`}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      plan === p.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <RadioGroupItem id={`plan-${p.id}`} value={p.id} className="mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{p.name}</span>
                        <span className="font-bold text-primary">{p.price}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{p.doctors} · {p.features.join(", ")}</div>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
                  {loading ? "Setting up..." : "Start Free Trial"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default HospitalSetup;
