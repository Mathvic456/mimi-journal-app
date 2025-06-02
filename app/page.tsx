"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Dashboard from "./dashboard/page"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (user && (user.toLowerCase() === "victor" || user.toLowerCase() === "mimi")) {
      setCurrentUser(user)
      setIsAuthenticated(true)
      // Track daily login
      trackDailyLogin(user)
    }
  }, [])

  const trackDailyLogin = (user: string) => {
    const today = new Date().toDateString()
    const lastLogin = localStorage.getItem(`lastLogin_${user}`)

    if (lastLogin !== today) {
      // New day login
      localStorage.setItem(`lastLogin_${user}`, today)

      // Get current days together count
      const daysTogetherData = JSON.parse(
        localStorage.getItem("daysTogetherData") || '{"count": 0, "startDate": null, "lastUpdate": null}',
      )

      // If this is the first login ever, set start date
      if (!daysTogetherData.startDate) {
        daysTogetherData.startDate = today
        daysTogetherData.count = 1
      } else {
        // Check if both users have logged in today
        const victorLogin = localStorage.getItem("lastLogin_victor")
        const mimiLogin = localStorage.getItem("lastLogin_mimi")

        if (victorLogin === today && mimiLogin === today && daysTogetherData.lastUpdate !== today) {
          // Both logged in today and we haven't counted this day yet
          daysTogetherData.count += 1
          daysTogetherData.lastUpdate = today
        }
      }

      localStorage.setItem("daysTogetherData", JSON.stringify(daysTogetherData))
    }
  }

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()

    // Only allow Victor and Mimi
    const validUsers = {
      victor: "love2024",
      mimi: "sweetheart2024",
    }

    const userKey = username.toLowerCase() as keyof typeof validUsers

    if (validUsers[userKey] && validUsers[userKey] === password) {
      localStorage.setItem("currentUser", username)
      setCurrentUser(username)
      setIsAuthenticated(true)
      trackDailyLogin(username)
    } else {
      alert("Invalid credentials. This app is only for Victor and Mimi 💙")
    }
  }

  if (isAuthenticated) {
    return <Dashboard currentUser={currentUser} setIsAuthenticated={setIsAuthenticated} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-blue-500/20 rounded-full">
              <Heart className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">Victor & Mimi's Space</CardTitle>
          <CardDescription className="text-blue-200">
            Our private sanctuary for love, thoughts, and memories 💙
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-blue-200">
                Who are you?
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-slate-700/50 border-blue-500/30 text-white placeholder:text-slate-400"
                placeholder="Victor or Mimi"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-blue-200">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-700/50 border-blue-500/30 text-white placeholder:text-slate-400"
                placeholder="Enter your special password"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Enter Our Space
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-blue-300 text-sm italic">
              "Every day we log in together is another day of our beautiful journey 💕"
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
