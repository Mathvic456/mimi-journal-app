"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Calendar, Heart, Droplets, Moon, Sun, Coffee, Utensils } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { sendNotification } from "../notifications/notification-system"

interface CheckinEntry {
  id: string
  date: string
  mood: number
  energy: number
  sleep: number
  stress: number
  water: number
  meals: number
  exercise: boolean
  gratitude: string
  note: string
}

interface DailyCheckinProps {
  currentUser: string
  onBack: () => void
}

export default function DailyCheckin({ currentUser, onBack }: DailyCheckinProps) {
  const [checkins, setCheckins] = useState<CheckinEntry[]>([])
  const [todayCheckin, setTodayCheckin] = useState<CheckinEntry | null>(null)
  const [isCheckinMode, setIsCheckinMode] = useState(false)
  const [formData, setFormData] = useState({
    mood: [7],
    energy: [7],
    sleep: [7],
    stress: [3],
    water: [6],
    meals: [3],
    exercise: false,
    gratitude: "",
    note: "",
  })

  useEffect(() => {
    const savedCheckins = JSON.parse(localStorage.getItem(`checkins_${currentUser}`) || "[]")
    setCheckins(savedCheckins)

    // Check if user already checked in today
    const today = new Date().toDateString()
    const todayEntry = savedCheckins.find((entry: CheckinEntry) => new Date(entry.date).toDateString() === today)
    setTodayCheckin(todayEntry || null)
  }, [currentUser])

  const saveCheckin = () => {
    const entry: CheckinEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      mood: formData.mood[0],
      energy: formData.energy[0],
      sleep: formData.sleep[0],
      stress: formData.stress[0],
      water: formData.water[0],
      meals: formData.meals[0],
      exercise: formData.exercise,
      gratitude: formData.gratitude,
      note: formData.note,
    }

    const updatedCheckins = [
      entry,
      ...checkins.filter((c) => new Date(c.date).toDateString() !== new Date().toDateString()),
    ]

    setCheckins(updatedCheckins)
    localStorage.setItem(`checkins_${currentUser}`, JSON.stringify(updatedCheckins))
    sendNotification("checkin", currentUser, "completed", `Daily check-in completed - Mood: ${formData.mood[0]}/10`)
    setTodayCheckin(entry)
    setIsCheckinMode(false)
  }

  const getWeeklyAverage = (field: keyof CheckinEntry) => {
    const lastWeek = checkins.slice(0, 7)
    if (lastWeek.length === 0) return 0
    const sum = lastWeek.reduce((acc, entry) => acc + (entry[field] as number), 0)
    return Math.round(sum / lastWeek.length)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
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
            <h1 className="text-3xl font-bold text-white">Daily Check-in</h1>
            <p className="text-blue-200">How are you feeling today, {currentUser}?</p>
          </div>
        </div>

        {/* Today's Status */}
        {todayCheckin ? (
          <Card className="bg-green-500/20 border-green-500/30 backdrop-blur-sm mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-5 w-5 text-green-400" />
                <span className="text-green-200 font-medium">You've checked in today!</span>
              </div>
              <p className="text-green-100 text-sm">
                Mood: {todayCheckin.mood}/10 • Energy: {todayCheckin.energy}/10 • Sleep: {todayCheckin.sleep}/10
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm mb-6">
            <CardContent className="p-6">
              <Button
                onClick={() => setIsCheckinMode(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Start Today's Check-in
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Check-in Form */}
        {isCheckinMode && (
          <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle className="text-white">Daily Wellness Check-in</CardTitle>
              <CardDescription className="text-blue-200">Take a moment to reflect on your day</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mood */}
              <div className="space-y-3">
                <Label className="text-blue-200 flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Mood (1-10): {formData.mood[0]}
                </Label>
                <Slider
                  value={formData.mood}
                  onValueChange={(value) => setFormData({ ...formData, mood: value })}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Energy */}
              <div className="space-y-3">
                <Label className="text-blue-200 flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  Energy Level (1-10): {formData.energy[0]}
                </Label>
                <Slider
                  value={formData.energy}
                  onValueChange={(value) => setFormData({ ...formData, energy: value })}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Sleep */}
              <div className="space-y-3">
                <Label className="text-blue-200 flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  Sleep Quality (1-10): {formData.sleep[0]}
                </Label>
                <Slider
                  value={formData.sleep}
                  onValueChange={(value) => setFormData({ ...formData, sleep: value })}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Stress */}
              <div className="space-y-3">
                <Label className="text-blue-200 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Stress Level (1-10): {formData.stress[0]}
                </Label>
                <Slider
                  value={formData.stress}
                  onValueChange={(value) => setFormData({ ...formData, stress: value })}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Water */}
              <div className="space-y-3">
                <Label className="text-blue-200 flex items-center gap-2">
                  <Droplets className="h-4 w-4" />
                  Glasses of Water: {formData.water[0]}
                </Label>
                <Slider
                  value={formData.water}
                  onValueChange={(value) => setFormData({ ...formData, water: value })}
                  max={12}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Meals */}
              <div className="space-y-3">
                <Label className="text-blue-200 flex items-center gap-2">
                  <Utensils className="h-4 w-4" />
                  Meals Eaten: {formData.meals[0]}
                </Label>
                <Slider
                  value={formData.meals}
                  onValueChange={(value) => setFormData({ ...formData, meals: value })}
                  max={5}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Exercise */}
              <div className="space-y-3">
                <Label className="text-blue-200 flex items-center gap-2">
                  <Coffee className="h-4 w-4" />
                  Did you exercise today?
                </Label>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setFormData({ ...formData, exercise: true })}
                    variant={formData.exercise ? "default" : "outline"}
                    className={
                      formData.exercise ? "bg-green-600 hover:bg-green-700" : "border-blue-500/30 text-blue-200"
                    }
                  >
                    Yes
                  </Button>
                  <Button
                    onClick={() => setFormData({ ...formData, exercise: false })}
                    variant={!formData.exercise ? "default" : "outline"}
                    className={!formData.exercise ? "bg-red-600 hover:bg-red-700" : "border-blue-500/30 text-blue-200"}
                  >
                    No
                  </Button>
                </div>
              </div>

              {/* Gratitude */}
              <div className="space-y-2">
                <Label className="text-blue-200">What are you grateful for today?</Label>
                <Textarea
                  value={formData.gratitude}
                  onChange={(e) => setFormData({ ...formData, gratitude: e.target.value })}
                  className="bg-slate-700/50 border-blue-500/30 text-white placeholder:text-slate-400"
                  placeholder="Something that made you smile today..."
                  rows={2}
                />
              </div>

              {/* Note */}
              <div className="space-y-2">
                <Label className="text-blue-200">Additional notes</Label>
                <Textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="bg-slate-700/50 border-blue-500/30 text-white placeholder:text-slate-400"
                  placeholder="Anything else you'd like to remember about today..."
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={saveCheckin} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Save Check-in
                </Button>
                <Button
                  onClick={() => setIsCheckinMode(false)}
                  variant="outline"
                  className="border-blue-500/30 text-blue-200 hover:bg-blue-500/20"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weekly Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <p className="text-blue-200 text-sm">Avg Mood</p>
              <p className="text-2xl font-bold text-white">{getWeeklyAverage("mood")}/10</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <p className="text-blue-200 text-sm">Avg Energy</p>
              <p className="text-2xl font-bold text-white">{getWeeklyAverage("energy")}/10</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <p className="text-blue-200 text-sm">Avg Sleep</p>
              <p className="text-2xl font-bold text-white">{getWeeklyAverage("sleep")}/10</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <p className="text-blue-200 text-sm">Check-ins</p>
              <p className="text-2xl font-bold text-white">{checkins.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Check-ins */}
        <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Recent Check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            {checkins.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No check-ins yet. Start your wellness journey!</p>
            ) : (
              <div className="space-y-4">
                {checkins.slice(0, 7).map((checkin) => (
                  <div key={checkin.id} className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-white font-medium">{formatDate(checkin.date)}</span>
                      <div className="flex gap-4 text-sm text-slate-300">
                        <span>😊 {checkin.mood}</span>
                        <span>⚡ {checkin.energy}</span>
                        <span>😴 {checkin.sleep}</span>
                      </div>
                    </div>
                    {checkin.gratitude && <p className="text-blue-200 text-sm italic">"{checkin.gratitude}"</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
