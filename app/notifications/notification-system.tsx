"use client"

import { useState, useEffect } from "react"
import { X, Bell, BellOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Notification {
  id: string
  type: string
  message: string
  from: string
  to: string
  timestamp: string
  isRead: boolean
  icon: string
}

interface NotificationSystemProps {
  currentUser: string
}

export default function NotificationSystem({ currentUser }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  useEffect(() => {
    loadNotifications()
    // Check for new notifications every 5 seconds
    const interval = setInterval(loadNotifications, 5000)
    return () => clearInterval(interval)
  }, [currentUser])

  const loadNotifications = () => {
    const allNotifications = JSON.parse(localStorage.getItem("app_notifications") || "[]")
    const myNotifications = allNotifications
      .filter((notif: Notification) => notif.to.toLowerCase() === currentUser.toLowerCase())
      .sort((a: Notification, b: Notification) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    setNotifications(myNotifications)
  }

  const markAsRead = (notificationId: string) => {
    const allNotifications = JSON.parse(localStorage.getItem("app_notifications") || "[]")
    const updatedNotifications = allNotifications.map((notif: Notification) =>
      notif.id === notificationId ? { ...notif, isRead: true } : notif,
    )
    localStorage.setItem("app_notifications", JSON.stringify(updatedNotifications))
    loadNotifications()
  }

  const markAllAsRead = () => {
    const allNotifications = JSON.parse(localStorage.getItem("app_notifications") || "[]")
    const updatedNotifications = allNotifications.map((notif: Notification) =>
      notif.to.toLowerCase() === currentUser.toLowerCase() ? { ...notif, isRead: true } : notif,
    )
    localStorage.setItem("app_notifications", JSON.stringify(updatedNotifications))
    loadNotifications()
  }

  const deleteNotification = (notificationId: string) => {
    const allNotifications = JSON.parse(localStorage.getItem("app_notifications") || "[]")
    const updatedNotifications = allNotifications.filter((notif: Notification) => notif.id !== notificationId)
    localStorage.setItem("app_notifications", JSON.stringify(updatedNotifications))
    loadNotifications()
  }

  const formatTime = (timestamp: string) => {
    const now = new Date()
    const notifTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - notifTime.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const partnerName = currentUser.toLowerCase() === "victor" ? "Mimi" : "Victor"

  const toggleNotifications = () => {
    const newState = !notificationsEnabled
    setNotificationsEnabled(newState)
    localStorage.setItem(`notifications_enabled_${currentUser.toLowerCase()}`, JSON.stringify(newState))
  }

  useEffect(() => {
    const enabled = JSON.parse(localStorage.getItem(`notifications_enabled_${currentUser.toLowerCase()}`) || "true")
    setNotificationsEnabled(enabled)
  }, [currentUser])

  return (
    <>
      {/* Notification Bell */}
      <div className="relative">
        <Button
          onClick={() => setShowNotifications(!showNotifications)}
          variant="outline"
          size="icon"
          className="border-blue-500/30 text-blue-200 hover:bg-blue-500/20 relative"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>

        {/* Notification Dropdown */}
        {showNotifications && (
          <div className="absolute right-0 top-12 w-80 max-h-96 bg-slate-800 border border-blue-500/20 rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-medium">Notifications</h3>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={toggleNotifications}
                    variant="ghost"
                    size="sm"
                    className="text-blue-200 hover:bg-blue-500/20"
                  >
                    {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    onClick={() => setShowNotifications(false)}
                    variant="ghost"
                    size="sm"
                    className="text-blue-200 hover:bg-blue-500/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  variant="ghost"
                  size="sm"
                  className="text-blue-400 hover:bg-blue-500/20 mt-2"
                >
                  Mark all as read
                </Button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">No notifications yet</p>
                  <p className="text-slate-500 text-xs">You'll see updates when {partnerName} uses the app</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b border-slate-700 hover:bg-slate-700/30 cursor-pointer ${
                      !notification.isRead ? "bg-blue-500/10" : ""
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{notification.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notification.isRead ? "text-white font-medium" : "text-slate-300"}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">{formatTime(notification.timestamp)}</p>
                      </div>
                      {!notification.isRead && <div className="w-2 h-2 bg-blue-400 rounded-full mt-2" />}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      {notificationsEnabled && <NotificationToasts currentUser={currentUser} notifications={notifications} />}
    </>
  )
}

// Toast notification component
function NotificationToasts({
  currentUser,
  notifications,
}: {
  currentUser: string
  notifications: Notification[]
}) {
  const [toasts, setToasts] = useState<Notification[]>([])

  useEffect(() => {
    // Show toast for new unread notifications
    const newNotifications = notifications.filter(
      (n) => !n.isRead && new Date().getTime() - new Date(n.timestamp).getTime() < 10000, // Within last 10 seconds
    )

    newNotifications.forEach((notification) => {
      if (!toasts.find((t) => t.id === notification.id)) {
        setToasts((prev) => [...prev, notification])
        // Auto remove after 5 seconds
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== notification.id))
        }, 5000)
      }
    })
  }, [notifications])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Card
          key={toast.id}
          className="bg-slate-800 border-blue-500/20 shadow-lg animate-in slide-in-from-right duration-300"
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-lg">{toast.icon}</span>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{toast.message}</p>
                <p className="text-slate-400 text-xs mt-1">Just now</p>
              </div>
              <Button
                onClick={() => removeToast(toast.id)}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Utility function to send notifications
export function sendNotification(type: string, from: string, action: string, details?: string) {
  const to = from.toLowerCase() === "victor" ? "Mimi" : "Victor"
  const notificationsEnabled = JSON.parse(localStorage.getItem(`notifications_enabled_${to.toLowerCase()}`) || "true")

  if (!notificationsEnabled) return

  const iconMap: { [key: string]: string } = {
    journal: "📝",
    mood: "😊",
    checkin: "✅",
    goals: "🎯",
    voice: "🎤",
    letters: "💌",
    affirmations: "💕",
    emergency: "📞",
    admin: "⚙️",
  }

  const messageMap: { [key: string]: string } = {
    journal: `${from} wrote a new journal entry`,
    mood: `${from} updated their mood`,
    checkin: `${from} completed their daily check-in`,
    goals: `${from} ${action} a goal`,
    voice: `${from} ${action} a voice message`,
    letters: `${from} ${action} a love letter`,
    affirmations: `${from} viewed affirmations`,
    emergency: `${from} used emergency contact`,
    admin: `${from} updated admin settings`,
  }

  const notification: Notification = {
    id: Date.now().toString(),
    type,
    message: details || messageMap[type] || `${from} used ${type}`,
    from,
    to,
    timestamp: new Date().toISOString(),
    isRead: false,
    icon: iconMap[type] || "💙",
  }

  const existingNotifications = JSON.parse(localStorage.getItem("app_notifications") || "[]")
  const updatedNotifications = [notification, ...existingNotifications]

  // Keep only last 50 notifications
  if (updatedNotifications.length > 50) {
    updatedNotifications.splice(50)
  }

  localStorage.setItem("app_notifications", JSON.stringify(updatedNotifications))
}
