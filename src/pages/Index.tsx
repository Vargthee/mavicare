import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Video, FileText, Shield, Clock, Users } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="glass fixed w-full z-50 animate-slide-up">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Medweb Care
          </h1>
          <div className="flex gap-2 sm:gap-4">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="sm:size-default animate-fast hover:scale-105">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="sm:size-default animate-fast hover:scale-105 hover-glow">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6 animate-fade-in">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
              Healthcare at Your{" "}
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                Fingertips
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with verified doctors, book consultations, and manage your medical records securely - all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4 justify-center">
              <Link to="/auth" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 animate-fast hover:scale-105 hover-glow">
                  Book Consultation
                </Button>
              </Link>
              <Link to="/auth" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 animate-fast hover:scale-105">
                  Join as Doctor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-16">
            Why Choose Medweb Care?
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="glass-strong p-6 sm:p-8 rounded-xl hover-lift hover-glow group animate-fade-in">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-hero rounded-lg flex items-center justify-center mb-3 sm:mb-4 animate-smooth group-hover:scale-110">
                <Calendar className="h-6 w-6 sm:h-7 sm:w-7 text-primary-foreground" />
              </div>
              <h4 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">Easy Booking</h4>
              <p className="text-sm sm:text-base text-muted-foreground">
                Schedule appointments with verified doctors in just a few clicks. Choose your preferred time and date.
              </p>
            </div>
            
            <div className="glass-strong p-6 sm:p-8 rounded-xl hover-lift hover-glow group animate-fade-in [animation-delay:100ms]">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-hero rounded-lg flex items-center justify-center mb-3 sm:mb-4 animate-smooth group-hover:scale-110">
                <Video className="h-6 w-6 sm:h-7 sm:w-7 text-primary-foreground" />
              </div>
              <h4 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">Video Consultations</h4>
              <p className="text-sm sm:text-base text-muted-foreground">
                Connect with your doctor face-to-face through secure video calls from the comfort of your home.
              </p>
            </div>
            
            <div className="glass-strong p-6 sm:p-8 rounded-xl hover-lift hover-glow group animate-fade-in [animation-delay:200ms]">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-hero rounded-lg flex items-center justify-center mb-3 sm:mb-4 animate-smooth group-hover:scale-110">
                <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-primary-foreground" />
              </div>
              <h4 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">Medical Records</h4>
              <p className="text-sm sm:text-base text-muted-foreground">
                Access your complete medical history anytime. Share records securely with your healthcare providers.
              </p>
            </div>
            
            <div className="glass-strong p-6 sm:p-8 rounded-xl hover-lift hover-glow group animate-fade-in [animation-delay:300ms]">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-hero rounded-lg flex items-center justify-center mb-3 sm:mb-4 animate-smooth group-hover:scale-110">
                <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-primary-foreground" />
              </div>
              <h4 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">Secure & Private</h4>
              <p className="text-sm sm:text-base text-muted-foreground">
                Bank-level encryption ensures your medical data stays confidential and protected at all times.
              </p>
            </div>
            
            <div className="glass-strong p-6 sm:p-8 rounded-xl hover-lift hover-glow group animate-fade-in [animation-delay:400ms]">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-hero rounded-lg flex items-center justify-center mb-3 sm:mb-4 animate-smooth group-hover:scale-110">
                <Clock className="h-6 w-6 sm:h-7 sm:w-7 text-primary-foreground" />
              </div>
              <h4 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">24/7 Availability</h4>
              <p className="text-sm sm:text-base text-muted-foreground">
                Find doctors available round the clock for urgent consultations and emergency care.
              </p>
            </div>
            
            <div className="glass-strong p-6 sm:p-8 rounded-xl hover-lift hover-glow group animate-fade-in [animation-delay:500ms]">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-hero rounded-lg flex items-center justify-center mb-3 sm:mb-4 animate-smooth group-hover:scale-110">
                <Users className="h-6 w-6 sm:h-7 sm:w-7 text-primary-foreground" />
              </div>
              <h4 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">Verified Doctors</h4>
              <p className="text-sm sm:text-base text-muted-foreground">
                All doctors are verified healthcare professionals with proper credentials and licenses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4">
        <div className="container mx-auto">
          <div className="bg-gradient-hero rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center text-primary-foreground shadow-strong">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Ready to Get Started?
            </h3>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8 opacity-90">
              Join thousands of patients and doctors using Medweb Care for quality healthcare
            </p>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="text-base sm:text-lg px-8 sm:px-10 animate-fast hover:scale-105 hover-glow">
                Create Your Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 sm:py-8 px-4">
        <div className="container mx-auto text-center text-sm sm:text-base text-muted-foreground">
          <p>&copy; 2024 Medweb Care. Your health, our priority.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
