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
      paymentDetails
    } = body

    // ---------- VALIDATION ----------
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    if (!fullName) {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 }
      )
    }

    // ---------- AMOUNT CALCULATION ----------
    let amount = "₹0"

    if (service === "kundli") {
      amount = "₹2100"
    } else if (service === "question") {
      if (consultationType === "chat") amount = "₹500"
      if (consultationType === "phone") amount = "₹1100"
      if (consultationType === "video") amount = "₹1600"
    }

    // ---------- DATA PREP ----------
    const bookingData = {
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
      amount,
      paymentStatus: paymentStatus || "pending",
      paymentMethod: paymentMethod || null,
      upiId: upiId || null,
      transactionId: transactionId || null,
      paymentDetails: paymentDetails
        ? (typeof paymentDetails === "string"
            ? paymentDetails
            : JSON.stringify(paymentDetails))
        : null
    }

    // ---------- CREATE BOOKING ----------
    const booking = await db.booking.create({
      data: bookingData
    })

    return NextResponse.json({
      success: true,
      booking
    })

  } catch (error) {
    console.error("Booking creation error:", error)
    return NextResponse.json(
      { error: "Failed to create booking" },
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
    console.error("Bookings fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    )
  }
}
