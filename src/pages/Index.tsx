import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2, MessageSquare, Image, Mic, Phone, Video,
  Shield, Clock, Users, CheckCircle, ArrowRight, Stethoscope,
  Sparkles, Star,
} from "lucide-react";

const plans = [
  {
    name: "Basic",
    price: "₦50,000",
    period: "/month",
    description: "Perfect for small clinics getting started",
    doctors: "Up to 5 doctors",
    features: ["Text consultations", "Image sharing", "Basic patient records", "Email support"],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "₦150,000",
    period: "/month",
    description: "For growing hospitals with high volumes",
    doctors: "Up to 20 doctors",
    features: ["Everything in Basic", "Voice notes", "Voice & video calls", "Advanced analytics", "Priority support"],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "₦400,000",
    period: "/month",
    description: "Full-scale for large hospital networks",
    doctors: "Unlimited doctors",
    features: ["Everything in Professional", "Multi-branch support", "Custom branding", "Dedicated account manager", "SLA guarantee"],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const communicationTypes = [
  { icon: MessageSquare, title: "Text Chat", description: "Real-time messaging between doctors and patients.", color: "from-blue-500 to-blue-600" },
  { icon: Image, title: "Image Sharing", description: "Send photos of symptoms, wounds, or lab results.", color: "from-emerald-500 to-emerald-600" },
  { icon: Mic, title: "Voice Notes", description: "Record and send audio messages instantly.", color: "from-violet-500 to-violet-600" },
  { icon: Phone, title: "Voice Calls", description: "Switch from chat to a live call with one tap.", color: "from-orange-500 to-orange-600" },
  { icon: Video, title: "Video Calls", description: "Face-to-face consultations from anywhere.", color: "from-rose-500 to-rose-600" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="glass fixed w-full z-50 border-b border-border/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-hero rounded-xl flex items-center justify-center shadow-soft">
              <Stethoscope className="h-4.5 w-4.5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gradient">Medweb Care</h1>
          </div>
          <div className="flex gap-2 sm:gap-3 items-center">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Sign In
              </Button>
            </Link>
            <Link to="/auth?role=hospital_admin&tab=signup">
              <Button size="sm" className="bg-gradient-hero hover:opacity-90 shadow-soft hover:shadow-medium transition-all duration-300">
                Register Hospital
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-28 px-4">
        {/* Background decorations */}
        <div className="absolute inset-0 mesh-bg pointer-events-none" />
        <div className="absolute top-20 left-[10%] w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-10 right-[15%] w-64 h-64 bg-secondary/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "2s" }} />

        <div className="container mx-auto relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="animate-fade-in" style={{ animationDelay: "0ms" }}>
              <Badge variant="secondary" className="text-sm px-4 py-1.5 gap-1.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
                <Sparkles className="h-3.5 w-3.5" />
                Built for Nigerian Hospitals
              </Badge>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight animate-fade-in" style={{ animationDelay: "100ms" }}>
              Power Your Hospital{" "}
              <br className="hidden sm:block" />
              with{" "}
              <span className="text-gradient">Telemedicine</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: "200ms" }}>
              Register your hospital, onboard your doctors, and deliver care through text, images, voice, and video — all in one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 justify-center animate-fade-in" style={{ animationDelay: "300ms" }}>
              <Link to="/auth?role=hospital_admin&tab=signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 h-12 bg-gradient-hero hover:opacity-90 shadow-medium hover:shadow-strong transition-all duration-300 group">
                  Register Your Hospital
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
              <Link to="/auth" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 h-12 hover:bg-muted/50 transition-all duration-300">
                  I'm a Patient
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-6 pt-4 animate-fade-in" style={{ animationDelay: "400ms" }}>
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-hero border-2 border-background flex items-center justify-center text-white text-xs font-bold">
                    {["A", "B", "C", "D"][i]}
                  </div>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">50+</span> hospitals already on board
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Communication types */}
      <section className="py-20 sm:py-28 relative">
        <div className="absolute inset-0 bg-muted/40" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <Badge variant="outline" className="mb-4 text-primary border-primary/20">Communication</Badge>
            <h3 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">Every Way to Deliver Care</h3>
            <p className="text-muted-foreground text-lg">
              Your doctors can reach patients through every channel they need.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {communicationTypes.map((type, i) => (
              <div
                key={type.title}
                className="glass-card p-6 rounded-2xl group text-center opacity-0 animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${type.color} rounded-xl flex items-center justify-center mb-4 mx-auto shadow-soft group-hover:scale-110 group-hover:shadow-medium transition-all duration-300`}>
                  <type.icon className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold mb-1.5 text-sm">{type.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{type.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-28 px-4 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-glow pointer-events-none" />
        <div className="container mx-auto relative">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 text-primary border-primary/20">How It Works</Badge>
            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight">Three Simple Steps</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", icon: Building2, title: "Register Your Hospital", desc: "Sign up, choose a plan, and set up your hospital profile in minutes.", delay: 0 },
              { step: "2", icon: Users, title: "Onboard Your Doctors", desc: "Add your medical staff. Each doctor gets their own credentials and profile.", delay: 100 },
              { step: "3", icon: MessageSquare, title: "Start Consultations", desc: "Patients find your hospital, pick a doctor, and receive care instantly.", delay: 200 },
            ].map((step) => (
              <div key={step.step} className="text-center space-y-4 opacity-0 animate-fade-in" style={{ animationDelay: `${step.delay}ms` }}>
                <div className="relative inline-block">
                  <div className="w-16 h-16 bg-gradient-hero rounded-2xl flex items-center justify-center mx-auto shadow-medium group">
                    <step.icon className="h-7 w-7 text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-secondary rounded-full text-xs font-bold text-white flex items-center justify-center shadow-soft ring-2 ring-background">
                    {step.step}
                  </span>
                </div>
                <h4 className="text-lg font-semibold">{step.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 sm:py-28 relative">
        <div className="absolute inset-0 bg-muted/40" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 text-primary border-primary/20">Pricing</Badge>
            <h3 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">Simple, Transparent Pricing</h3>
            <p className="text-muted-foreground text-lg">14-day free trial on all plans. No credit card required.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
            {plans.map((plan, i) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 flex flex-col gap-6 opacity-0 animate-fade-in ${
                  plan.highlighted
                    ? "bg-gradient-hero text-white shadow-strong scale-[1.03] z-10"
                    : "glass-card"
                }`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-white border-0 px-4 shadow-soft whitespace-nowrap gap-1">
                    <Star className="h-3 w-3" /> Most Popular
                  </Badge>
                )}
                <div>
                  <h4 className={`text-xl font-bold mb-1 ${plan.highlighted ? "text-white" : ""}`}>{plan.name}</h4>
                  <div className="flex items-end gap-1 mb-2">
                    <span className={`text-3xl font-bold ${plan.highlighted ? "text-white" : ""}`}>{plan.price}</span>
                    <span className={`text-sm mb-1 ${plan.highlighted ? "text-white/70" : "text-muted-foreground"}`}>{plan.period}</span>
                  </div>
                  <p className={`text-sm ${plan.highlighted ? "text-white/70" : "text-muted-foreground"}`}>{plan.description}</p>
                </div>
                <div className={`text-sm font-semibold ${plan.highlighted ? "text-white" : "text-primary"}`}>
                  {plan.doctors}
                </div>
                <ul className="space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle className={`h-4 w-4 flex-shrink-0 ${plan.highlighted ? "text-white/90" : "text-secondary"}`} />
                      <span className={plan.highlighted ? "text-white/90" : ""}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/auth?role=hospital_admin&tab=signup">
                  <Button
                    className={`w-full h-11 ${plan.highlighted ? "bg-white text-primary hover:bg-white/90" : "bg-gradient-hero text-white hover:opacity-90"} shadow-soft transition-all duration-300`}
                    variant={plan.highlighted ? "secondary" : "default"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-20 sm:py-28 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-10 text-center max-w-4xl mx-auto">
            {[
              { icon: Shield, title: "Secure & Private", desc: "All data encrypted end-to-end. Patient records stay private under strict access control." },
              { icon: Clock, title: "Always Available", desc: "99.9% uptime guarantee. Your doctors can take consultations any time, any day." },
              { icon: Users, title: "Any Specialty", desc: "GPs, specialists, nurses — onboard any healthcare professional in your team." },
            ].map((item, i) => (
              <div key={item.title} className="space-y-4 opacity-0 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold text-lg">{item.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 px-4">
        <div className="container mx-auto">
          <div className="relative bg-gradient-hero rounded-3xl p-12 sm:p-20 text-center text-white shadow-strong overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />
            <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-white/20 rounded-full animate-float" />
            <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-white/20 rounded-full animate-float-slow" />

            <div className="relative z-10">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                Ready to go digital?
              </h3>
              <p className="text-lg sm:text-xl mb-10 text-white/80 max-w-xl mx-auto leading-relaxed">
                Join hospitals already delivering world-class care through Medweb Care.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth?role=hospital_admin&tab=signup">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-base px-10 h-12 shadow-medium transition-all duration-300 group">
                    Register Your Hospital
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" variant="outline" className="text-base px-10 h-12 text-white border-white/30 hover:bg-white/10 transition-all duration-300">
                    Patient? Book a Consultation
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-10 px-4">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-hero rounded-lg flex items-center justify-center">
              <Stethoscope className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm text-gradient">Medweb Care</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Medweb Care. Healthcare infrastructure for every hospital.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
