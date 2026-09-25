"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { clsx } from "clsx"

type NotificationType = "success" | "error" | "info" | "warning"

interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
}

interface NotificationContextType {
  notify: (type: NotificationType, title: string, message?: string) => void
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider")
  }
  return context
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const notify = useCallback((type: NotificationType, title: string, message?: string) => {
    const id = Math.random().toString(36).substring(7)
    const notification: Notification = { id, type, title, message }
    
    setNotifications((prev) => [...prev, notification])
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 5000)
  }, [])

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={clsx(
              "pointer-events-auto w-80 rounded-lg shadow-lg p-4 border backdrop-blur-sm transition-all transform",
              {
                "bg-green-50/95 border-green-200": notification.type === "success",
                "bg-red-50/95 border-red-200": notification.type === "error",
                "bg-blue-50/95 border-blue-200": notification.type === "info",
                "bg-yellow-50/95 border-yellow-200": notification.type === "warning",
              }
            )}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === "success" && (
                  <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === "error" && (
                  <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === "info" && (
                  <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === "warning" && (
                  <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className={clsx(
                  "text-sm font-medium",
                  {
                    "text-green-900": notification.type === "success",
                    "text-red-900": notification.type === "error",
                    "text-blue-900": notification.type === "info",
                    "text-yellow-900": notification.type === "warning",
                  }
                )}>
                  {notification.title}
                </p>
                {notification.message && (
                  <p className={clsx(
                    "mt-1 text-sm",
                    {
                      "text-green-700": notification.type === "success",
                      "text-red-700": notification.type === "error",
                      "text-blue-700": notification.type === "info",
                      "text-yellow-700": notification.type === "warning",
                    }
                  )}>
                    {notification.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => dismiss(notification.id)}
                className="ml-4 flex-shrink-0 text-slate-400 hover:text-slate-600"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}
