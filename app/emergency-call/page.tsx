"use client"

import { useState } from "react"
import { ArrowLeft, Phone, Heart, MessageCircle, PhoneCall } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { sendNotification } from "../notifications/notification-system"

interface EmergencyCallProps {
  currentUser: string
  onBack: () => void
}

export default function EmergencyCall({ currentUser, onBack }: EmergencyCallProps) {
  const [emergencyNumber, setEmergencyNumber] = useState("")
  const [isNumberSaved, setIsNumberSaved] = useState(false)

  // Load saved number on component mount
  useState(() => {
    const savedNumber = localStorage.getItem(`emergency_${currentUser}`)
    if (savedNumber) {
      setEmergencyNumber(savedNumber)
      setIsNumberSaved(true)
    }
  })

  const saveEmergencyNumber = () => {
    if (emergencyNumber.trim()) {
      localStorage.setItem(`emergency_${currentUser}`, emergencyNumber)
      setIsNumberSaved(true)
    }
  }

  const makeEmergencyCall = () => {
    if (emergencyNumber) {
      // Create a tel: link to initiate the call
      window.location.href = `tel:${emergencyNumber}`
      sendNotification("emergency", currentUser, "called", `Emergency call made to ${emergencyNumber}`)
    }
  }

  const sendQuickMessage = (message: string) => {
    if (emergencyNumber) {
      // Create an SMS link with pre-filled message
      const encodedMessage = encodeURIComponent(message)
      window.location.href = `sms:${emergencyNumber}?body=${encodedMessage}`
      sendNotification("emergency", currentUser, "messaged", `Quick message sent: "${message.substring(0, 50)}..."`)
    }
  }

  const quickMessages = [
    "Hey, I need to talk to you. Can you call me when you get this? 💙",
    "I'm feeling a bit overwhelmed right now. Could use your voice.",
    "Missing you extra today. Call me when you can? ❤️",
    "Having a tough moment. Your support would mean everything right now.",
    "Can we talk? I just need to hear your voice.",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={onBack}
            variant="outline"
            size="icon"
            className="border-blue-500/30 text-blue-200 hover:bg-blue-500/20"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Emergency Contact</h1>
            <p className="text-blue-200">Quick access to reach your loved one</p>
          </div>
        </div>

        {/* Emergency Number Setup */}
        {!isNumberSaved && (
          <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle className="text-white">Set Emergency Contact</CardTitle>
              <CardDescription className="text-blue-200">
                Add your partner's phone number for quick access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-blue-200">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={emergencyNumber}
                  onChange={(e) => setEmergencyNumber(e.target.value)}
                  className="bg-slate-700/50 border-blue-500/30 text-white placeholder:text-slate-400"
                  placeholder="Enter phone number (e.g., +1234567890)"
                />
              </div>
              <Button
                onClick={saveEmergencyNumber}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!emergencyNumber.trim()}
              >
                Save Emergency Contact
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Emergency Actions */}
        {isNumberSaved && (
          <>
            <Alert className="bg-red-500/20 border-red-500/30 mb-6">
              <Heart className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-200">Emergency contact saved: {emergencyNumber}</AlertDescription>
            </Alert>

            {/* Quick Call */}
            <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <PhoneCall className="h-5 w-5 text-green-400" />
                  Emergency Call
                </CardTitle>
                <CardDescription className="text-blue-200">Call your loved one immediately</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={makeEmergencyCall}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6"
                >
                  <Phone className="h-6 w-6 mr-2" />
                  Call Now
                </Button>
              </CardContent>
            </Card>

            {/* Quick Messages */}
            <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-400" />
                  Quick Messages
                </CardTitle>
                <CardDescription className="text-blue-200">
                  Send a pre-written message to let them know you need support
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickMessages.map((message, index) => (
                  <button
                    key={index}
                    onClick={() => sendQuickMessage(message)}
                    className="w-full p-4 text-left bg-slate-700/50 hover:bg-slate-600/50 rounded-lg border border-slate-600 hover:border-blue-500/50 transition-colors"
                  >
                    <p className="text-white text-sm">{message}</p>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Settings */}
            <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Contact Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-blue-200">Current Contact:</span>
                  <span className="text-white font-mono">{emergencyNumber}</span>
                </div>
                <Button
                  onClick={() => setIsNumberSaved(false)}
                  variant="outline"
                  className="w-full border-blue-500/30 text-blue-200 hover:bg-blue-500/20"
                >
                  Change Contact Number
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {/* Support Message */}
        <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm mt-6">
          <CardContent className="p-6 text-center">
            <Heart className="h-6 w-6 text-pink-400 mx-auto mb-2" />
            <p className="text-blue-200 italic text-sm">
              "Remember, you're never alone. Reach out whenever you need support. 💙"
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
