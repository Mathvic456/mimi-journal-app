"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Upload, Mic, Play, Pause, Square, Trash2, Heart, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AdminVoiceNote {
  id: string
  title: string
  description: string
  audioUrl: string
  duration: number
  createdAt: string
  isAdmin: boolean
}

interface AdminDashboardProps {
  currentUser: string
  onBack: () => void
}

export default function AdminDashboard({ currentUser, onBack }: AdminDashboardProps) {
  const [adminNotes, setAdminNotes] = useState<AdminVoiceNote[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [newNote, setNewNote] = useState({
    title: "",
    description: "",
  })
  const [showForm, setShowForm] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioElementsRef = useRef<{ [key: string]: HTMLAudioElement }>({})
  const pendingAudioRef = useRef<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const savedAdminNotes = JSON.parse(localStorage.getItem("victor_voice_notes_for_mimi") || "[]")
    setAdminNotes(savedAdminNotes)
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        const audioUrl = URL.createObjectURL(audioBlob)
        pendingAudioRef.current = audioUrl
        setShowForm(true)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      alert("Could not access microphone. Please check permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("audio/")) {
      const audioUrl = URL.createObjectURL(file)
      pendingAudioRef.current = audioUrl

      const audio = new Audio(audioUrl)
      audio.onloadedmetadata = () => {
        setRecordingTime(Math.floor(audio.duration))
        setShowForm(true)
      }
    } else {
      alert("Please select a valid audio file.")
    }
  }

  const saveAdminNote = () => {
    if (!newNote.title.trim() || !pendingAudioRef.current) return

    const note: AdminVoiceNote = {
      id: Date.now().toString(),
      title: newNote.title,
      description: newNote.description,
      audioUrl: pendingAudioRef.current,
      duration: recordingTime,
      createdAt: new Date().toISOString(),
      isAdmin: true,
    }

    const updatedNotes = [note, ...adminNotes]
    setAdminNotes(updatedNotes)
    localStorage.setItem("victor_voice_notes_for_mimi", JSON.stringify(updatedNotes))
    // Also save to the general admin notes for Mimi to see
    localStorage.setItem("admin_voice_notes", JSON.stringify(updatedNotes))

    setNewNote({ title: "", description: "" })
    setShowForm(false)
    pendingAudioRef.current = null
    setRecordingTime(0)
  }

  const cancelSave = () => {
    if (pendingAudioRef.current) {
      URL.revokeObjectURL(pendingAudioRef.current)
      pendingAudioRef.current = null
    }
    setNewNote({ title: "", description: "" })
    setShowForm(false)
    setRecordingTime(0)
  }

  const playAudio = (noteId: string, audioUrl: string) => {
    Object.values(audioElementsRef.current).forEach((audio) => {
      audio.pause()
      audio.currentTime = 0
    })

    if (playingId === noteId) {
      setPlayingId(null)
      return
    }

    if (!audioElementsRef.current[noteId]) {
      audioElementsRef.current[noteId] = new Audio(audioUrl)
      audioElementsRef.current[noteId].onended = () => setPlayingId(null)
    }

    audioElementsRef.current[noteId].play()
    setPlayingId(noteId)
  }

  const deleteAdminNote = (noteId: string) => {
    const updatedNotes = adminNotes.filter((note) => note.id !== noteId)
    setAdminNotes(updatedNotes)
    localStorage.setItem("victor_voice_notes_for_mimi", JSON.stringify(updatedNotes))
    localStorage.setItem("admin_voice_notes", JSON.stringify(updatedNotes))

    if (audioElementsRef.current[noteId]) {
      audioElementsRef.current[noteId].pause()
      delete audioElementsRef.current[noteId]
    }

    if (playingId === noteId) {
      setPlayingId(null)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get relationship statistics
  const getRelationshipStats = () => {
    const victorJournals = JSON.parse(localStorage.getItem("journal_victor") || "[]")
    const mimiJournals = JSON.parse(localStorage.getItem("journal_mimi") || "[]")
    const victorMoods = JSON.parse(localStorage.getItem("moods_victor") || "[]")
    const mimiMoods = JSON.parse(localStorage.getItem("moods_mimi") || "[]")
    const victorCheckins = JSON.parse(localStorage.getItem("checkins_victor") || "[]")
    const mimiCheckins = JSON.parse(localStorage.getItem("checkins_mimi") || "[]")
    const coupleGoals = JSON.parse(localStorage.getItem("couple_goals") || "[]")
    const daysTogetherData = JSON.parse(localStorage.getItem("daysTogetherData") || '{"count": 0}')

    return {
      daysTogetherCount: daysTogetherData.count,
      victorJournalEntries: victorJournals.length,
      mimiJournalEntries: mimiJournals.length,
      victorMoodEntries: victorMoods.length,
      mimiMoodEntries: mimiMoods.length,
      victorCheckins: victorCheckins.length,
      mimiCheckins: mimiCheckins.length,
      totalGoals: coupleGoals.length,
      completedGoals: coupleGoals.filter((g: any) => g.completed).length,
      voiceNotesForMimi: adminNotes.length,
    }
  }

  const stats = getRelationshipStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4">
      <div className="max-w-6xl mx-auto">
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
            <h1 className="text-3xl font-bold text-white">Victor's Dashboard</h1>
            <p className="text-blue-200">Manage voice messages for Mimi and view your journey together</p>
          </div>
        </div>

        <Tabs defaultValue="voice-notes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
            <TabsTrigger value="voice-notes" className="data-[state=active]:bg-blue-600">
              Voice Messages for Mimi
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600">
              Our Journey
            </TabsTrigger>
          </TabsList>

          <TabsContent value="voice-notes" className="space-y-6">
            {/* Upload/Record Section */}
            <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Create Voice Message for Mimi</CardTitle>
                <CardDescription className="text-blue-200">
                  Record or upload voice messages that Mimi can listen to anytime
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showForm ? (
                  <div className="space-y-4">
                    {isRecording && (
                      <div className="text-center">
                        <div className="text-red-400 text-lg font-mono mb-2">
                          🔴 Recording for Mimi: {formatTime(recordingTime)}
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
                          <div
                            className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min((recordingTime / 60) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-center gap-4">
                      {!isRecording ? (
                        <>
                          <Button onClick={startRecording} className="bg-red-600 hover:bg-red-700 text-white">
                            <Mic className="h-4 w-4 mr-2" />
                            Record for Mimi
                          </Button>
                          <Button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Audio
                          </Button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="audio/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </>
                      ) : (
                        <Button onClick={stopRecording} className="bg-slate-600 hover:bg-slate-700 text-white">
                          <Square className="h-4 w-4 mr-2" />
                          Stop Recording
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center text-green-400 mb-4">
                      ✅ Audio ready for Mimi! ({formatTime(recordingTime)})
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="noteTitle" className="text-blue-200">
                        Title
                      </Label>
                      <Input
                        id="noteTitle"
                        value={newNote.title}
                        onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                        className="bg-slate-700/50 border-blue-500/30 text-white placeholder:text-slate-400"
                        placeholder="e.g., Good morning beautiful, Bedtime story for Mimi..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="noteDescription" className="text-blue-200">
                        Message for Mimi
                      </Label>
                      <Textarea
                        id="noteDescription"
                        value={newNote.description}
                        onChange={(e) => setNewNote({ ...newNote, description: e.target.value })}
                        className="bg-slate-700/50 border-blue-500/30 text-white placeholder:text-slate-400"
                        placeholder="Tell Mimi what this voice message is about..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={saveAdminNote}
                        disabled={!newNote.title.trim()}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Save for Mimi
                      </Button>
                      <Button
                        onClick={cancelSave}
                        variant="outline"
                        className="border-blue-500/30 text-blue-200 hover:bg-blue-500/20"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Voice Messages List */}
            <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Voice Messages for Mimi</CardTitle>
                <CardDescription className="text-blue-200">Messages that Mimi can listen to anytime</CardDescription>
              </CardHeader>
              <CardContent>
                {adminNotes.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-pink-400 mx-auto mb-4" />
                    <p className="text-slate-400">No voice messages for Mimi yet</p>
                    <p className="text-slate-500 text-sm">Record your first loving message above!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {adminNotes.map((note) => (
                      <div key={note.id} className="p-4 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-white font-medium mb-1">{note.title}</h4>
                            {note.description && <p className="text-slate-300 text-sm mb-2">{note.description}</p>}
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                              <span>{formatTime(note.duration)}</span>
                              <span>•</span>
                              <span>{formatDate(note.createdAt)}</span>
                              <span>•</span>
                              <span className="text-pink-400">💕 For Mimi</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => playAudio(note.id, note.audioUrl)}
                              variant="outline"
                              size="icon"
                              className="border-blue-500/30 text-blue-200 hover:bg-blue-500/20"
                            >
                              {playingId === note.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                            <Button
                              onClick={() => deleteAdminNote(note.id)}
                              variant="outline"
                              size="icon"
                              className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Relationship Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-pink-200 text-sm">Days Together</p>
                      <p className="text-3xl font-bold text-white">{stats.daysTogetherCount}</p>
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
                      <p className="text-blue-200 text-sm">Your Journal Entries</p>
                      <p className="text-2xl font-bold text-white">{stats.victorJournalEntries}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-200 text-sm">Mimi's Journal Entries</p>
                      <p className="text-2xl font-bold text-white">{stats.mimiJournalEntries}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-pink-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-200 text-sm">Your Check-ins</p>
                      <p className="text-2xl font-bold text-white">{stats.victorCheckins}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-200 text-sm">Mimi's Check-ins</p>
                      <p className="text-2xl font-bold text-white">{stats.mimiCheckins}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-200 text-sm">Our Goals</p>
                      <p className="text-2xl font-bold text-white">
                        {stats.completedGoals}/{stats.totalGoals}
                      </p>
                    </div>
                    <Heart className="h-8 w-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Journey Overview */}
            <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Your Journey Together</CardTitle>
                <CardDescription className="text-blue-200">Beautiful moments you're creating together</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded">
                    <span className="text-blue-200">Total Shared Moments</span>
                    <span className="text-white font-medium">
                      {stats.victorJournalEntries +
                        stats.mimiJournalEntries +
                        stats.victorCheckins +
                        stats.mimiCheckins +
                        stats.totalGoals}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded">
                    <span className="text-blue-200">Voice Messages for Mimi</span>
                    <span className="text-white font-medium">{stats.voiceNotesForMimi}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded">
                    <span className="text-blue-200">Goals Achievement Rate</span>
                    <span className="text-white font-medium">
                      {stats.totalGoals > 0 ? Math.round((stats.completedGoals / stats.totalGoals) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded">
                    <span className="text-blue-200">Most Active</span>
                    <span className="text-white font-medium">
                      {stats.victorJournalEntries + stats.victorCheckins >=
                      stats.mimiJournalEntries + stats.mimiCheckins
                        ? "Victor"
                        : "Mimi"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
