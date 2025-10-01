import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Video, FileText, Shield, Clock, Users } from "lucide-react";
import heroImage from "@/assets/hero-medical.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm fixed w-full z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            MediConnect
          </h1>
          <div className="flex gap-4">
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-5xl md:text-6xl font-bold leading-tight">
                Healthcare at Your{" "}
                <span className="bg-gradient-hero bg-clip-text text-transparent">
                  Fingertips
                </span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Connect with verified doctors, book consultations, and manage your medical records securely - all in one place.
              </p>
              <div className="flex gap-4 pt-4">
                <Link to="/auth">
                  <Button size="lg" className="text-lg px-8">
                    Book Consultation
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Join as Doctor
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative animate-fade-in">
              <img
                src={heroImage}
                alt="Medical consultation platform"
                className="rounded-2xl shadow-strong w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-bold text-center mb-16">
            Why Choose MediConnect?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-xl shadow-soft hover:shadow-medium transition-all">
              <div className="w-14 h-14 bg-gradient-hero rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-7 w-7 text-primary-foreground" />
              </div>
              <h4 className="text-2xl font-semibold mb-3">Easy Booking</h4>
              <p className="text-muted-foreground">
                Schedule appointments with verified doctors in just a few clicks. Choose your preferred time and date.
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-xl shadow-soft hover:shadow-medium transition-all">
              <div className="w-14 h-14 bg-gradient-hero rounded-lg flex items-center justify-center mb-4">
                <Video className="h-7 w-7 text-primary-foreground" />
              </div>
              <h4 className="text-2xl font-semibold mb-3">Video Consultations</h4>
              <p className="text-muted-foreground">
                Connect with your doctor face-to-face through secure video calls from the comfort of your home.
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-xl shadow-soft hover:shadow-medium transition-all">
              <div className="w-14 h-14 bg-gradient-hero rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-7 w-7 text-primary-foreground" />
              </div>
              <h4 className="text-2xl font-semibold mb-3">Medical Records</h4>
              <p className="text-muted-foreground">
                Access your complete medical history anytime. Share records securely with your healthcare providers.
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-xl shadow-soft hover:shadow-medium transition-all">
              <div className="w-14 h-14 bg-gradient-hero rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-7 w-7 text-primary-foreground" />
              </div>
              <h4 className="text-2xl font-semibold mb-3">Secure & Private</h4>
              <p className="text-muted-foreground">
                Bank-level encryption ensures your medical data stays confidential and protected at all times.
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-xl shadow-soft hover:shadow-medium transition-all">
              <div className="w-14 h-14 bg-gradient-hero rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-7 w-7 text-primary-foreground" />
              </div>
              <h4 className="text-2xl font-semibold mb-3">24/7 Availability</h4>
              <p className="text-muted-foreground">
                Find doctors available round the clock for urgent consultations and emergency care.
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-xl shadow-soft hover:shadow-medium transition-all">
              <div className="w-14 h-14 bg-gradient-hero rounded-lg flex items-center justify-center mb-4">
                <Users className="h-7 w-7 text-primary-foreground" />
              </div>
              <h4 className="text-2xl font-semibold mb-3">Verified Doctors</h4>
              <p className="text-muted-foreground">
                All doctors are verified healthcare professionals with proper credentials and licenses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="bg-gradient-hero rounded-3xl p-12 text-center text-primary-foreground shadow-strong">
            <h3 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Get Started?
            </h3>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of patients and doctors using MediConnect for quality healthcare
            </p>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="text-lg px-10">
                Create Your Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 MediConnect. Your health, our priority.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
