'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, Phone, Mail, MessageCircle, Video, Star, CheckCircle, ArrowRight, Shield, Zap } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function BookingPage() {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    service: '',
    consultationType: '',
    date: '',
    time: '',
    message: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedPrice, setSelectedPrice] = useState('')

  // Consultation modes for One Question Reading
  const consultationModes = [
    {
      id: 'chat',
      title: 'Chat Consultation',
      price: '₹500',
      duration: '30 minutes',
      icon: <MessageCircle className="w-6 h-6" />,
      features: ['Text-based consultation', 'Detailed written response', 'Follow-up messages included'],
      popular: false
    },
    {
      id: 'phone',
      title: 'Phone Call',
      price: '₹1100',
      duration: '45 minutes',
      icon: <Phone className="w-6 h-6" />,
      features: ['Direct voice conversation', 'Real-time discussion', 'Personal connection'],
      popular: true
    },
    {
      id: 'video',
      title: 'Video Call',
      price: '₹1600',
      duration: '60 minutes',
      icon: <Video className="w-6 h-6" />,
      features: ['Face-to-face consultation', 'Visual analysis', 'Most comprehensive'],
      popular: false
    }
  ]

  useEffect(() => {
    // Get service from URL params
    const serviceParam = searchParams.get('service')
    if (serviceParam) {
      setFormData(prev => ({ ...prev, service: serviceParam }))
      if (serviceParam === 'kundli') {
        setSelectedPrice('₹2100')
      }
    }
  }, [searchParams])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required'
    } else if (!/^\d{10}$/.test(formData.mobileNumber.replace(/\D/g, ''))) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number'
    }

    if (!formData.service) {
      newErrors.service = 'Please select a service'
    }

    // For One Question Reading, consultation type is required
    if (formData.service === 'question' && !formData.consultationType) {
      newErrors.consultationType = 'Please select consultation type'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Calculate amount based on service and consultation type
      let amount = ''
      if (formData.service === 'kundli') {
        amount = '₹2100'
      } else if (formData.service === 'question') {
        const selectedMode = consultationModes.find(mode => mode.id === formData.consultationType)
        amount = selectedMode?.price || '₹500'
      }
      
      // Save booking data to localStorage for payment page
      const bookingData = {
        ...formData,
        amount,
        timestamp: new Date().toISOString()
      }
      
      localStorage.setItem('pendingBooking', JSON.stringify(bookingData))
      
      // Redirect to payment page
      window.location.href = '/payment'
      
    } catch (error) {
      console.error('Booking failed:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleServiceSelect = (service: string) => {
    setFormData(prev => ({ ...prev, service, consultationType: '' }))
    if (service === 'kundli') {
      setSelectedPrice('₹2100')
    } else {
      setSelectedPrice('')
    }
    if (errors.service) {
      setErrors(prev => ({ ...prev, service: '' }))
    }
  }

  const handleConsultationTypeSelect = (type: string) => {
    setFormData(prev => ({ ...prev, consultationType: type }))
    const selectedMode = consultationModes.find(mode => mode.id === type)
    setSelectedPrice(selectedMode?.price || '')
    if (errors.consultationType) {
      setErrors(prev => ({ ...prev, consultationType: '' }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-amber-950 to-slate-900">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-amber-400 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-yellow-400 rounded-full opacity-10 animate-pulse delay-1000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-900/20 to-transparent"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 px-6 py-2 text-sm font-semibold">
            Book Your Consultation
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Schedule Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400">Consultation</span>
          </h1>
          
          <p className="text-xl text-amber-100 max-w-2xl mx-auto leading-relaxed">
            Book a personalized consultation with Pandit Rajkumar Ji and get answers to your life's questions
          </p>
        </div>
      </section>

      {/* Booking Form */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-gradient-to-br from-amber-900/20 to-yellow-900/20 border-2 border-amber-400/50 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl font-bold text-white mb-2">
                Booking Details
              </CardTitle>
              <p className="text-amber-100">
                Fill in your details to schedule your consultation
              </p>
            </CardHeader>
            
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Service Selection */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <Star className="w-5 h-5 mr-2 text-amber-400" />
                    Select Service
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Kundli Reading Service */}
                    <div
                      className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.service === 'kundli'
                          ? 'border-amber-400 bg-amber-900/30'
                          : 'border-amber-400/30 hover:border-amber-400/60 bg-amber-900/10'
                      }`}
                      onClick={() => handleServiceSelect('kundli')}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-2xl">🔮</span>
                        </div>
                        <Badge className="bg-amber-500 text-white">Most Popular</Badge>
                      </div>
                      
                      <h4 className="text-xl font-bold text-white mb-2">Kundli Reading</h4>
                      <p className="text-amber-100 text-sm mb-4">
                        Complete analysis of your birth chart for comprehensive life guidance
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-amber-100 text-sm">
                          <CheckCircle className="w-4 h-4 mr-2 text-amber-400" />
                          <span>Detailed Kundli Analysis</span>
                        </div>
                        <div className="flex items-center text-amber-100 text-sm">
                          <CheckCircle className="w-4 h-4 mr-2 text-amber-400" />
                          <span>Dosha Check (Mangal, Kaal Sarp, Pitra)</span>
                        </div>
                        <div className="flex items-center text-amber-100 text-sm">
                          <CheckCircle className="w-4 h-4 mr-2 text-amber-400" />
                          <span>Personalized Remedies Included</span>
                        </div>
                      </div>
                      
                      <div className="text-2xl font-bold text-amber-400">₹2100</div>
                      <div className="text-amber-200 text-sm">Complete Life Analysis</div>
                    </div>

                    {/* One Question Reading Service */}
                    <div
                      className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.service === 'question'
                          ? 'border-amber-400 bg-amber-900/30'
                          : 'border-amber-400/30 hover:border-amber-400/60 bg-amber-900/10'
                      }`}
                      onClick={() => handleServiceSelect('question')}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-2xl">🔥</span>
                        </div>
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">Quick Answer</Badge>
                      </div>
                      
                      <h4 className="text-xl font-bold text-white mb-2">One Question Reading</h4>
                      <p className="text-amber-100 text-sm mb-4">
                        Get instant answers to your specific questions with precise guidance
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-amber-100 text-sm">
                          <Zap className="w-4 h-4 mr-2 text-amber-400" />
                          <span>Quick Response to Your Question</span>
                        </div>
                        <div className="flex items-center text-amber-100 text-sm">
                          <CheckCircle className="w-4 h-4 mr-2 text-amber-400" />
                          <span>Focus on One Specific Issue</span>
                        </div>
                        <div className="flex items-center text-amber-100 text-sm">
                          <CheckCircle className="w-4 h-4 mr-2 text-amber-400" />
                          <span>Immediate Remedies Suggested</span>
                        </div>
                      </div>
                      
                      <div className="text-amber-200 text-sm mb-2">Choose Your Consultation Mode:</div>
                      <div className="text-lg font-bold text-amber-400">
                        {selectedPrice || 'Select mode below'}
                      </div>
                    </div>
                  </div>
                  
                  {errors.service && (
                    <p className="text-red-400 text-sm">{errors.service}</p>
                  )}
                </div>

                {/* Consultation Type Selection (Only for One Question Reading) */}
                {formData.service === 'question' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white flex items-center">
                      <MessageCircle className="w-5 h-5 mr-2 text-amber-400" />
                      Choose Consultation Mode
                    </h3>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      {consultationModes.map((mode) => (
                        <div
                          key={mode.id}
                          className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                            formData.consultationType === mode.id
                              ? 'border-amber-400 bg-amber-900/30'
                              : 'border-amber-400/30 hover:border-amber-400/60 bg-amber-900/10'
                          }`}
                          onClick={() => handleConsultationTypeSelect(mode.id)}
                        >
                          <div className="text-center mb-3">
                            <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-2 text-white">
                              {mode.icon}
                            </div>
                            <div className="text-white font-semibold">{mode.title}</div>
                            <div className="text-amber-200 text-sm">{mode.duration}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-amber-400">{mode.price}</div>
                            {mode.popular && (
                              <Badge className="bg-orange-500 text-white text-xs mt-1">Popular</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {errors.consultationType && (
                      <p className="text-red-400 text-sm">{errors.consultationType}</p>
                    )}
                  </div>
                )}

                {/* Personal Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <User className="w-5 h-5 mr-2 text-amber-400" />
                    Personal Information
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-amber-100">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="bg-amber-900/20 border-amber-400/30 text-white placeholder-amber-300/50 focus:border-amber-400"
                        placeholder="Enter your full name"
                      />
                      {errors.fullName && (
                        <p className="text-red-400 text-sm">{errors.fullName}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-amber-100">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="bg-amber-900/20 border-amber-400/30 text-white placeholder-amber-300/50 focus:border-amber-400"
                        placeholder="your.email@example.com"
                      />
                      {errors.email && (
                        <p className="text-red-400 text-sm">{errors.email}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mobileNumber" className="text-amber-100">Mobile Number *</Label>
                    <Input
                      id="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                      className="bg-amber-900/20 border-amber-400/30 text-white placeholder-amber-300/50 focus:border-amber-400"
                      placeholder="+91 9799568414"
                    />
                    {errors.mobileNumber && (
                      <p className="text-red-400 text-sm">{errors.mobileNumber}</p>
                    )}
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-amber-400" />
                    Additional Information
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-amber-100">Message (Optional)</Label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      className="w-full bg-amber-900/20 border-amber-400/30 text-white placeholder-amber-300/50 focus:border-amber-400 rounded-lg p-3 min-h-[100px] resize-none"
                      placeholder="Tell us about your specific concerns or questions..."
                    />
                  </div>
                </div>

                {/* Price Summary */}
                {selectedPrice && (
                  <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-lg p-6 border border-amber-400/50">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-semibold text-white">Total Amount:</span>
                      <span className="text-3xl font-bold text-amber-400">{selectedPrice}</span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !selectedPrice}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        Proceed to Payment
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                  
                  <Link href="/">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-slate-900 py-4 text-lg font-semibold rounded-full transition-all duration-300"
                    >
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Information Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="bg-gradient-to-br from-amber-900/20 to-yellow-900/20 border-2 border-amber-400/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Verified Expert</h3>
                <p className="text-amber-100 text-sm">25+ years of experience in Vedic astrology</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-amber-900/20 to-yellow-900/20 border-2 border-amber-400/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Secure Payment</h3>
                <p className="text-amber-100 text-sm">100% secure UPI payment processing</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-amber-900/20 to-yellow-900/20 border-2 border-amber-400/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Quick Response</h3>
                <p className="text-amber-100 text-sm">Get consultation within 24 hours</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}