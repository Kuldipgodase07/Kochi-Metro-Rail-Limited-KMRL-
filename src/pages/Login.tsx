import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Loader2, Eye, EyeOff, Target, Star, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import KMRLLogo from '@/components/KMRLLogo';

// --- PLACEHOLDER COMPONENTS & DATA ---
function TrainSVG() {
  return <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect x="5" y="10" width="30" height="20" rx="6" fill="#2563eb" opacity="0.2"/><rect x="10" y="15" width="20" height="10" rx="3" fill="#2563eb"/></svg>;
}

function AnimatedCard({ icon, title, content, expanded, onClick }: any) {
  return (
    <div
      className={
        expanded
          ? 'rounded-xl border-4 border-blue-200 bg-white/80 shadow-md mb-2 transition-all duration-300 cursor-pointer scale-105'
          : 'rounded-xl border-2 border-blue-200 bg-white/80 shadow-md mb-2 transition-all duration-300 cursor-pointer'
      }
      onClick={onClick}
    >
      <div className="flex items-center gap-3 p-3">
        {icon}
        <span className="font-semibold text-lg text-gray-800">{title}</span>
      </div>
      {expanded && <div className="px-4 pb-4 text-gray-700 animate-fade-in">{content}</div>}
    </div>
  );
}

function WhyCarousel({ facts }: any) {
  return (
    <div className="mt-2 p-3 bg-blue-50 rounded-lg text-blue-900 text-sm shadow-inner">
      <strong>Why Kochi Metro?</strong>
      <ul className="list-disc pl-5 mt-1">
        {facts.map((fact: string, i: number) => <li key={i}>{fact}</li>)}
      </ul>
    </div>
  );
}

const vision = "To provide a world-class, safe, reliable, efficient, and customer-friendly rapid transit system for the city of Kochi.";
const mission = "To transform the quality of urban life in Kochi by providing a sustainable, inclusive, and modern metro system that enhances mobility and supports economic growth.";
const values = ["Safety First", "Customer Focus", "Sustainability", "Innovation", "Integrity", "Teamwork"];
const goals = ["Expand metro connectivity across Kochi", "Achieve operational excellence", "Promote green and clean mobility", "Enhance commuter experience", "Foster inclusive growth"];
const whyFacts = [
  "India's first metro to connect rail, road, and water transport.",
  "Focus on sustainability and green initiatives.",
  "Empowering women and transgender workforce.",
  "Smart ticketing and digital innovation.",
  "World-class safety and reliability."
];

const initialForm = { username: '', password: '' };

export default function Login() {
  const [expanded, setExpanded] = useState<string | null>("Vision");
  const [formData, setFormData] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await login(formData.username, formData.password);
      toast({
        title: "Success",
        description: "Successfully signed in!",
      });
      navigate('/');
    } catch (error: unknown) {
      console.error('Login failed:', error);
      const errorMessage = error instanceof Error ? error.message : "Invalid credentials. Please try again.";
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute left-10 top-10 animate-float-slow opacity-10"><TrainSVG /></div>
          <div className="absolute right-20 bottom-20 animate-float-medium opacity-10"><TrainSVG /></div>
        </div>
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
          <div className="flex flex-col gap-4 items-start justify-center px-4 md:px-8 animate-fade-in-left">
            <AnimatedCard
              icon={<Target className="h-7 w-7" />}
              title="Vision"
              content={vision}
              expanded={expanded === "Vision"}
              onClick={() => setExpanded(expanded === "Vision" ? null : "Vision")}
            />
            <AnimatedCard
              icon={<Star className="h-7 w-7" />}
              title="Mission"
              content={mission}
              expanded={expanded === "Mission"}
              onClick={() => setExpanded(expanded === "Mission" ? null : "Mission")}
            />
            <AnimatedCard
              icon={<Users className="h-7 w-7" />}
              title="Values"
              content={<ul className="list-disc pl-5 space-y-1">{values.map((v, i) => <li key={i}>{v}</li>)}</ul>}
              expanded={expanded === "Values"}
              onClick={() => setExpanded(expanded === "Values" ? null : "Values")}
            />
            <AnimatedCard
              icon={<TrendingUp className="h-7 w-7" />}
              title="Strategic Goals"
              content={<ul className="list-disc pl-5 space-y-1">{goals.map((g, i) => <li key={i}>{g}</li>)}</ul>}
              expanded={expanded === "Strategic Goals"}
              onClick={() => setExpanded(expanded === "Strategic Goals" ? null : "Strategic Goals")}
            />
            <WhyCarousel facts={whyFacts} />
          </div>
          <div className="flex items-center justify-center animate-fade-in-right">
            <Card className="w-full max-w-md shadow-2xl border-blue-200 border-t-4 hover:shadow-blue-400 transition-shadow duration-500 bg-white/90 animate-glow">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <KMRLLogo height={40} />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
                <p className="text-gray-600 mt-2">Sign in to Train Plan Wise - Kochi Metro Rail Limited</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium text-gray-700">Username</Label>
                    <Input id="username" name="username" type="text" value={formData.username} onChange={handleInputChange} placeholder="Enter your username" className="w-full" disabled={isSubmitting} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                    <div className="relative">
                      <Input id="password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleInputChange} placeholder="Enter your password" className="w-full pr-10" disabled={isSubmitting} required />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)} disabled={isSubmitting}>
                        {showPassword ? (<EyeOff className="h-4 w-4 text-gray-400" />) : (<Eye className="h-4 w-4 text-gray-400" />)}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
                    {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</>) : (<><LogIn className="mr-2 h-4 w-4" />Sign In</>)}
                  </Button>
                  <div className="text-center text-sm text-gray-600">
                    Don't have an account? <Link to="/signup" className="text-blue-600 hover:text-blue-800 font-medium">Create one here</Link>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800"><strong>Note:</strong> If you've just registered, your account needs approval from the super admin before you can log in.</p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}