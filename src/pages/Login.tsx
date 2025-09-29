import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import KMRLLogo from '@/components/KMRLLogo';

const initialForm = { username: '', password: '' };

export default function Login() {
  const [formData, setFormData] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
      
      // Redirect to where user was trying to go, or dashboard as default
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from);
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
      <div className="min-h-screen bg-teal-gradient bg-teal-gradient-dark flex items-center justify-center p-4 relative overflow-hidden">
        <div className="w-full max-w-lg mx-auto relative z-10">
          <div className="flex items-center justify-center animate-fade-in-right">
            <Card className="w-full max-w-lg shadow-2xl border-teal-200 border-t-4 hover:shadow-teal-400 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-white/95 animate-glow hover:border-teal-300">
              <CardHeader className="text-center py-8">
                <div className="flex justify-center mb-6">
                  <KMRLLogo height={50} />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900">Welcome Back</CardTitle>
                <p className="text-gray-600 mt-3 text-lg">Sign in to Kochi Metro Rail Limited</p>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium text-gray-700">Username</Label>
                    <Input id="username" name="username" type="text" value={formData.username} onChange={handleInputChange} placeholder="Enter your username" className="w-full h-12 text-lg" disabled={isSubmitting} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                    <div className="relative">
                      <Input id="password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleInputChange} placeholder="Enter your password" className="w-full pr-10 h-12 text-lg" disabled={isSubmitting} required />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)} disabled={isSubmitting}>
                        {showPassword ? (<EyeOff className="h-4 w-4 text-gray-400" />) : (<Eye className="h-4 w-4 text-gray-400" />)}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white text-lg font-semibold" disabled={isSubmitting}>
                    {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</>) : (<><LogIn className="mr-2 h-4 w-4" />Sign In</>)}
                  </Button>
                  <div className="text-center text-sm text-gray-600">
                    Don't have an account? <Link to="/signup" className="text-teal-600 hover:text-teal-800 font-medium">Create one here</Link>
                  </div>
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                    <p className="text-xs text-teal-800"><strong>Note:</strong> If you've just registered, your account needs approval from the super admin before you can log in.</p>
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