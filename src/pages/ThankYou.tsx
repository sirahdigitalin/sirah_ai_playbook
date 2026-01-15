import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function ThankYou() {
  return (
    <div className="min-h-screen hero-gradient flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="animate-fade-up">
        <CheckCircle className="w-20 h-20 text-accent mx-auto mb-6" />
      </div>
      
      <h1 className="animate-fade-up-delay-1 text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight mb-4 max-w-2xl">
        Thank You!
      </h1>
      
      <p className="animate-fade-up-delay-2 text-lg text-primary-foreground/80 max-w-md mb-8">
        Check your email for the playbook download link. It should arrive within a few minutes.
      </p>

      <Button asChild variant="ghost" className="animate-fade-up-delay-3 text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10">
        <Link to="/">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>
      </Button>
    </div>
  );
}