import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'
import KMRLLogo from '@/components/KMRLLogo'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    confirmPassword: '',
    password: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { signup } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    if (!formData.username.trim() || !formData.email.trim() || !formData.fullName.trim() || !formData.password.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      })
      return false
    }

    if (formData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    
    try {
      const success = await signup({
        username: formData.username.trim(),
        email: formData.email.trim(),
        fullName: formData.fullName.trim(),
        password: formData.password
      })

      if (success) {
        setShowSuccess(true)
        toast({
          title: "Registration Successful",
          description: "Your account has been created and is pending approval from the super admin.",
        })
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    } catch (error: unknown) {
      console.error('Signup error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.'
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-600 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
          <CardContent className="text-center p-8">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Registration Successful!</h2>
              <p className="text-cyan-100">
                Your account has been created and is pending approval from the super admin.
              </p>
            </div>
            <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-400/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-100">
                You will be redirected to the login page shortly. You can sign in once your account is approved.
              </p>
            </div>
            <Button 
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-600 relative overflow-hidden">
      {/* Animated Background with Train Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: 'url(/kmrl-train-bg.jpg)',
          backgroundBlendMode: 'overlay'
        }}
      />
      
      {/* Animated Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-transparent to-cyan-900/80" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/30 to-blue-900/80" />
      
      {/* Animated Geometric Shapes */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-cyan-400/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute top-40 left-32 w-24 h-24 bg-blue-400/10 rounded-full blur-lg animate-bounce" />
      <div className="absolute bottom-20 right-1/4 w-16 h-16 bg-teal-400/10 rounded-full blur-md animate-ping" />
      
      {/* Floating Particles Effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 animate-pulse-glow">
                  <KMRLLogo height={50} />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-white drop-shadow-lg">
                Join KMRL Team
              </CardTitle>
              <p className="text-cyan-100 font-light">Create your account to access the management system</p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName" className="text-white font-medium">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-gray-300 focus:border-cyan-400 focus:ring-cyan-400/50"
                      placeholder="Enter your full name"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="username" className="text-white font-medium">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-gray-300 focus:border-cyan-400 focus:ring-cyan-400/50"
                      placeholder="Choose a username"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-white font-medium">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-gray-300 focus:border-cyan-400 focus:ring-cyan-400/50"
                    placeholder="Enter your email address"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password" className="text-white font-medium">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-gray-300 focus:border-cyan-400 focus:ring-cyan-400/50 pr-10"
                        placeholder="Create a password"
                        disabled={isSubmitting}
                        required
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-white/10 text-gray-300 hover:text-white" 
                        onClick={() => setShowPassword(!showPassword)} 
                        disabled={isSubmitting}
                      >
                        {showPassword ? (<EyeOff className="h-4 w-4" />) : (<Eye className="h-4 w-4" />)}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword" className="text-white font-medium">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-gray-300 focus:border-cyan-400 focus:ring-cyan-400/50 pr-10"
                        placeholder="Confirm your password"
                        disabled={isSubmitting}
                        required
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-white/10 text-gray-300 hover:text-white" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                        disabled={isSubmitting}
                      >
                        {showConfirmPassword ? (<EyeOff className="h-4 w-4" />) : (<Eye className="h-4 w-4" />)}
                      </Button>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300 border-0" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Account
                    </>
                  )}
                </Button>
                
                <div className="text-center text-sm text-cyan-100">
                  Already have an account?{' '}
                  <Link to="/login" className="text-cyan-300 hover:text-white font-medium underline underline-offset-4 transition-colors">
                    Sign in here
                  </Link>
                </div>
                
                <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-400/20 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-200 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-100">
                      <strong>Important:</strong> Your account will be pending approval from the super admin. 
                      You'll be able to sign in once your account is approved.
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}