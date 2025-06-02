"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Plus, Target, Heart, Calendar, CheckCircle, Circle, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { sendNotification } from "../notifications/notification-system"

interface Goal {
  id: string
  title: string
  description: string
  category: string
  targetDate: string
  completed: boolean
  createdBy: string
  createdAt: string
  completedAt?: string
  milestones: Milestone[]
}

interface Milestone {
  id: string
  title: string
  completed: boolean
  completedAt?: string
}

interface CoupleGoalsProps {
  currentUser: string
  onBack: () => void
}

const goalCategories = [
  { value: "relationship", label: "Relationship", icon: "💕" },
  { value: "travel", label: "Travel", icon: "✈️" },
  { value: "health", label: "Health & Fitness", icon: "💪" },
  { value: "financial", label: "Financial", icon: "💰" },
  { value: "personal", label: "Personal Growth", icon: "🌱" },
  { value: "home", label: "Home & Living", icon: "🏠" },
  { value: "career", label: "Career", icon: "🎯" },
  { value: "fun", label: "Fun & Hobbies", icon: "🎉" },
]

export default function CoupleGoals({ currentUser, onBack }: CoupleGoalsProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "",
    targetDate: "",
    milestones: [""],
  })

  useEffect(() => {
    const savedGoals = JSON.parse(localStorage.getItem("couple_goals") || "[]")
    setGoals(savedGoals)
  }, [])

  const saveGoal = () => {
    if (!newGoal.title.trim() || !newGoal.category) return

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category,
      targetDate: newGoal.targetDate,
      completed: false,
      createdBy: currentUser,
      createdAt: new Date().toISOString(),
      milestones: newGoal.milestones
        .filter((m) => m.trim())
        .map((m) => ({
          id: Date.now().toString() + Math.random(),
          title: m,
          completed: false,
        })),
    }

    const updatedGoals = [goal, ...goals]
    setGoals(updatedGoals)
    localStorage.setItem("couple_goals", JSON.stringify(updatedGoals))
    sendNotification("goals", currentUser, "created", `New goal: "${goal.title}"`)

    setNewGoal({ title: "", description: "", category: "", targetDate: "", milestones: [""] })
    setIsCreating(false)
  }

  const toggleGoalCompletion = (goalId: string) => {
    let targetGoal: Goal | undefined
    const updatedGoals = goals.map((goal) => {
      if (goal.id === goalId) {
        targetGoal = goal
        return {
          ...goal,
          completed: !goal.completed,
          completedAt: !goal.completed ? new Date().toISOString() : undefined,
        }
      }
      return goal
    })
    setGoals(updatedGoals)
    localStorage.setItem("couple_goals", JSON.stringify(updatedGoals))
    const action = !targetGoal!.completed ? "completed" : "reopened"
    sendNotification("goals", currentUser, action, `Goal "${targetGoal!.title}" ${action}`)
  }

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    const updatedGoals = goals.map((goal) => {
      if (goal.id === goalId) {
        return {
          ...goal,
          milestones: goal.milestones.map((milestone) => {
            if (milestone.id === milestoneId) {
              return {
                ...milestone,
                completed: !milestone.completed,
                completedAt: !milestone.completed ? new Date().toISOString() : undefined,
              }
            }
            return milestone
          }),
        }
      }
      return goal
    })
    setGoals(updatedGoals)
    localStorage.setItem("couple_goals", JSON.stringify(updatedGoals))
  }

  const addMilestone = () => {
    setNewGoal({
      ...newGoal,
      milestones: [...newGoal.milestones, ""],
    })
  }

  const updateMilestone = (index: number, value: string) => {
    const updatedMilestones = [...newGoal.milestones]
    updatedMilestones[index] = value
    setNewGoal({ ...newGoal, milestones: updatedMilestones })
  }

  const removeMilestone = (index: number) => {
    const updatedMilestones = newGoal.milestones.filter((_, i) => i !== index)
    setNewGoal({ ...newGoal, milestones: updatedMilestones })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getGoalsByCategory = () => {
    return goalCategories
      .map((category) => ({
        ...category,
        goals: goals.filter((goal) => goal.category === category.value),
      }))
      .filter((category) => category.goals.length > 0)
  }

  const completedGoals = goals.filter((g) => g.completed).length
  const totalGoals = goals.length

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
            <h1 className="text-3xl font-bold text-white">Couple Goals</h1>
            <p className="text-blue-200">Building dreams together, one goal at a time 💕</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">Total Goals</p>
                  <p className="text-2xl font-bold text-white">{totalGoals}</p>
                </div>
                <Target className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">Completed</p>
                  <p className="text-2xl font-bold text-white">{completedGoals}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">Success Rate</p>
                  <p className="text-2xl font-bold text-white">
                    {totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0}%
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Goal Button */}
        {!isCreating && (
          <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm mb-6">
            <CardContent className="p-6">
              <Button
                onClick={() => setIsCreating(true)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Goal
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create Goal Form */}
        {isCreating && (
          <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle className="text-white">Create New Goal</CardTitle>
              <CardDescription className="text-blue-200">Set a goal you want to achieve together</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-blue-200">
                  Goal Title
                </Label>
                <Input
                  id="title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="bg-slate-700/50 border-blue-500/30 text-white placeholder:text-slate-400"
                  placeholder="What do you want to achieve?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-blue-200">
                  Category
                </Label>
                <Select value={newGoal.category} onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}>
                  <SelectTrigger className="bg-slate-700/50 border-blue-500/30 text-white">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {goalCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-blue-200">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="bg-slate-700/50 border-blue-500/30 text-white placeholder:text-slate-400"
                  placeholder="Describe your goal in detail..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetDate" className="text-blue-200">
                  Target Date
                </Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                  className="bg-slate-700/50 border-blue-500/30 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-blue-200">Milestones</Label>
                {newGoal.milestones.map((milestone, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={milestone}
                      onChange={(e) => updateMilestone(index, e.target.value)}
                      className="bg-slate-700/50 border-blue-500/30 text-white placeholder:text-slate-400"
                      placeholder="Add a milestone..."
                    />
                    {newGoal.milestones.length > 1 && (
                      <Button
                        onClick={() => removeMilestone(index)}
                        variant="outline"
                        size="icon"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  onClick={addMilestone}
                  variant="outline"
                  className="border-blue-500/30 text-blue-200 hover:bg-blue-500/20"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Milestone
                </Button>
              </div>

              <div className="flex gap-2">
                <Button onClick={saveGoal} className="bg-purple-600 hover:bg-purple-700 text-white">
                  Create Goal
                </Button>
                <Button
                  onClick={() => setIsCreating(false)}
                  variant="outline"
                  className="border-blue-500/30 text-blue-200 hover:bg-blue-500/20"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Goals by Category */}
        {goals.length === 0 ? (
          <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <Heart className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No goals yet</h3>
              <p className="text-blue-200">Start creating goals to build your future together!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {getGoalsByCategory().map((category) => (
              <Card key={category.value} className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <span className="text-2xl">{category.icon}</span>
                    {category.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.goals.map((goal) => (
                      <div key={goal.id} className="p-4 bg-slate-700/30 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <button onClick={() => toggleGoalCompletion(goal.id)} className="text-2xl">
                                {goal.completed ? (
                                  <CheckCircle className="h-5 w-5 text-green-400" />
                                ) : (
                                  <Circle className="h-5 w-5 text-slate-400" />
                                )}
                              </button>
                              <h4
                                className={`font-medium ${goal.completed ? "text-green-400 line-through" : "text-white"}`}
                              >
                                {goal.title}
                              </h4>
                            </div>
                            {goal.description && <p className="text-slate-300 text-sm mb-2 ml-7">{goal.description}</p>}
                            <div className="flex items-center gap-4 text-xs text-slate-400 ml-7">
                              <span>Created by {goal.createdBy}</span>
                              {goal.targetDate && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(goal.targetDate)}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Milestones */}
                        {goal.milestones.length > 0 && (
                          <div className="ml-7 mt-3 space-y-2">
                            <p className="text-blue-200 text-sm font-medium">Milestones:</p>
                            {goal.milestones.map((milestone) => (
                              <div key={milestone.id} className="flex items-center gap-2">
                                <button onClick={() => toggleMilestone(goal.id, milestone.id)} className="text-sm">
                                  {milestone.completed ? (
                                    <CheckCircle className="h-4 w-4 text-green-400" />
                                  ) : (
                                    <Circle className="h-4 w-4 text-slate-400" />
                                  )}
                                </button>
                                <span
                                  className={`text-sm ${milestone.completed ? "text-green-400 line-through" : "text-slate-300"}`}
                                >
                                  {milestone.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
