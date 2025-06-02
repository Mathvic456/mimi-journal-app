"use client"

import { useState, useEffect } from "react"
import { BookOpen, Heart, Phone, Smile, LogOut, Calendar, Mic, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Journal from "../journal/page"
import Affirmations from "../affirmations/page"
import MoodTracker from "../mood-tracker/page"
import EmergencyCall from "../emergency-call/page"
import DailyCheckin from "../daily-checkin/page"
import CoupleGoals from "../couple-goals/page"
import VoiceNotes from "../voice-notes/page"
// import AdminDashboard from "../admin/page"
import LoveLetters from "../love-letters/page"
import NotificationSystem from "../notifications/notification-system"

interface DashboardProps {
  currentUser: string
  setIsAuthenticated: (auth: boolean) => void
}

export default function Dashboard({ currentUser, setIsAuthenticated }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [recentEntries, setRecentEntries] = useState(0)
  const [currentMood, setCurrentMood] = useState("")
  const [daysTogetherCount, setDaysTogetherCount] = useState(0)
  const [partnerLoggedInToday, setPartnerLoggedInToday] = useState(false)

  useEffect(() => {
    // Get recent journal entries count
    const entries = JSON.parse(localStorage.getItem(`journal_${currentUser}`) || "[]")
    setRecentEntries(entries.length)

    // Get current mood
    const moods = JSON.parse(localStorage.getItem(`moods_${currentUser}`) || "[]")
    if (moods.length > 0) {
      setCurrentMood(moods[moods.length - 1].mood)
    }

    // Get days together count
    const daysTogetherData = JSON.parse(localStorage.getItem("daysTogetherData") || '{"count": 0}')
    setDaysTogetherCount(daysTogetherData.count)

    // Check if partner logged in today
    const today = new Date().toDateString()
    const partner = currentUser.toLowerCase() === "victor" ? "mimi" : "victor"
    const partnerLogin = localStorage.getItem(`lastLogin_${partner}`)
    setPartnerLoggedInToday(partnerLogin === today)
  }, [currentUser])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    setIsAuthenticated(false)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    const name = currentUser.charAt(0).toUpperCase() + currentUser.slice(1)

    if (hour < 12) return `Good morning, ${name}! ☀️`
    if (hour < 17) return `Good afternoon, ${name}! 🌤️`
    return `Good evening, ${name}! 🌙`
  }

  const getPartnerName = () => {
    return currentUser.toLowerCase() === "victor" ? "Mimi" : "Victor"
  }

  if (activeTab === "journal") {
    return <Journal currentUser={currentUser} onBack={() => setActiveTab("dashboard")} />
  }

  if (activeTab === "affirmations") {
    return <Affirmations currentUser={currentUser} onBack={() => setActiveTab("dashboard")} />
  }

  if (activeTab === "mood-tracker") {
    return <MoodTracker currentUser={currentUser} onBack={() => setActiveTab("dashboard")} />
  }

  if (activeTab === "emergency-call") {
    return <EmergencyCall currentUser={currentUser} onBack={() => setActiveTab("dashboard")} />
  }

  if (activeTab === "daily-checkin") {
    return <DailyCheckin currentUser={currentUser} onBack={() => setActiveTab("dashboard")} />
  }

  if (activeTab === "couple-goals") {
    return <CoupleGoals currentUser={currentUser} onBack={() => setActiveTab("dashboard")} />
  }

  if (activeTab === "voice-notes") {
    return <VoiceNotes currentUser={currentUser} onBack={() => setActiveTab("dashboard")} />
  }

  if (activeTab === "love-letters") {
    return <LoveLetters currentUser={currentUser} onBack={() => setActiveTab("dashboard")} />
  }


  // return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{getGreeting()}</h1>
            <p className="text-blue-200">Welcome to your safe space with {getPartnerName()} 💙</p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationSystem currentUser={currentUser} />
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-blue-500/30 text-blue-200 hover:bg-blue-500/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Partner Status */}
        <Card
          className={`mb-6 ${partnerLoggedInToday ? "bg-green-500/20 border-green-500/30" : "bg-orange-500/20 border-orange-500/30"} backdrop-blur-sm`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className={`h-5 w-5 ${partnerLoggedInToday ? "text-green-400" : "text-orange-400"}`} />
                <span className={`font-medium ${partnerLoggedInToday ? "text-green-200" : "text-orange-200"}`}>
                  {partnerLoggedInToday
                    ? `${getPartnerName()} has logged in today! 💕`
                    : `Waiting for ${getPartnerName()} to log in today...`}
                </span>
              </div>
              {partnerLoggedInToday && <span className="text-green-300 text-sm">✨ Both connected today!</span>}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-200 text-sm">Days Together</p>
                  <p className="text-3xl font-bold text-white">{daysTogetherCount}</p>
                  <p className="text-pink-300 text-xs">Every login counts! 💕</p>
                </div>
                <Heart className="h-8 w-8 text-pink-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">Journal Entries</p>
                  <p className="text-2xl font-bold text-white">{recentEntries}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">Current Mood</p>
                  <p className="text-2xl font-bold text-white">{currentMood || "Not set"}</p>
                </div>
                <Smile className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm cursor-pointer hover:bg-slate-700/50 transition-colors"
            onClick={() => setActiveTab("journal")}
          >
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-400" />
                Personal Journal
              </CardTitle>
              <CardDescription className="text-blue-200">Your private thoughts and feelings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Open Journal</Button>
            </CardContent>
          </Card>

          <Card
            className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm cursor-pointer hover:bg-slate-700/50 transition-colors"
            onClick={() => setActiveTab("affirmations")}
          >
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-400" />
                {currentUser.toLowerCase() === "mimi" ? "Sweet Affirmations" : "Messages for Mimi"}
              </CardTitle>
              <CardDescription className="text-blue-200">
                {currentUser.toLowerCase() === "mimi" ? "Loving messages just for you" : "Send love to Mimi"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white">
                {currentUser.toLowerCase() === "mimi" ? "Get Affirmations" : "Send Love"}
              </Button>
            </CardContent>
          </Card>

          <Card
            className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm cursor-pointer hover:bg-slate-700/50 transition-colors"
            onClick={() => setActiveTab("mood-tracker")}
          >
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Smile className="h-5 w-5 text-yellow-400" />
                Mood Tracker
              </CardTitle>
              <CardDescription className="text-blue-200">Track your daily emotions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">Track Mood</Button>
            </CardContent>
          </Card>

          <Card
            className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm cursor-pointer hover:bg-slate-700/50 transition-colors"
            onClick={() => setActiveTab("emergency-call")}
          >
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Phone className="h-5 w-5 text-red-400" />
                Call {getPartnerName()}
              </CardTitle>
              <CardDescription className="text-blue-200">Quick access when you need each other</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white">Emergency Contact</Button>
            </CardContent>
          </Card>

          <Card
            className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm cursor-pointer hover:bg-slate-700/50 transition-colors"
            onClick={() => setActiveTab("daily-checkin")}
          >
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-400" />
                Daily Check-in
              </CardTitle>
              <CardDescription className="text-blue-200">Share how your day is going</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">Daily Check-in</Button>
            </CardContent>
          </Card>

          <Card
            className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm cursor-pointer hover:bg-slate-700/50 transition-colors"
            onClick={() => setActiveTab("couple-goals")}
          >
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Heart className="h-5 w-5 text-purple-400" />
                Our Goals
              </CardTitle>
              <CardDescription className="text-blue-200">Dreams we're building together</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">View Our Goals</Button>
            </CardContent>
          </Card>

          <Card
            className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm cursor-pointer hover:bg-slate-700/50 transition-colors"
            onClick={() => setActiveTab("voice-notes")}
          >
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Mic className="h-5 w-5 text-indigo-400" />
                Voice Messages
              </CardTitle>
              <CardDescription className="text-blue-200">Hear each other's voices</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">Voice Messages</Button>
            </CardContent>
          </Card>

          <Card
            className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm cursor-pointer hover:bg-slate-700/50 transition-colors"
            onClick={() => setActiveTab("love-letters")}
          >
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-400" />
                Love Letters
              </CardTitle>
              <CardDescription className="text-blue-200">Write and exchange heartfelt letters</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white">Love Letters</Button>
            </CardContent>
          </Card>

          {currentUser.toLowerCase() === "victor" && (
            <Card
              className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm cursor-pointer hover:bg-slate-700/50 transition-colors"
              onClick={() => setActiveTab("admin")}
            >
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5 text-orange-400" />
                  Victor's Settings
                </CardTitle>
                <CardDescription className="text-blue-200">Manage voice messages for Mimi</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">Settings</Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Love Message */}
        <Card className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-500/20 backdrop-blur-sm mt-8">
          <CardContent className="p-6 text-center">
            <Heart className="h-6 w-6 text-pink-400 mx-auto mb-2" />
            <p className="text-pink-200 italic">
              {currentUser.toLowerCase() === "victor"
                ? "Every moment with Mimi is a treasure. This is our space to grow together. 💙"
                : "Victor, you make every day brighter. This is our safe haven of love. 💕"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
}
