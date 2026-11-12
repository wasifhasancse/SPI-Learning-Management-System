"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { HiCheckCircle, HiExclamationCircle, HiXMark } from "react-icons/hi2";

type Notification = { id: number; type: "success" | "error"; message: string };
type Toast = { success: (message: string) => void; danger: (message: string) => void };

const ToastContext = createContext<Toast | null>(null);

function NotificationItem({ notification, dismiss }: { notification: Notification; dismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = window.setTimeout(() => dismiss(notification.id), 6000);
    return () => window.clearTimeout(timer);
  }, [dismiss, notification.id]);

  const isError = notification.type === "error";
  return (
    <div role={isError ? "alert" : "status"} className={`flex items-start gap-3 rounded-xl border p-4 text-sm font-medium shadow-lg ${isError ? "border-rose-200 bg-rose-50 text-rose-950" : "border-[#A8DF8E] bg-[#F0FFDF] text-emerald-950"}`}>
      {isError ? <HiExclamationCircle className="h-5 w-5 shrink-0" /> : <HiCheckCircle className="h-5 w-5 shrink-0" />}
      <span className="min-w-0 flex-1">{notification.message}</span>
      <button type="button" aria-label="Dismiss notification" onClick={() => dismiss(notification.id)} className="shrink-0 rounded p-1 hover:bg-black/5">
        <HiXMark className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function ToastNotifications({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const nextId = useRef(0);
  const dismiss = useCallback((id: number) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
  }, []);
  const show = useCallback((type: Notification["type"], message: string) => {
    const id = ++nextId.current;
    setNotifications((current) => [...current, { id, type, message }]);
  }, []);
  const toast = useMemo(() => ({
    success: (message: string) => show("success", message),
    danger: (message: string) => show("error", message),
  }), [show]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div aria-label="Notifications" className="pointer-events-none fixed right-4 top-4 z-[100001] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
        {notifications.map((notification) => (
          <div className="pointer-events-auto" key={notification.id}>
            <NotificationItem notification={notification} dismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): Toast {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error("useToast must be used within ToastNotifications.");
  return toast;
}
