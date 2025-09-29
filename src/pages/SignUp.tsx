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
    <div>
      <div className="min-h-screen bg-teal-gradient bg-teal-gradient-dark flex items-center justify-center p-4 relative overflow-hidden">
        <div className="w-full max-w-lg mx-auto relative z-10">
          <div className="flex items-center justify-center animate-fade-in-right">
            <Card className="w-full max-w-lg shadow-2xl border-teal-200 border-t-4 hover:shadow-teal-400 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-white/95 animate-glow hover:border-teal-300">
              <CardHeader className="text-center py-8">
                <div className="flex justify-center mb-6">
                  <KMRLLogo height={50} />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900">Join KMRL Team</CardTitle>
                <p className="text-gray-600 mt-3 text-lg">Create your account to access the management system</p>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name</Label>
                    <Input id="fullName" name="fullName" type="text" value={formData.fullName} onChange={handleInputChange} placeholder="Enter your full name" className="w-full h-12 text-lg" disabled={isSubmitting} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium text-gray-700">Username</Label>
                    <Input id="username" name="username" type="text" value={formData.username} onChange={handleInputChange} placeholder="Choose a username" className="w-full h-12 text-lg" disabled={isSubmitting} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Enter your email address" className="w-full h-12 text-lg" disabled={isSubmitting} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                    <div className="relative">
                      <Input id="password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleInputChange} placeholder="Create a password" className="w-full pr-10 h-12 text-lg" disabled={isSubmitting} required />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)} disabled={isSubmitting}>
                        {showPassword ? (<EyeOff className="h-4 w-4 text-gray-400" />) : (<Eye className="h-4 w-4 text-gray-400" />)}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</Label>
                    <div className="relative">
                      <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleInputChange} placeholder="Confirm your password" className="w-full pr-10 h-12 text-lg" disabled={isSubmitting} required />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={isSubmitting}>
                        {showConfirmPassword ? (<EyeOff className="h-4 w-4 text-gray-400" />) : (<Eye className="h-4 w-4 text-gray-400" />)}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white text-lg font-semibold" disabled={isSubmitting}>
                    {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating Account...</>) : (<><UserPlus className="mr-2 h-4 w-4" />Create Account</>)}
                  </Button>
                  <div className="text-center text-sm text-gray-600">
                    Already have an account? <Link to="/login" className="text-teal-600 hover:text-teal-800 font-medium">Sign in here</Link>
                  </div>
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                    <p className="text-xs text-teal-800"><strong>Note:</strong> Your account will be pending approval from the super admin before you can log in.</p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}