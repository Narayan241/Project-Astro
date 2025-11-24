// app/booking/page.tsx
import { Suspense } from 'react'
import BookingContent from './BookingContent'

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-amber-950 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading your booking...</div>
      </div>
    }>
      <BookingContent />
    </Suspense>
  )
}