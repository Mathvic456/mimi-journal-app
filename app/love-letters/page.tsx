"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Heart, Send, Mail, MailOpen, Calendar, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { sendNotification } from "../notifications/notification-system"

interface LoveLetter {
  id: string
  from: string
  to: string
  subject: string
  content: string
  createdAt: string
  isRead: boolean
  isFavorite: boolean
}

interface LoveLettersProps {
  currentUser: string
  onBack: () => void
}

export default function LoveLetters({ currentUser, onBack }: LoveLettersProps) {
  const [letters, setLetters] = useState<LoveLetter[]>([])
  const [isWriting, setIsWriting] = useState(false)
  const [selectedLetter, setSelectedLetter] = useState<LoveLetter | null>(null)
  const [newLetter, setNewLetter] = useState({
    subject: "",
    content: "",
  })

  const partnerName = currentUser.toLowerCase() === "victor" ? "Mimi" : "Victor"

  useEffect(() => {
    const savedLetters = JSON.parse(localStorage.getItem("love_letters") || "[]")
    setLetters(savedLetters)
  }, [])

  const saveLetter = () => {
    if (!newLetter.subject.trim() || !newLetter.content.trim()) return

    const letter: LoveLetter = {
      id: Date.now().toString(),
      from: currentUser,
      to: partnerName,
      subject: newLetter.subject,
      content: newLetter.content,
      createdAt: new Date().toISOString(),
      isRead: false,
      isFavorite: false,
    }

    const updatedLetters = [letter, ...letters]
    setLetters(updatedLetters)
    localStorage.setItem("love_letters", JSON.stringify(updatedLetters))
    sendNotification("letters", currentUser, "sent", `Love letter: "${letter.subject}" sent to ${partnerName}`)

    setNewLetter({ subject: "", content: "" })
    setIsWriting(false)
  }

  const markAsRead = (letterId: string) => {
    const updatedLetters = letters.map((letter) => (letter.id === letterId ? { ...letter, isRead: true } : letter))
    setLetters(updatedLetters)
    localStorage.setItem("love_letters", JSON.stringify(updatedLetters))
  }

  const toggleFavorite = (letterId: string) => {
    const updatedLetters = letters.map((letter) =>
      letter.id === letterId ? { ...letter, isFavorite: !letter.isFavorite } : letter,
    )
    setLetters(updatedLetters)
    localStorage.setItem("love_letters", JSON.stringify(updatedLetters))
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

  const getReceivedLetters = () => {
    return letters.filter((letter) => letter.to.toLowerCase() === currentUser.toLowerCase())
  }

  const getSentLetters = () => {
    return letters.filter((letter) => letter.from.toLowerCase() === currentUser.toLowerCase())
  }

  const getUnreadCount = () => {
    return getReceivedLetters().filter((letter) => !letter.isRead).length
  }

  const getFavoriteLetters = () => {
    return letters.filter((letter) => letter.isFavorite)
  }

  const openLetter = (letter: LoveLetter) => {
    setSelectedLetter(letter)
    if (letter.to.toLowerCase() === currentUser.toLowerCase() && !letter.isRead) {
      markAsRead(letter.id)
    }
  }

  const loveLetterPrompts = [
    "What I love most about you today...",
    "My favorite memory of us is...",
    "You make me feel...",
    "I'm grateful for you because...",
    "When I think of our future together...",
    "The way you smile makes me...",
    "I fell in love with you when...",
    "You are my...",
  ]

  if (selectedLetter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              onClick={() => setSelectedLetter(null)}
              variant="outline"
              size="icon"
              className="border-blue-500/30 text-blue-200 hover:bg-blue-500/20"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Love Letter</h1>
              <p className="text-blue-200">
                From {selectedLetter.from} to {selectedLetter.to}
              </p>
            </div>
          </div>

          {/* Letter Display */}
          <Card className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border-red-500/20 backdrop-blur-sm">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white text-2xl mb-2">{selectedLetter.subject}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-red-200">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(selectedLetter.createdAt)}
                    </span>
                    <span>From: {selectedLetter.from}</span>
                    <span>To: {selectedLetter.to}</span>
                  </div>
                </div>
                <Button
                  onClick={() => toggleFavorite(selectedLetter.id)}
                  variant="outline"
                  size="icon"
                  className={`border-red-500/30 hover:bg-red-500/20 ${
                    selectedLetter.isFavorite ? "text-yellow-400" : "text-red-200"
                  }`}
                >
                  <Star className={`h-4 w-4 ${selectedLetter.isFavorite ? "fill-current" : ""}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-800/30 rounded-lg p-6">
                <p className="text-white text-lg leading-relaxed whitespace-pre-wrap">{selectedLetter.content}</p>
              </div>
              <div className="text-center">
                <p className="text-red-200 italic">
                  With all my love,
                  <br />
                  {selectedLetter.from} 💕
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
            <h1 className="text-3xl font-bold text-white">Love Letters</h1>
            <p className="text-blue-200">Express your heart through written words 💕</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-red-500/20 border-red-500/30 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Mail className="h-6 w-6 text-red-400 mx-auto mb-2" />
              <p className="text-red-200 text-sm">Unread Letters</p>
              <p className="text-2xl font-bold text-white">{getUnreadCount()}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <MailOpen className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <p className="text-blue-200 text-sm">Received</p>
              <p className="text-2xl font-bold text-white">{getReceivedLetters().length}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Send className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <p className="text-blue-200 text-sm">Sent</p>
              <p className="text-2xl font-bold text-white">{getSentLetters().length}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Star className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-blue-200 text-sm">Favorites</p>
              <p className="text-2xl font-bold text-white">{getFavoriteLetters().length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Write Letter Button */}
        {!isWriting && (
          <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm mb-6">
            <CardContent className="p-6">
              <Button
                onClick={() => setIsWriting(true)}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-lg py-6"
              >
                <Heart className="h-5 w-5 mr-2" />
                Write a Love Letter to {partnerName}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Write Letter Form */}
        {isWriting && (
          <Card className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border-red-500/20 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle className="text-white">Write a Love Letter to {partnerName}</CardTitle>
              <CardDescription className="text-red-200">Pour your heart out in words</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-red-200">
                  Subject
                </Label>
                <Input
                  id="subject"
                  value={newLetter.subject}
                  onChange={(e) => setNewLetter({ ...newLetter, subject: e.target.value })}
                  className="bg-slate-700/50 border-red-500/30 text-white placeholder:text-slate-400"
                  placeholder="Give your letter a beautiful title..."
                />
              </div>

              {/* Writing Prompts */}
              <div className="space-y-2">
                <Label className="text-red-200">Need inspiration? Try one of these prompts:</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {loveLetterPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        setNewLetter({
                          ...newLetter,
                          content: newLetter.content + (newLetter.content ? "\n\n" : "") + prompt,
                        })
                      }
                      className="text-left p-2 text-sm bg-slate-700/30 hover:bg-slate-600/30 rounded text-red-200 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-red-200">
                  Your Love Letter
                </Label>
                <Textarea
                  id="content"
                  value={newLetter.content}
                  onChange={(e) => setNewLetter({ ...newLetter, content: e.target.value })}
                  className="bg-slate-700/50 border-red-500/30 text-white placeholder:text-slate-400 min-h-[300px]"
                  placeholder={`My dearest ${partnerName},\n\nI wanted to take a moment to tell you how much you mean to me...\n\nWith all my love,\n${currentUser}`}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={saveLetter}
                  disabled={!newLetter.subject.trim() || !newLetter.content.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Love Letter
                </Button>
                <Button
                  onClick={() => setIsWriting(false)}
                  variant="outline"
                  className="border-red-500/30 text-red-200 hover:bg-red-500/20"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Letters Tabs */}
        <Tabs defaultValue="received" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
            <TabsTrigger value="received" className="data-[state=active]:bg-red-600">
              Received ({getReceivedLetters().length})
            </TabsTrigger>
            <TabsTrigger value="sent" className="data-[state=active]:bg-red-600">
              Sent ({getSentLetters().length})
            </TabsTrigger>
            <TabsTrigger value="favorites" className="data-[state=active]:bg-red-600">
              Favorites ({getFavoriteLetters().length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received">
            <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Letters from {partnerName}</CardTitle>
                <CardDescription className="text-blue-200">Love letters written just for you</CardDescription>
              </CardHeader>
              <CardContent>
                {getReceivedLetters().length === 0 ? (
                  <div className="text-center py-8">
                    <Mail className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400">No letters from {partnerName} yet</p>
                    <p className="text-slate-500 text-sm">
                      When {partnerName} writes you a letter, it will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getReceivedLetters().map((letter) => (
                      <div
                        key={letter.id}
                        onClick={() => openLetter(letter)}
                        className="p-4 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-600/30 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {!letter.isRead && <div className="w-2 h-2 bg-red-400 rounded-full" />}
                              <h4 className={`font-medium ${!letter.isRead ? "text-white" : "text-slate-300"}`}>
                                {letter.subject}
                              </h4>
                              {letter.isFavorite && <Star className="h-4 w-4 text-yellow-400 fill-current" />}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                              <span>From {letter.from}</span>
                              <span>•</span>
                              <span>{formatDate(letter.createdAt)}</span>
                              {!letter.isRead && <span className="text-red-400">• New</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!letter.isRead ? (
                              <Mail className="h-5 w-5 text-red-400" />
                            ) : (
                              <MailOpen className="h-5 w-5 text-slate-400" />
                            )}
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
                <CardTitle className="text-white">Letters to {partnerName}</CardTitle>
                <CardDescription className="text-blue-200">Love letters you've written</CardDescription>
              </CardHeader>
              <CardContent>
                {getSentLetters().length === 0 ? (
                  <div className="text-center py-8">
                    <Send className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400">No letters sent yet</p>
                    <p className="text-slate-500 text-sm">Write your first love letter to {partnerName}!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getSentLetters().map((letter) => (
                      <div
                        key={letter.id}
                        onClick={() => openLetter(letter)}
                        className="p-4 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-600/30 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-white font-medium">{letter.subject}</h4>
                              {letter.isFavorite && <Star className="h-4 w-4 text-yellow-400 fill-current" />}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                              <span>To {letter.to}</span>
                              <span>•</span>
                              <span>{formatDate(letter.createdAt)}</span>
                              <span>•</span>
                              <span className={letter.isRead ? "text-green-400" : "text-orange-400"}>
                                {letter.isRead ? "Read" : "Unread"}
                              </span>
                            </div>
                          </div>
                          <Send className="h-5 w-5 text-green-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites">
            <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Favorite Letters</CardTitle>
                <CardDescription className="text-blue-200">Your most treasured love letters</CardDescription>
              </CardHeader>
              <CardContent>
                {getFavoriteLetters().length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400">No favorite letters yet</p>
                    <p className="text-slate-500 text-sm">Mark letters as favorites to keep them here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getFavoriteLetters().map((letter) => (
                      <div
                        key={letter.id}
                        onClick={() => openLetter(letter)}
                        className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg cursor-pointer hover:bg-yellow-500/20 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <h4 className="text-white font-medium">{letter.subject}</h4>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                              <span>{letter.from === currentUser ? `To ${letter.to}` : `From ${letter.from}`}</span>
                              <span>•</span>
                              <span>{formatDate(letter.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Love Message */}
        <Card className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border-red-500/20 backdrop-blur-sm mt-8">
          <CardContent className="p-6 text-center">
            <Heart className="h-6 w-6 text-red-400 mx-auto mb-2" />
            <p className="text-red-200 italic">
              "Words have the power to touch hearts across any distance. Every letter is a piece of your soul shared
              with love. 💕"
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
