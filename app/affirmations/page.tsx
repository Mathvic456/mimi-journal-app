"use client"

import { useState } from "react"
import { ArrowLeft, Heart, Sparkles, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { sendNotification } from "../notifications/notification-system"

interface AffirmationsProps {
  currentUser: string
  onBack: () => void
}

const affirmationsForMimi = {
  period: [
    "You are so strong, Mimi. Your body is doing incredible things, and Victor is here for you through it all. 💙",
    "Rest, my beautiful Mimi. You deserve all the comfort and care in the world right now.",
    "Your strength amazes Victor every day, especially during these times. You are so loved.",
    "Take it easy, beautiful. Victor is here to take care of you and make you feel better.",
    "You're handling this with such grace, Mimi. Victor is so proud of you.",
  ],
  low: [
    "Mimi, you light up Victor's world even on your darkest days. You are so deeply loved.",
    "This feeling will pass, my love. You are stronger than you know, and Victor believes in you completely.",
    "You are enough, exactly as you are, Mimi. Your heart is beautiful, and so are you.",
    "Victor sees your beautiful soul, Mimi. You bring so much joy to his life every single day.",
    "Tomorrow is a new day, and Victor will be right here beside you through it all.",
  ],
  alone: [
    "You are never truly alone, Mimi. Victor is always thinking of you and sending you love.",
    "Even when you're apart, you carry Victor's heart with you. You are so loved, always.",
    "Distance means nothing when someone means everything. You mean everything to Victor.",
    "Close your eyes and feel Victor's love surrounding you. He's always with you in spirit.",
    "You are Victor's person, Mimi. No matter where you are, you're home to him.",
  ],
  general: [
    "Good morning, beautiful Mimi! Victor knows you're going to do amazing things today. 💙",
    "Your smile is Victor's favorite thing in the world, Mimi.",
    "Victor is so grateful God brought you into his life. You're his greatest blessing.",
    "You make ordinary moments feel magical just by being you, Mimi.",
    "Victor loves how your heart shines through everything you do.",
  ],
}

const messagesFromMimi = {
  encouragement: [
    "Victor, you are my rock and my safe place. I believe in you always. 💙",
    "My love, your strength inspires me every day. You've got this!",
    "Victor, you make me feel so loved and protected. Thank you for being you.",
    "I'm so proud of everything you do, Victor. You're amazing.",
    "You are my hero, Victor. I love you more than words can say.",
  ],
  love: [
    "Victor, you are the love of my life and my best friend. 💕",
    "Every day with you is a gift, Victor. I'm so grateful for us.",
    "You make me laugh, you make me feel safe, you make me whole, Victor.",
    "I love how you take care of me, Victor. You're my everything.",
    "Victor, you are my heart, my home, my forever. I love you endlessly.",
  ],
  support: [
    "Whatever you're going through, Victor, I'm right here with you.",
    "You don't have to carry everything alone, my love. I'm your partner in all things.",
    "Victor, your feelings are valid and I'm here to listen always.",
    "We're a team, Victor. Together we can handle anything life throws at us.",
    "I see how hard you work for us, Victor. You are appreciated and loved.",
  ],
  general: [
    "Good morning, my handsome Victor! I hope your day is as wonderful as you are. ☀️",
    "Victor, you make my heart skip a beat every single day.",
    "I'm thinking of you right now, Victor, and smiling because you're mine.",
    "You are my sunshine, Victor. Thank you for brightening my world.",
    "Victor, I fall in love with you more every day. You're incredible.",
  ],
}

export default function Affirmations({ currentUser, onBack }: AffirmationsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [currentMessage, setCurrentMessage] = useState("")

  const isMimi = currentUser.toLowerCase() === "mimi"
  const messages = isMimi ? affirmationsForMimi : messagesFromMimi

  const getRandomMessage = (category: keyof typeof messages) => {
    const categoryMessages = messages[category]
    const randomIndex = Math.floor(Math.random() * categoryMessages.length)
    setCurrentMessage(categoryMessages[randomIndex])
    setSelectedCategory(category)
    sendNotification("affirmations", currentUser, "viewed", `Viewed ${category} affirmations`)
  }

  const categoriesForMimi = [
    {
      key: "period" as const,
      title: "Period Support",
      description: "Gentle love for difficult days",
      icon: Moon,
      color: "bg-purple-600 hover:bg-purple-700",
    },
    {
      key: "low" as const,
      title: "Feeling Low",
      description: "Uplifting words from Victor",
      icon: Heart,
      color: "bg-pink-600 hover:bg-pink-700",
    },
    {
      key: "alone" as const,
      title: "Missing Victor",
      description: "Reminders of his love",
      icon: Sparkles,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      key: "general" as const,
      title: "Daily Love",
      description: "Sweet messages from Victor",
      icon: Sun,
      color: "bg-yellow-600 hover:bg-yellow-700",
    },
  ]

  const categoriesForVictor = [
    {
      key: "encouragement" as const,
      title: "Encouragement",
      description: "Mimi believes in you",
      icon: Heart,
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      key: "love" as const,
      title: "Love Messages",
      description: "Mimi's heart for you",
      icon: Sparkles,
      color: "bg-pink-600 hover:bg-pink-700",
    },
    {
      key: "support" as const,
      title: "Support",
      description: "Mimi is here for you",
      icon: Moon,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      key: "general" as const,
      title: "Daily Love",
      description: "Sweet messages from Mimi",
      icon: Sun,
      color: "bg-yellow-600 hover:bg-yellow-700",
    },
  ]

  const categories = isMimi ? categoriesForMimi : categoriesForVictor

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
            <h1 className="text-3xl font-bold text-white">{isMimi ? "Messages from Victor" : "Messages from Mimi"}</h1>
            <p className="text-blue-200">{isMimi ? "Love notes just for you 💙" : "Mimi's love for you 💕"}</p>
          </div>
        </div>

        {/* Current Message */}
        {currentMessage && (
          <Card className="bg-gradient-to-r from-pink-500/20 to-blue-500/20 border-pink-500/30 backdrop-blur-sm mb-8">
            <CardContent className="p-8 text-center">
              <Heart className="h-8 w-8 text-pink-400 mx-auto mb-4" />
              <p className="text-xl text-white font-medium leading-relaxed mb-4">{currentMessage}</p>
              <Button
                onClick={() => getRandomMessage(selectedCategory as keyof typeof messages)}
                className="bg-pink-600 hover:bg-pink-700 text-white"
              >
                Another Message 💕
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <Card
                key={category.key}
                className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm cursor-pointer hover:bg-slate-700/50 transition-colors"
                onClick={() => getRandomMessage(category.key)}
              >
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <IconComponent className="h-5 w-5" />
                    {category.title}
                  </CardTitle>
                  <CardDescription className="text-blue-200">{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className={`w-full text-white ${category.color}`}>Get Message</Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Special Message */}
        <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm mt-8">
          <CardContent className="p-6 text-center">
            <Heart className="h-6 w-6 text-pink-400 mx-auto mb-2" />
            <p className="text-blue-200 italic">
              {isMimi
                ? "Every message here comes straight from Victor's heart. You are so loved, Mimi. 💙"
                : "Every message here comes straight from Mimi's heart. You are so loved, Victor. 💕"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
