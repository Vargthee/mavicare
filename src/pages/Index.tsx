import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2, MessageSquare, Image, Mic, Phone, Video,
  Shield, Clock, Users, CheckCircle, ArrowRight, Stethoscope
} from "lucide-react";

const plans = [
  {
    name: "Basic",
    price: "₦50,000",
    period: "/month",
    description: "Perfect for small clinics getting started with telemedicine",
    doctors: "Up to 5 doctors",
    features: [
      "Text consultations",
      "Image sharing",
      "Basic patient records",
      "Email support",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "₦150,000",
    period: "/month",
    description: "For growing hospitals with high consultation volumes",
    doctors: "Up to 20 doctors",
    features: [
      "Everything in Basic",
      "Voice notes",
      "Voice & video calls",
      "Advanced analytics",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "₦400,000",
    period: "/month",
    description: "Full-scale telemedicine for large hospital networks",
    doctors: "Unlimited doctors",
    features: [
      "Everything in Professional",
      "Multi-branch support",
      "Custom branding",
      "Dedicated account manager",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const communicationTypes = [
  {
    icon: MessageSquare,
    title: "Text Consultations",
    description: "Doctors and patients exchange messages in real time — just like a chat.",
    color: "bg-blue-500",
  },
  {
    icon: Image,
    title: "Image Sharing",
    description: "Patients send photos of symptoms, wounds, or lab results instantly.",
    color: "bg-emerald-500",
  },
  {
    icon: Mic,
    title: "Voice Notes",
    description: "Record and send audio messages — perfect for quick updates.",
    color: "bg-violet-500",
  },
  {
    icon: Phone,
    title: "Voice Calls",
    description: "Switch from chat to a live voice call with one tap.",
    color: "bg-orange-500",
  },
  {
    icon: Video,
    title: "Video Calls",
    description: "Face-to-face consultations from anywhere in the world.",
    color: "bg-rose-500",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="glass fixed w-full z-50 border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
              <Stethoscope className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Medweb Care
            </h1>
          </div>
          <div className="flex gap-2 sm:gap-4 items-center">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Patient Login</Button>
            </Link>
            <Link to="/auth?role=hospital_admin">
              <Button size="sm" className="animate-fast hover:scale-105 hover-glow">
                Register Hospital
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 sm:pt-36 pb-16 sm:pb-24 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
            <Badge variant="secondary" className="text-sm px-4 py-1">
              🏥 Built for Nigerian Hospitals
            </Badge>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
              Power Your Hospital with{" "}
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                Telemedicine
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Register your hospital, onboard your doctors, and start delivering care through text, images, voice notes, and video — all in one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 justify-center">
              <Link to="/auth?role=hospital_admin" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 animate-fast hover:scale-105 hover-glow">
                  Register Your Hospital
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 animate-fast hover:scale-105">
                  I'm a Patient
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Communication types */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl sm:text-4xl font-bold mb-4">Every Way to Care</h3>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Your doctors can reach patients through every communication channel they need.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {communicationTypes.map((type, i) => (
              <div
                key={type.title}
                className="glass-strong p-6 rounded-xl hover-lift group animate-fade-in text-center"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`w-12 h-12 ${type.color} rounded-xl flex items-center justify-center mb-4 mx-auto animate-smooth group-hover:scale-110`}>
                  <type.icon className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold mb-2">{type.title}</h4>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "01", icon: Building2, title: "Register Your Hospital", desc: "Sign up, subscribe to a plan, and set up your hospital profile in minutes." },
              { step: "02", icon: Users, title: "Onboard Your Doctors", desc: "Add your medical staff. Each doctor gets their own login and profile." },
              { step: "03", icon: MessageSquare, title: "Start Consultations", desc: "Patients find your hospital, pick a doctor, and start receiving care immediately." },
            ].map((step) => (
              <div key={step.step} className="text-center space-y-4">
                <div className="relative inline-block">
                  <div className="w-16 h-16 bg-gradient-hero rounded-2xl flex items-center justify-center mx-auto">
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-secondary rounded-full text-xs font-bold text-white flex items-center justify-center">
                    {step.step.slice(1)}
                  </span>
                </div>
                <h4 className="text-xl font-semibold">{step.title}</h4>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 sm:py-20 bg-muted/30 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl sm:text-4xl font-bold mb-4">Simple, Transparent Pricing</h3>
            <p className="text-muted-foreground text-lg">All plans include a 14-day free trial. No credit card required.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 flex flex-col gap-6 ${
                  plan.highlighted
                    ? "bg-gradient-hero text-white shadow-strong scale-105"
                    : "glass-strong"
                }`}
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-white border-0 px-4 whitespace-nowrap">
                    Most Popular
                  </Badge>
                )}
                <div>
                  <h4 className={`text-xl font-bold mb-1 ${plan.highlighted ? "text-white" : ""}`}>{plan.name}</h4>
                  <div className="flex items-end gap-1 mb-2">
                    <span className={`text-3xl font-bold ${plan.highlighted ? "text-white" : ""}`}>{plan.price}</span>
                    <span className={`text-sm mb-1 ${plan.highlighted ? "text-white/80" : "text-muted-foreground"}`}>{plan.period}</span>
                  </div>
                  <p className={`text-sm ${plan.highlighted ? "text-white/80" : "text-muted-foreground"}`}>{plan.description}</p>
                </div>
                <div className={`text-sm font-semibold ${plan.highlighted ? "text-white" : "text-primary"}`}>
                  {plan.doctors}
                </div>
                <ul className="space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`h-4 w-4 flex-shrink-0 ${plan.highlighted ? "text-white" : "text-secondary"}`} />
                      <span className={plan.highlighted ? "text-white" : ""}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/auth?role=hospital_admin">
                  <Button
                    className="w-full"
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
      <section className="py-16 sm:py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Shield, title: "Secure & Private", desc: "All data encrypted. Patient records stay private under strict access control." },
              { icon: Clock, title: "Always Available", desc: "24/7 uptime. Your doctors can take consultations any time, any day." },
              { icon: Users, title: "Any Specialty", desc: "GPs, specialists, nurses — onboard any healthcare professional in your team." },
            ].map((item) => (
              <div key={item.title} className="space-y-3">
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold text-lg">{item.title}</h4>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 px-4">
        <div className="container mx-auto">
          <div className="bg-gradient-hero rounded-3xl p-10 sm:p-16 text-center text-white shadow-strong">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Ready to go digital?
            </h3>
            <p className="text-lg sm:text-xl mb-8 opacity-90 max-w-xl mx-auto">
              Join hospitals already delivering world-class care through Medweb Care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth?role=hospital_admin">
                <Button size="lg" variant="secondary" className="text-base px-10 hover:scale-105 animate-fast">
                  Register Your Hospital
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="text-base px-10 text-white border-white hover:bg-white/10">
                  Patient? Book a Consultation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Medweb Care. Healthcare infrastructure for every hospital.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
