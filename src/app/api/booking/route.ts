import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      fullName,
      email,
      mobileNumber,
      phone,
      dateOfBirth,
      timeOfBirth,
      placeOfBirth,
      service,
      consultationType,
      question,
      whatsappNumber,
      paymentStatus,
      paymentMethod,
      upiId,
      transactionId,
      paymentDetails,
      amount
    } = body

    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 })
    if (!fullName) return NextResponse.json({ error: "Full name is required" }, { status: 400 })

    // Final amount calculation
    let finalAmount = amount || "₹0"
    if (service === "kundli") finalAmount = "₹2100"
    if (service === "question") {
      if (consultationType === "chat") finalAmount = "₹500"
      if (consultationType === "phone") finalAmount = "₹1100"
      if (consultationType === "video") finalAmount = "₹1600"
    }

    const booking = await db.booking.create({
      data: {
        fullName,
        email,
        mobileNumber: mobileNumber || null,
        phone: phone || null,
        dateOfBirth,
        timeOfBirth,
        placeOfBirth,
        service,
        consultationType,
        question: question || null,
        whatsappNumber: whatsappNumber || null,
        amount: finalAmount,
        paymentStatus: paymentStatus || "pending",
        paymentMethod: paymentMethod || null,
        upiId: upiId || null,
        transactionId: transactionId || null,
        paymentDetails: paymentDetails ? JSON.stringify(paymentDetails) : null
      }
    })

    return NextResponse.json({ success: true, booking })

  } catch (error: any) {
    console.error("Booking creation error:", error)
    return NextResponse.json(
      { error: "Failed to create booking", details: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const bookings = await db.booking.findMany({
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(bookings)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}
