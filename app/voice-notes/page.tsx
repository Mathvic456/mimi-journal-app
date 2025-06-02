"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Mic, Play, Pause, Square, Trash2, Send, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { sendNotification } from "../notifications/notification-system"

interface VoiceNote {
  id: string
  title: string
  audioUrl: string
  duration: number
  createdBy: string
  sentTo?: string
  createdAt: string
  isAdmin?: boolean
  isPersonal?: boolean
}

interface VoiceNotesProps {
  currentUser: string
  onBack: () => void
}

export default function VoiceNotes({ currentUser, onBack }: VoiceNotesProps) {
  const [myVoiceNotes, setMyVoiceNotes] = useState<VoiceNote[]>([])
  const [receivedNotes, setReceivedNotes] = useState<VoiceNote[]>([])
  const [adminNotes, setAdminNotes] = useState<VoiceNote[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [newNoteTitle, setNewNoteTitle] = useState("")
  const [showTitleInput, setShowTitleInput] = useState(false)
  const [sendToPartner, setSendToPartner] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioElementsRef = useRef<{ [key: string]: HTMLAudioElement }>({})
  const pendingAudioRef = useRef<string | null>(null)

  const partnerName = currentUser.toLowerCase() === "victor" ? "Mimi" : "Victor"

  useEffect(() => {
    loadVoiceNotes()
  }, [currentUser])

  const loadVoiceNotes = () => {
    // Load my personal voice notes
    const myNotes = JSON.parse(localStorage.getItem(`voice_notes_${currentUser.toLowerCase()}`) || "[]")
    setMyVoiceNotes(myNotes)

    // Load voice notes sent to me by my partner
    const partnerKey = currentUser.toLowerCase() === "victor" ? "mimi" : "victor"
    const notesForMe = JSON.parse(localStorage.getItem(`voice_notes_for_${currentUser.toLowerCase()}`) || "[]")
    setReceivedNotes(notesForMe)

    // Load admin notes (Victor's messages for Mimi)
    if (currentUser.toLowerCase() === "mimi") {
      const adminVoiceNotes = JSON.parse(localStorage.getItem("admin_voice_notes") || "[]")
      setAdminNotes(adminVoiceNotes)
    } else {
      setAdminNotes([])
    }
  }

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
        setShowTitleInput(true)
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

  const saveVoiceNote = () => {
    if (!newNoteTitle.trim() || !pendingAudioRef.current) return

    const note: VoiceNote = {
      id: Date.now().toString(),
      title: newNoteTitle,
      audioUrl: pendingAudioRef.current,
      duration: recordingTime,
      createdBy: currentUser,
      sentTo: sendToPartner ? partnerName : undefined,
      createdAt: new Date().toISOString(),
      isPersonal: true,
    }

    if (sendToPartner) {
      // Save to partner's received messages
      const partnerKey = `voice_notes_for_${partnerName.toLowerCase()}`
      const existingNotesForPartner = JSON.parse(localStorage.getItem(partnerKey) || "[]")
      const updatedNotesForPartner = [note, ...existingNotesForPartner]
      localStorage.setItem(partnerKey, JSON.stringify(updatedNotesForPartner))
    }

    // Save to my sent/personal notes
    const myKey = `voice_notes_${currentUser.toLowerCase()}`
    const myExistingNotes = JSON.parse(localStorage.getItem(myKey) || "[]")
    const updatedMyNotes = [note, ...myExistingNotes]
    localStorage.setItem(myKey, JSON.stringify(updatedMyNotes))

    // Refresh the display
    loadVoiceNotes()

    if (sendToPartner) {
      sendNotification("voice", currentUser, "sent", `Voice message: "${note.title}" sent to ${partnerName}`)
    } else {
      sendNotification("voice", currentUser, "recorded", `Personal voice note: "${note.title}"`)
    }

    // Reset form
    setNewNoteTitle("")
    setShowTitleInput(false)
    setSendToPartner(false)
    pendingAudioRef.current = null
    setRecordingTime(0)
  }

  const cancelSave = () => {
    if (pendingAudioRef.current) {
      URL.revokeObjectURL(pendingAudioRef.current)
      pendingAudioRef.current = null
    }
    setNewNoteTitle("")
    setShowTitleInput(false)
    setSendToPartner(false)
    setRecordingTime(0)
  }

  const playAudio = (noteId: string, audioUrl: string) => {
    // Stop any currently playing audio
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

  const deleteVoiceNote = (noteId: string, isReceived = false) => {
    if (isReceived) {
      // Delete from received notes
      const updatedReceived = receivedNotes.filter((note) => note.id !== noteId)
      setReceivedNotes(updatedReceived)
      localStorage.setItem(`voice_notes_for_${currentUser.toLowerCase()}`, JSON.stringify(updatedReceived))
    } else {
      // Delete from my personal notes
      const updatedNotes = myVoiceNotes.filter((note) => note.id !== noteId)
      setMyVoiceNotes(updatedNotes)
      localStorage.setItem(`voice_notes_${currentUser.toLowerCase()}`, JSON.stringify(updatedNotes))
    }

    // Clean up audio element
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

  const getSentToPartner = () => {
    return myVoiceNotes.filter((note) => note.sentTo)
  }

  const getPersonalNotes = () => {
    return myVoiceNotes.filter((note) => !note.sentTo)
  }

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
            <h1 className="text-3xl font-bold text-white">Voice Messages</h1>
            <p className="text-blue-200">Share your voice with {partnerName} 🎤</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Mic className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <p className="text-blue-200 text-sm">My Recordings</p>
              <p className="text-2xl font-bold text-white">{getPersonalNotes().length}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Send className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <p className="text-blue-200 text-sm">Sent to {partnerName}</p>
              <p className="text-2xl font-bold text-white">{getSentToPartner().length}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Heart className="h-6 w-6 text-pink-400 mx-auto mb-2" />
              <p className="text-blue-200 text-sm">From {partnerName}</p>
              <p className="text-2xl font-bold text-white">{receivedNotes.length}</p>
            </CardContent>
          </Card>

          {currentUser.toLowerCase() === "mimi" && (
            <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Heart className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                <p className="text-blue-200 text-sm">Special from Victor</p>
                <p className="text-2xl font-bold text-white">{adminNotes.length}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recording Section */}
        <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="text-white">Record Voice Message</CardTitle>
            <CardDescription className="text-blue-200">
              Record a personal message or send one to {partnerName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showTitleInput ? (
              <div className="text-center space-y-4">
                {isRecording && (
                  <div className="text-center">
                    <div className="text-red-400 text-lg font-mono mb-2">🔴 Recording: {formatTime(recordingTime)}</div>
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
                    <Button
                      onClick={startRecording}
                      className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg"
                    >
                      <Mic className="h-6 w-6 mr-2" />
                      Start Recording
                    </Button>
                  ) : (
                    <Button
                      onClick={stopRecording}
                      className="bg-slate-600 hover:bg-slate-700 text-white px-8 py-4 text-lg"
                    >
                      <Square className="h-6 w-6 mr-2" />
                      Stop Recording
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center text-green-400 mb-4">
                  ✅ Recording completed! ({formatTime(recordingTime)})
                </div>
                <div className="space-y-2">
                  <Label htmlFor="noteTitle" className="text-blue-200">
                    Give your voice message a title
                  </Label>
                  <Input
                    id="noteTitle"
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    className="bg-slate-700/50 border-blue-500/30 text-white placeholder:text-slate-400"
                    placeholder="e.g., Good morning message, Thinking of you..."
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sendToPartner"
                    checked={sendToPartner}
                    onChange={(e) => setSendToPartner(e.target.checked)}
                    className="rounded border-blue-500/30"
                  />
                  <Label htmlFor="sendToPartner" className="text-blue-200">
                    Send this message to {partnerName} 💕
                  </Label>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={saveVoiceNote}
                    disabled={!newNoteTitle.trim()}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {sendToPartner ? `Send to ${partnerName}` : "Save Voice Note"}
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

        {/* Voice Notes Tabs */}
        <Tabs defaultValue="received" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
            <TabsTrigger value="received" className="data-[state=active]:bg-indigo-600">
              From {partnerName} ({receivedNotes.length})
            </TabsTrigger>
            <TabsTrigger value="sent" className="data-[state=active]:bg-indigo-600">
              Sent ({getSentToPartner().length})
            </TabsTrigger>
            <TabsTrigger value="personal" className="data-[state=active]:bg-indigo-600">
              Personal ({getPersonalNotes().length})
            </TabsTrigger>
            {currentUser.toLowerCase() === "mimi" && (
              <TabsTrigger value="special" className="data-[state=active]:bg-indigo-600">
                Special ({adminNotes.length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="received">
            <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Voice Messages from {partnerName}</CardTitle>
                <CardDescription className="text-blue-200">Personal messages sent to you</CardDescription>
              </CardHeader>
              <CardContent>
                {receivedNotes.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400">No voice messages from {partnerName} yet</p>
                    <p className="text-slate-500 text-sm">
                      When {partnerName} sends you a message, it will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {receivedNotes.map((note) => (
                      <div key={note.id} className="p-4 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Heart className="h-4 w-4 text-pink-400" />
                              <h4 className="text-white font-medium">{note.title}</h4>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                              <span>From {note.createdBy}</span>
                              <span>•</span>
                              <span>{formatTime(note.duration)}</span>
                              <span>•</span>
                              <span>{formatDate(note.createdAt)}</span>
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
                              onClick={() => deleteVoiceNote(note.id, true)}
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

          <TabsContent value="sent">
            <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Messages Sent to {partnerName}</CardTitle>
                <CardDescription className="text-blue-200">Voice messages you've sent</CardDescription>
              </CardHeader>
              <CardContent>
                {getSentToPartner().length === 0 ? (
                  <div className="text-center py-8">
                    <Send className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400">No messages sent to {partnerName} yet</p>
                    <p className="text-slate-500 text-sm">Record a message and check "Send to {partnerName}"</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getSentToPartner().map((note) => (
                      <div key={note.id} className="p-4 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Send className="h-4 w-4 text-green-400" />
                              <h4 className="text-white font-medium">{note.title}</h4>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                              <span>To {note.sentTo}</span>
                              <span>•</span>
                              <span>{formatTime(note.duration)}</span>
                              <span>•</span>
                              <span>{formatDate(note.createdAt)}</span>
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
                              onClick={() => deleteVoiceNote(note.id)}
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

          <TabsContent value="personal">
            <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Personal Voice Notes</CardTitle>
                <CardDescription className="text-blue-200">Private recordings just for you</CardDescription>
              </CardHeader>
              <CardContent>
                {getPersonalNotes().length === 0 ? (
                  <div className="text-center py-8">
                    <Mic className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400">No personal voice notes yet</p>
                    <p className="text-slate-500 text-sm">
                      Record a message without sending it to create personal notes
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getPersonalNotes().map((note) => (
                      <div key={note.id} className="p-4 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-white font-medium mb-1">{note.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                              <span>{formatTime(note.duration)}</span>
                              <span>•</span>
                              <span>{formatDate(note.createdAt)}</span>
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
                              onClick={() => deleteVoiceNote(note.id)}
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

          {currentUser.toLowerCase() === "mimi" && (
            <TabsContent value="special">
              <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Special Messages from Victor</CardTitle>
                  <CardDescription className="text-blue-200">
                    Special voice messages Victor created just for you
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {adminNotes.length === 0 ? (
                    <div className="text-center py-8">
                      <Heart className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                      <p className="text-slate-400">No special messages yet</p>
                      <p className="text-slate-500 text-sm">
                        Victor can create special messages for you in his settings
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {adminNotes.map((note) => (
                        <div
                          key={note.id}
                          className="p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Heart className="h-4 w-4 text-orange-400" />
                                <h4 className="text-white font-medium">{note.title}</h4>
                                <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded">
                                  Special
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-slate-400">
                                <span>From Victor with love</span>
                                <span>•</span>
                                <span>{formatTime(note.duration)}</span>
                                <span>•</span>
                                <span>{formatDate(note.createdAt)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => playAudio(note.id, note.audioUrl)}
                                variant="outline"
                                size="icon"
                                className="border-orange-500/30 text-orange-200 hover:bg-orange-500/20"
                              >
                                {playingId === note.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
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
          )}
        </Tabs>
      </div>
    </div>
  )
}
