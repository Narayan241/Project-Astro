"use client";

import { Suspense, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MessageCircle,
  Video,
  Star,
  CheckCircle,
  ArrowRight,
  Shield,
  Zap,
} from "lucide-react";

function BookingPage() {
  const searchParams = useSearchParams();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [consultationMode, setConsultationMode] = useState("");
  const [question, setQuestion] = useState("");
  const [amount, setAmount] = useState(0);
  const [service, setService] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const spService = searchParams.get("service") || "";
    const spMode = searchParams.get("mode") || "";
    const spAmount = searchParams.get("amount") || "0";

    setService(spService);
    setConsultationMode(spMode);
    setAmount(Number(spAmount));
  }, [searchParams]);

  const handleSubmit = async () => {
    if (!name || !email || !phone || !dateOfBirth) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/book", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          phone,
          dateOfBirth,
          question,
          consultationMode,
          amount,
          service,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed.");

      alert("Booking Successful!");
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gray-900 border border-gray-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold flex items-center gap-3">
              <Star className="text-yellow-400" size={28} />
              Astrology Consultation Booking
            </CardTitle>
            <p className="text-gray-400 mt-2">
              Fill your details to book your personalized astrology reading
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* SERVICE DETAILS */}
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <CheckCircle className="text-green-400" /> Your Selection
              </h3>

              <div className="mt-3 space-y-2">
                <p className="flex justify-between">
                  <span className="text-gray-300">Service:</span>
                  <Badge>{service || "N/A"}</Badge>
                </p>

                <p className="flex justify-between">
                  <span className="text-gray-300">Consultation Mode:</span>
                  <Badge className="flex items-center gap-1">
                    {consultationMode === "chat" && <MessageCircle size={14} />}
                    {consultationMode === "call" && <Phone size={14} />}
                    {consultationMode === "video" && <Video size={14} />}
                    {consultationMode || "N/A"}
                  </Badge>
                </p>

                <p className="flex justify-between text-lg font-bold">
                  <span className="text-gray-300">Amount:</span>
                  <span className="text-green-400">₹{amount}</span>
                </p>
              </div>
            </div>

            {/* FORM */}
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  placeholder="Enter your name"
                  className="bg-gray-800"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  placeholder="Enter your email"
                  className="bg-gray-800"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <Label>Phone</Label>
                <Input
                  placeholder="Enter your phone number"
                  className="bg-gray-800"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  className="bg-gray-800"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>

              <div>
                <Label>Your Question (Optional)</Label>
                <Input
                  placeholder="Write your question"
                  className="bg-gray-800"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 text-lg flex items-center justify-center gap-2"
            >
              {loading ? "Processing..." : "Confirm Booking"}
              <ArrowRight size={20} />
            </Button>

            {/* SECURE BADGE */}
            <div className="flex items-center justify-center gap-2 text-gray-400 mt-2">
              <Shield size={16} /> 100% Secure & Private
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* WRAPPER FIX FOR VERCEL (required for useSearchParams) */
export default function BookingPageWrapper() {
  return (
    <Suspense fallback={<div className="text-white p-10 text-center">Loading...</div>}>
      <BookingPage />
    </Suspense>
  );
}