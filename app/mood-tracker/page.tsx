"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Calendar, TrendingUp, Smile, Meh } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { sendNotification } from "../notifications/notification-system"

interface MoodEntry {
  id: string
  mood: string
  emoji: string
  note: string
  date: string
}

interface MoodTrackerProps {
  currentUser: string
  onBack: () => void
}

const moodOptions = [
  { value: "amazing", emoji: "😍", label: "Amazing", color: "bg-green-500" },
  { value: "happy", emoji: "😊", label: "Happy", color: "bg-green-400" },
  { value: "good", emoji: "🙂", label: "Good", color: "bg-blue-400" },
  { value: "okay", emoji: "😐", label: "Okay", color: "bg-yellow-400" },
  { value: "low", emoji: "😔", label: "Low", color: "bg-orange-400" },
  { value: "sad", emoji: "😢", label: "Sad", color: "bg-red-400" },
  { value: "anxious", emoji: "😰", label: "Anxious", color: "bg-purple-400" },
  { value: "stressed", emoji: "😤", label: "Stressed", color: "bg-red-500" },
]

export default function MoodTracker({ currentUser, onBack }: MoodTrackerProps) {
  const [moods, setMoods] = useState<MoodEntry[]>([])
  const [selectedMood, setSelectedMood] = useState("")
  const [note, setNote] = useState("")
  const [isLogging, setIsLogging] = useState(false)

  useEffect(() => {
    const savedMoods = JSON.parse(localStorage.getItem(`moods_${currentUser}`) || "[]")
    setMoods(savedMoods)
  }, [currentUser])

  const logMood = () => {
    if (!selectedMood) return

    const moodOption = moodOptions.find((m) => m.value === selectedMood)
    if (!moodOption) return

    const entry: MoodEntry = {
      id: Date.now().toString(),
      mood: selectedMood,
      emoji: moodOption.emoji,
      note: note,
      date: new Date().toISOString(),
    }

    const updatedMoods = [entry, ...moods]
    setMoods(updatedMoods)
    localStorage.setItem(`moods_${currentUser}`, JSON.stringify(updatedMoods))
    sendNotification("mood", currentUser, "updated", `Mood: ${selectedMood} (${moodOption.label})`)

    setSelectedMood("")
    setNote("")
    setIsLogging(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getMoodStats = () => {
    const last7Days = moods.slice(0, 7)
    const moodCounts = last7Days.reduce(
      (acc, mood) => {
        acc[mood.mood] = (acc[mood.mood] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const mostCommon = Object.entries(moodCounts).sort(([, a], [, b]) => b - a)[0]
    return {
      totalEntries: last7Days.length,
      mostCommonMood: mostCommon ? mostCommon[0] : null,
    }
  }

  const stats = getMoodStats()

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
            <h1 className="text-3xl font-bold text-white">Mood Tracker</h1>
            <p className="text-blue-200">Track your emotional journey, {currentUser}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">Entries This Week</p>
                  <p className="text-2xl font-bold text-white">{stats.totalEntries}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">Most Common Mood</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.mostCommonMood
                      ? moodOptions.find((m) => m.value === stats.mostCommonMood)?.emoji +
                        " " +
                        moodOptions.find((m) => m.value === stats.mostCommonMood)?.label
                      : "None yet"}
                  </p>
                </div>
                <Smile className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Log Mood Button */}
        {!isLogging && (
          <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm mb-6">
            <CardContent className="p-6">
              <Button onClick={() => setIsLogging(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Log Current Mood
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Mood Logging Form */}
        {isLogging && (
          <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle className="text-white">How are you feeling?</CardTitle>
              <CardDescription className="text-blue-200">
                Select your current mood and add a note if you'd like
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {moodOptions.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedMood(mood.value)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedMood === mood.value
                        ? "border-blue-400 bg-blue-500/20"
                        : "border-slate-600 bg-slate-700/50 hover:border-slate-500"
                    }`}
                  >
                    <div className="text-2xl mb-2">{mood.emoji}</div>
                    <div className="text-white text-sm font-medium">{mood.label}</div>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="note" className="text-blue-200">
                  Note (optional)
                </Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="bg-slate-700/50 border-blue-500/30 text-white placeholder:text-slate-400"
                  placeholder="What's on your mind?"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={logMood} disabled={!selectedMood} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Log Mood
                </Button>
                <Button
                  onClick={() => setIsLogging(false)}
                  variant="outline"
                  className="border-blue-500/30 text-blue-200 hover:bg-blue-500/20"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mood History */}
        <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Mood History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {moods.length === 0 ? (
              <div className="text-center py-8">
                <Meh className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">No mood entries yet</p>
                <p className="text-slate-500 text-sm">Start tracking your moods to see patterns</p>
              </div>
            ) : (
              <div className="space-y-4">
                {moods.slice(0, 10).map((mood) => (
                  <div key={mood.id} className="flex items-start gap-4 p-4 bg-slate-700/30 rounded-lg">
                    <div className="text-2xl">{mood.emoji}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium capitalize">{mood.mood}</span>
                        <span className="text-slate-400 text-sm">{formatDate(mood.date)}</span>
                      </div>
                      {mood.note && <p className="text-slate-300 text-sm">{mood.note}</p>}
                    </div>
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
