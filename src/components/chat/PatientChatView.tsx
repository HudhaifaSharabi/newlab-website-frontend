"use client";

import React, { useState, useEffect, useRef, DragEvent, useCallback } from "react";
import { ChatMessage, MessageData } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useNetwork } from "@/hooks/useNetwork";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import { AlertCircle } from "lucide-react";

interface Props {
  role: "center";
}

function getFrappeHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };
  if (typeof window !== "undefined" && (window as any).frappe?.csrf_token) {
    headers["X-Frappe-CSRF-Token"] = (window as any).frappe.csrf_token;
  }
  return headers;
}

function getCachedPatientMessages(): MessageData[] {
  try {
    const raw = localStorage.getItem("newlab_patient_chat_msgs");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function saveCachedPatientMessages(msgs: MessageData[]) {
  try {
    localStorage.setItem("newlab_patient_chat_msgs", JSON.stringify(msgs));
  } catch {}
}

function extractArray(obj: any): any[] {
  if (!obj) return [];
  if (Array.isArray(obj)) return obj;
  if (Array.isArray(obj.data)) return obj.data;
  if (obj.message) return extractArray(obj.message);
  return [];
}

export function PatientChatView({ role }: Props) {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const [isDragging, setIsDragging] = useState(false);
  const isOnline = useNetwork();
  const messagesRef = useRef(messages);
  const currentUserRef = useRef<string>("");

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    const savedUser = localStorage.getItem("newlab_current_user") || "";
    fetch("/api/portal-session", { credentials: "include", cache: "no-store" })
      .then(r => r.json())
      .then(data => {
        const currentUser = (data?.user && data.user !== "Guest") ? data.user : "";
        if (!data?.authenticated || !currentUser) {
          localStorage.removeItem("portal_user_v2");
          localStorage.removeItem("newlab_current_user");
          window.location.href = "/ar/results";
          return;
        }

        currentUserRef.current = currentUser;

        // If a different user is now logged in, wipe ALL cached messages
        if (savedUser && currentUser.toLowerCase() !== savedUser.toLowerCase()) {
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith("newlab_chat") || key.startsWith("newlab_patient"))) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(k => localStorage.removeItem(k));
          setMessages([]);
        } else {
          // Same user — load their cached messages
          const cached = getCachedPatientMessages();
          if (cached.length > 0) setMessages(cached);
        }

        localStorage.setItem("newlab_current_user", currentUser);
      })
      .catch(() => {});
  }, []);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 150;
  };

  const getMessageDateLabel = (timestamp?: number) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "اليوم";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "أمس";
    } else {
      return date.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
    }
  };

  const scrollToBottom = (smooth = true) => {
    chatEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  useEffect(() => {
    if (isNearBottomRef.current) {
      scrollToBottom(true);
    }
  }, [messages]);

  const isFetchingMessages = useRef(false);

  const fetchMessages = useCallback(async (afterId?: string) => {
    if (isFetchingMessages.current) return;
    isFetchingMessages.current = true;
    try {
      const contactIds = ["Administrator", "lab"];
      const fetchPromises = contactIds.map(cid => {
        let url = `/api/chat-messages?contact_id=${encodeURIComponent(cid)}`;
        if (afterId) url += `&after_id=${encodeURIComponent(afterId)}`;
        return fetch(url, { credentials: "include" })
          .then(res => res.json())
          .then(json => extractArray(json))
          .catch(() => []);
      });

      const results = await Promise.all(fetchPromises);
      const allItems: any[] = [];
      results.forEach(arr => {
        if (Array.isArray(arr)) allItems.push(...arr);
      });

      if (allItems.length > 0) {
        const itemMap = new Map();
        allItems.forEach((item, idx) => {
          const id = String(item.id || item.name || `${Date.now()}-${idx}`);
          itemMap.set(id, item);
        });

        const deduplicated = Array.from(itemMap.values());
        const myUser = (currentUserRef.current || localStorage.getItem("newlab_current_user") || "").toLowerCase();
        const myPrefix = myUser.split("@")[0];

        const filteredForUser = deduplicated.filter((item: any) => {
          if (!myUser || myUser === "guest") return true;
          const s = String(item.sender_id || item.sender || "").toLowerCase();
          const r = String(item.receiver_id || item.receiver || "").toLowerCase();
          return s === myUser || s === myPrefix || r === myUser || r === myPrefix;
        });

        const parseTimestampSafe = (timeVal: any): number => {
          if (!timeVal) return Date.now();
          if (typeof timeVal === "number") return timeVal > 1000000000000 ? timeVal : timeVal * 1000;
          const parsed = new Date(timeVal).getTime();
          if (!isNaN(parsed) && parsed > 0) return parsed;
          if (typeof timeVal === "string") {
            const cleanStr = timeVal.replace(" ", "T").split(".")[0];
            const sqlParsed = new Date(cleanStr).getTime();
            if (!isNaN(sqlParsed) && sqlParsed > 0) return sqlParsed;
          }
          return Date.now();
        };

        const mapped: MessageData[] = filteredForUser.map((item: any, idx: number) => {
          const rawTime = item.created_at || item.creation || item.modified || item.time;
          const rawTimestamp = parseTimestampSafe(rawTime);
          const sender = String(item.sender_id || item.sender || "");
          const isSenderLab = sender.toLowerCase().includes("lab") || sender.toLowerCase().includes("admin");
          const attUrl = item.attachment_url || item.file_url || item.attachment || item.url || item.file_path || "";
          const fName = item.file_name || item.filename || item.name_of_file || (attUrl ? attUrl.split('/').pop() : "") || "";
          const fSize = item.file_size || item.filesize || item.size || "";
          const repName = item.result_link || item.report_name || item.result_name || item.report || "";
          return {
            id: String(item.id || item.name || `${Date.now()}-${idx}`),
            text: item.message_text || item.text || item.message || item.content || "",
            time: rawTime ? new Date(rawTime).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }) : "الآن",
            rawTimestamp,
            isOutgoing: !isSenderLab,
            isUrgent: Boolean(item.is_urgent || item.is_urgent === 1),
            status: (item.is_read || item.is_read === 1 || String(item.is_read) === "1" || item.read === 1 || item.status === "read") ? "read" : "sent",
            fileName: fName,
            fileSize: fSize,
            isPdf: Boolean(repName) || (fName && fName.toLowerCase().endsWith('.pdf')) || (attUrl ? attUrl.toLowerCase().endsWith('.pdf') : false),
            attachmentUrl: attUrl || (fName ? `/files/${fName}` : ""),
            reportName: repName
          };
        });

        mapped.sort((a, b) => (a.rawTimestamp || 0) - (b.rawTimestamp || 0) || a.id.localeCompare(b.id));

        setMessages((prev) => {
          const messageMap = new Map();
          mapped.forEach(m => messageMap.set(m.id, m));
          prev.forEach(localMsg => {
            if (!messageMap.has(localMsg.id)) {
              if (localMsg.id.startsWith("temp-")) {
                const alreadyFetched = mapped.some(serverMsg => 
                  Boolean(serverMsg.text) && serverMsg.text === localMsg.text && serverMsg.isOutgoing === localMsg.isOutgoing
                );
                if (!alreadyFetched) messageMap.set(localMsg.id, localMsg);
              } else {
                messageMap.set(localMsg.id, localMsg);
              }
            }
          });
          const updated = Array.from(messageMap.values());
          updated.sort((a, b) => (a.rawTimestamp || 0) - (b.rawTimestamp || 0) || a.id.localeCompare(b.id));
          saveCachedPatientMessages(updated);
          return updated;
        });

        const hasUnreadIncoming = mapped.some(m => !m.isOutgoing && m.status !== "read");
        if (hasUnreadIncoming) {
          try {
            fetch("/api/chat-read", {
              method: "POST",
              headers: getFrappeHeaders(),
              credentials: "include",
              body: JSON.stringify({ contact_id: "Administrator" }),
            }).catch(() => {});
            fetch("/api/chat-read", {
              method: "POST",
              headers: getFrappeHeaders(),
              credentials: "include",
              body: JSON.stringify({ contact_id: "lab" }),
            }).catch(() => {});
          } catch {}
        }
      }
    } catch {} finally {
      isFetchingMessages.current = false;
    }
  }, []);

  useEffect(() => {
    fetchMessages();
    fetch("/api/chat-ping", { method: "POST", credentials: "include" }).catch(() => {});

    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchMessages();
      }
    }, 3500);

    const pingInterval = setInterval(() => {
      if (!document.hidden) {
        fetch("/api/chat-ping", { method: "POST", credentials: "include" }).catch(() => {});
      }
    }, 60000);

    return () => {
      clearInterval(interval);
      clearInterval(pingInterval);
    };
  }, [fetchMessages]);

  const handleSendMessage = async (text: string, files: File[], isUrgent?: boolean) => {
    const time = new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
    
    if (text) {
      const tempId = `temp-${Date.now()}`;
      const optimisticMsg: MessageData = {
        id: tempId,
        text,
        time,
        rawTimestamp: Date.now(),
        isOutgoing: true,
        status: "sending",
        isUrgent: Boolean(isUrgent)
      };
      setMessages(prev => [...prev, optimisticMsg]);
      isNearBottomRef.current = true;
      setTimeout(() => scrollToBottom(true), 50);

      (async () => {
        try {
          const res = await fetch("/api/chat-send", {
            method: "POST",
            headers: getFrappeHeaders(),
            credentials: "include",
            body: JSON.stringify({
              receiver_id: "lab",
              message_text: text,
              is_urgent: isUrgent ? 1 : 0
            })
          });
          const json = await res.json();
          const returnedMsg = json?.message?.data || json?.data;
          if (returnedMsg?.id) {
            setMessages(prev => prev.map(m => m.id === tempId ? {
              ...m,
              id: String(returnedMsg.id),
              status: "sent"
            } : m));
          } else {
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: "sent" } : m));
          }
        } catch {
          setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: "sent" } : m));
        }
      })();
    }

    if (files && files.length > 0) {
      alert("غير مسموح للمراجع بإرسال المرفقات.");
      return;
    }
  };

  const simulateStatus = (id: string) => {
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: "sent" } : m));
      setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, status: "read" } : m));
      }, 1500);
    }, 1000);
  };

  return (
    <div 
      className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 overflow-hidden relative" 
      dir="rtl"
    >
      {!isOnline && (
        <div className="bg-amber-500 text-white px-4 py-1.5 text-center text-xs font-bold flex items-center justify-center gap-2 z-[100]">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>أنت الآن في وضع عدم الاتصال (Offline)</span>
        </div>
      )}
      <div className="absolute top-4 left-4 z-20">
        <InstallPrompt />
      </div>

      {/* Messages */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 dark:bg-slate-950 flex flex-col relative precision-grid-light dark:precision-grid-dark z-0"
      >
        <button className="self-center bg-white dark:bg-slate-800 text-brand-primary dark:text-brand-primary border border-slate-200 dark:border-slate-700 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold mb-6 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm z-10">
          ⬆️ تحميل الرسائل الأقدم
        </button>
        
        {messages.map((msg, idx) => {
          const currentLabel = getMessageDateLabel(msg.rawTimestamp);
          const prevLabel = idx > 0 ? getMessageDateLabel(messages[idx - 1].rawTimestamp) : null;
          const showDateDivider = currentLabel && currentLabel !== prevLabel;

          return (
            <React.Fragment key={msg.id}>
              {showDateDivider && (
                <div className="flex items-center justify-center my-4 select-none">
                  <span className="px-3 py-1 bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-semibold shadow-sm border border-slate-300/50 dark:border-slate-700">
                    📅 {currentLabel}
                  </span>
                </div>
              )}
              <ChatMessage message={msg} />
            </React.Fragment>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSendMessage={handleSendMessage} hideQuickReplies={true} disableAttachments={true} />
    </div>
  );
}
