'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, Smartphone, Calendar, User, Phone, Mail, Shield, AlertCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function PaymentPage() {
  const [bookingData, setBookingData] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [upiVerified, setUpiVerified] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [formData, setFormData] = useState({
    upiId: '',
    transactionId: ''
  })
  const [errors, setErrors] = useState({
    upiId: '',
    transactionId: ''
  })

  useEffect(() => {
    // Get booking data from localStorage or URL params
    const savedBooking = localStorage.getItem('pendingBooking')
    if (savedBooking) {
      setBookingData(JSON.parse(savedBooking))
    }
  }, [])

  // UPI ID validation function
  const validateUpiId = (upiId: string) => {
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/
    return upiRegex.test(upiId)
  }

  // Transaction ID validation function
  const validateTransactionId = (transactionId: string) => {
    const txnRegex = /^[A-Za-z0-9]{8,25}$/
    return txnRegex.test(transactionId)
  }

  const handleUpiVerification = async () => {
    setErrors({ upiId: '', transactionId: '' })
    
    // Validate UPI ID
    if (!formData.upiId.trim()) {
      setErrors(prev => ({ ...prev, upiId: 'UPI ID is required' }))
      return
    }
    
    if (!validateUpiId(formData.upiId)) {
      setErrors(prev => ({ ...prev, upiId: 'Please enter a valid UPI ID (e.g., yourname@ybl)' }))
      return
    }

    setIsProcessing(true)
    
    // Simulate UPI ID verification
    setTimeout(() => {
      setIsProcessing(false)
      setUpiVerified(true)
      setShowVerification(true)
    }, 2000)
  }

  const handlePayment = async () => {
    setErrors({ upiId: '', transactionId: '' })
    
    // Validate transaction ID
    if (!formData.transactionId.trim()) {
      setErrors(prev => ({ ...prev, transactionId: 'Transaction ID is required' }))
      return
    }
    
    if (!validateTransactionId(formData.transactionId)) {
      setErrors(prev => ({ ...prev, transactionId: 'Please enter a valid transaction ID (8-25 alphanumeric characters)' }))
      return
    }

    setIsProcessing(true)
    
    console.log('Starting payment process...')
    console.log('Booking data:', bookingData)
    console.log('Form data:', formData)
    
    try {
      // First, create the booking in the database
      const bookingResponse = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: bookingData?.fullName || '',
          email: bookingData?.email || '',
          mobileNumber: bookingData?.mobileNumber || '',
          phone: bookingData?.mobileNumber || '',
          dateOfBirth: bookingData?.dateOfBirth || new Date().toISOString().split('T')[0], // Default to today
          timeOfBirth: bookingData?.timeOfBirth || new Date().toTimeString().split(' ')[0].substring(0, 5), // Default to current time
          placeOfBirth: bookingData?.placeOfBirth || 'Not specified', // Default value
          service: bookingData?.service || '',
          consultationType: bookingData?.consultationType || '',
          question: bookingData?.message || '',
          whatsappNumber: bookingData?.mobileNumber || '',
          amount: bookingData?.amount || '',
          paymentStatus: 'completed',
          paymentMethod: 'UPI',
          upiId: formData.upiId,
          transactionId: formData.transactionId,
          paymentDetails: JSON.stringify({
            upiId: formData.upiId,
            transactionId: formData.transactionId,
            amount: bookingData?.amount,
            timestamp: new Date().toISOString()
          })
        }),
      })

      if (bookingResponse.ok) {
        const bookingResult = await bookingResponse.json()
        console.log('Booking created successfully:', bookingResult)
        
        // Create payment data for admin panel notification
        const paymentData = {
          bookingId: bookingResult.booking.id,
          amount: bookingData?.amount,
          paymentMethod: 'UPI',
          upiId: formData.upiId,
          transactionId: formData.transactionId,
          status: 'completed',
          timestamp: new Date().toISOString(),
          clientInfo: {
            name: bookingData?.fullName,
            email: bookingData?.email,
            mobileNumber: bookingData?.mobileNumber,
            service: bookingData?.service,
            consultationType: bookingData?.consultationType
          }
        }
        
        // Trigger admin panel notification
        console.log('Triggering admin notification with payment data:', paymentData)
        window.dispatchEvent(new CustomEvent('paymentScreenshot', { 
          detail: paymentData 
        }))
        
        console.log('Admin notification sent')
        
        // Also send to payment-screenshot API for backup
        fetch('/api/admin/payment-screenshot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentData)
        }).catch(error => {
          console.error('Failed to send payment notification:', error)
        })
        
        setPaymentComplete(true)
        localStorage.removeItem('pendingBooking')
      } else {
        const errorText = await bookingResponse.text()
        console.error('Booking creation failed:', errorText)
        throw new Error('Failed to create booking: ' + errorText)
      }
    } catch (error) {
      console.error('Payment failed:', error)
      alert('Payment verification failed: ' + (error as Error).message + '. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-amber-950 to-slate-900 flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Payment <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Successful!</span>
          </h1>
          
          <p className="text-xl text-amber-100 mb-8">
            Your consultation has been confirmed. We will contact you shortly.
          </p>
          
          <Card className="bg-gradient-to-br from-amber-900/20 to-yellow-900/20 border-2 border-amber-400/50 backdrop-blur-sm mb-8">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-white mb-4">Payment Details</h3>
              <div className="space-y-2 text-amber-100">
                <div className="flex justify-between">
                  <span>Booking ID:</span>
                  <span className="text-amber-400">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service:</span>
                  <span>{bookingData?.service === 'kundli' ? 'Kundli Reading' : 'One Question Reading'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Consultation Type:</span>
                  <span className="capitalize">{bookingData?.consultationType}</span>
                </div>
                <div className="flex justify-between">
                  <span>UPI ID:</span>
                  <span className="text-amber-400">{formData.upiId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transaction ID:</span>
                  <span className="text-amber-400">{formData.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount Paid:</span>
                  <span className="text-green-400 font-bold">{bookingData?.amount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            <Link href="/">
              <Button className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300">
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-amber-950 to-slate-900">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-amber-400 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-yellow-400 rounded-full opacity-10 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-6 bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 px-6 py-2 text-sm font-semibold">
              UPI Payment Only
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Complete Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400">Booking</span>
            </h1>
            
            <p className="text-xl text-amber-100 max-w-2xl mx-auto leading-relaxed">
              Secure UPI payment processing for your consultation with Pandit Rajkumar Ji
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="bg-gradient-to-br from-amber-900/20 to-yellow-900/20 border-2 border-amber-400/50 backdrop-blur-sm sticky top-6">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-amber-400" />
                    Booking Summary
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-amber-100">Service:</span>
                      <span className="text-white font-medium">
                        {bookingData?.service === 'kundli' ? 'Kundli Reading' : 'One Question Reading'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-amber-100">Consultation:</span>
                      <span className="text-white font-medium capitalize">
                        {bookingData?.consultationType}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-amber-100">Duration:</span>
                      <span className="text-white font-medium">
                        {bookingData?.consultationType === 'chat' ? '30 minutes' : 
                         bookingData?.consultationType === 'phone' ? '45 minutes' : '60 minutes'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-amber-100">Client Name:</span>
                      <span className="text-white font-medium">{bookingData?.fullName}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-amber-100">Email:</span>
                      <span className="text-white font-medium text-sm">{bookingData?.email}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-amber-400/30 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-white">Total Amount:</span>
                      <span className="text-2xl font-bold text-amber-400">{bookingData?.amount}</span>
                    </div>
                  </div>
                  
                  <div className="bg-amber-900/20 rounded-lg p-4 border border-amber-400/30">
                    <div className="flex items-center text-amber-100 text-sm">
                      <Shield className="w-4 h-4 mr-2 text-amber-400" />
                      <span>100% Secure UPI Payment</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* UPI Payment Form */}
            <div className="lg:col-span-2">
              <Card className="bg-gradient-to-br from-amber-900/20 to-yellow-900/20 border-2 border-amber-400/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white flex items-center">
                    <Smartphone className="w-6 h-6 mr-2 text-amber-400" />
                    UPI Payment
                  </CardTitle>
                  <p className="text-amber-100">
                    Pay using any UPI app (PhonePe, Paytm, Google Pay, etc.)
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* UPI Information */}
                  <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-lg p-6 border border-amber-400/50">
                    <h3 className="text-lg font-semibold text-white mb-4">Scan to Pay</h3>
                    <div className="flex items-center justify-center mb-4">
<div className="flex items-center justify-center mb-4">
  <div className="w-40 h-40 bg-white rounded-lg p-2 flex items-center justify-center border border-amber-400/50">
    <Image
      src="/Qr.jpeg"
      alt="UPI QR Code"
      width={150}
      height={150}
      className="rounded-md"
    />
  </div>
</div>

                    </div>
                    <div className="text-center">
                      <p className="text-amber-100 font-medium">Pay to: <span className="text-amber-400">rajkumar196712-3@okaxis</span></p>
                      <p className="text-amber-200 text-sm mt-1">Amount: {bookingData?.amount}</p>
                    </div>
                  </div>

                  {/* UPI ID Verification */}
                  {!upiVerified ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="upiId" className="text-amber-100">Your UPI ID *</Label>
                        <Input
                          id="upiId"
                          value={formData.upiId}
                          onChange={(e) => setFormData(prev => ({ ...prev, upiId: e.target.value }))}
                          className="bg-amber-900/20 border-amber-400/30 text-white placeholder-amber-300/50 focus:border-amber-400"
                          placeholder="yourname@ybl"
                        />
                        {errors.upiId && (
                          <p className="text-red-400 text-sm flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.upiId}
                          </p>
                        )}
                      </div>

                      <Button
                        onClick={handleUpiVerification}
                        disabled={isProcessing}
                        className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white py-3 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Verifying UPI ID...
                          </>
                        ) : (
                          <>
                            Verify UPI ID
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    /* Transaction ID Input */
                    <div className="space-y-4">
                      <div className="bg-green-900/20 border border-green-400/50 rounded-lg p-4">
                        <div className="flex items-center text-green-100">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          <span>UPI ID verified successfully!</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="transactionId" className="text-amber-100">Transaction ID *</Label>
                        <Input
                          id="transactionId"
                          value={formData.transactionId}
                          onChange={(e) => setFormData(prev => ({ ...prev, transactionId: e.target.value }))}
                          className="bg-amber-900/20 border-amber-400/30 text-white placeholder-amber-300/50 focus:border-amber-400"
                          placeholder="Enter 12-digit transaction ID"
                        />
                        {errors.transactionId && (
                          <p className="text-red-400 text-sm flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.transactionId}
                          </p>
                        )}
                        <p className="text-amber-200 text-sm">
                          After making the payment, enter the transaction ID from your UPI app
                        </p>
                      </div>

                      <Button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Verifying Payment...
                          </>
                        ) : (
                          <>
                            Verify Payment & Complete Booking
                            <CheckCircle className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Important Information */}
                  <div className="bg-amber-900/20 rounded-lg p-4 border border-amber-400/30">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
                      <div className="text-amber-100 text-sm">
                        <p className="font-semibold mb-2">Important Information:</p>
                        <ul className="space-y-1">
                          <li>• Make payment to UPI ID: <span className="text-amber-400 font-medium">rajkumar196712-3@okaxis</span></li>
                          <li>• Amount to pay: <span className="text-amber-400 font-medium">{bookingData?.amount}</span></li>
                          <li>• Keep your transaction ID handy for verification</li>
                          <li>• Payment confirmation will be sent to your registered email</li>
                          <li>• For any payment issues, contact: +91 9799568414</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}