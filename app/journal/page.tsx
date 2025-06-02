"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Plus, Calendar, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { sendNotification } from "../notifications/notification-system"

interface JournalEntry {
  id: string
  title: string
  content: string
  date: string
  mood: string
}

interface JournalProps {
  currentUser: string
  onBack: () => void
}

export default function Journal({ currentUser, onBack }: JournalProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [isWriting, setIsWriting] = useState(false)
  const [newEntry, setNewEntry] = useState({ title: "", content: "", mood: "" })

  useEffect(() => {
    const savedEntries = JSON.parse(localStorage.getItem(`journal_${currentUser}`) || "[]")
    setEntries(savedEntries)
  }, [currentUser])

  const saveEntry = () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) return

    const entry: JournalEntry = {
      id: Date.now().toString(),
      title: newEntry.title,
      content: newEntry.content,
      mood: newEntry.mood,
      date: new Date().toISOString(),
    }

    const updatedEntries = [entry, ...entries]
    setEntries(updatedEntries)
    localStorage.setItem(`journal_${currentUser}`, JSON.stringify(updatedEntries))
    sendNotification("journal", currentUser, "wrote", `New journal entry: "${entry.title}"`)

    setNewEntry({ title: "", content: "", mood: "" })
    setIsWriting(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
            <h1 className="text-3xl font-bold text-white">Your Journal</h1>
            <p className="text-blue-200">A safe space for your thoughts, {currentUser}</p>
          </div>
        </div>

        {/* New Entry Button */}
        {!isWriting && (
          <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm mb-6">
            <CardContent className="p-6">
              <Button onClick={() => setIsWriting(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Write New Entry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* New Entry Form */}
        {isWriting && (
          <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle className="text-white">New Journal Entry</CardTitle>
              <CardDescription className="text-blue-200">Express your thoughts and feelings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-blue-200">
                  Title
                </Label>
                <Input
                  id="title"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                  className="bg-slate-700/50 border-blue-500/30 text-white placeholder:text-slate-400"
                  placeholder="Give your entry a title..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mood" className="text-blue-200">
                  Current Mood
                </Label>
                <Input
                  id="mood"
                  value={newEntry.mood}
                  onChange={(e) => setNewEntry({ ...newEntry, mood: e.target.value })}
                  className="bg-slate-700/50 border-blue-500/30 text-white placeholder:text-slate-400"
                  placeholder="How are you feeling? (e.g., happy, thoughtful, grateful)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content" className="text-blue-200">
                  Your Thoughts
                </Label>
                <Textarea
                  id="content"
                  value={newEntry.content}
                  onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                  className="bg-slate-700/50 border-blue-500/30 text-white placeholder:text-slate-400 min-h-[200px]"
                  placeholder="Write your thoughts here..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={saveEntry} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Save Entry
                </Button>
                <Button
                  onClick={() => setIsWriting(false)}
                  variant="outline"
                  className="border-blue-500/30 text-blue-200 hover:bg-blue-500/20"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Journal Entries */}
        <div className="space-y-4">
          {entries.length === 0 ? (
            <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <Heart className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No entries yet</h3>
                <p className="text-blue-200">Start writing your first journal entry!</p>
              </CardContent>
            </Card>
          ) : (
            entries.map((entry) => (
              <Card key={entry.id} className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white">{entry.title}</CardTitle>
                      <CardDescription className="text-blue-200 flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(entry.date)}
                        {entry.mood && (
                          <>
                            <span>•</span>
                            <span className="text-yellow-400">Mood: {entry.mood}</span>
                          </>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-200 whitespace-pre-wrap">{entry.content}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
