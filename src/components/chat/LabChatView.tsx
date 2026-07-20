"use client";

import React, { useState, useEffect, useRef, DragEvent, useCallback } from "react";
import { ChatMessage, MessageData } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { RefreshCw } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  type: "center";
  avatar: string;
  lastMessage: string;
  time: string;
  rawTimestamp: number;  // epoch ms for sorting
  unread: number;
  online: boolean;
  lastSeen?: string;
  hasUrgent?: boolean;
}

const CONTACTS_CACHE_KEY = "newlab_chat_contacts_cache_v2";

function getInitialContacts(): Contact[] {
  try {
    const raw = localStorage.getItem(CONTACTS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Filter out any legacy mock items
        const realContacts = parsed.filter(
          c => c && c.id && c.id !== "1" && c.id !== "2" && c.id !== "3" && c.name !== "د. أحمد محمود" && c.name !== "عيادة الشفاء"
        );
        return realContacts;
      }
    }
  } catch {}
  return [];
}

type FilterType = "all" | "unread" | "urgent";

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

function getCachedMessages(contactId: string): MessageData[] {
  if (!contactId) return [];
  try {
    const raw = localStorage.getItem(`newlab_chat_msgs_${contactId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function saveCachedMessages(contactId: string, msgs: MessageData[]) {
  if (!contactId) return;
  try {
    localStorage.setItem(`newlab_chat_msgs_${contactId}`, JSON.stringify(msgs));
  } catch {}
}

function extractArray(obj: any): any[] {
  if (!obj) return [];
  if (Array.isArray(obj)) return obj;
  if (Array.isArray(obj.data)) return obj.data;
  if (obj.message) return extractArray(obj.message);
  return [];
}
// دالة صياغة وقت آخر ظهور للمستخدم بشكل عربي طبيعي (مثل واتساب)
function formatLastSeenText(lastSeen?: string, isOnline?: boolean): string {
  if (isOnline) return "متصل الآن";
  if (!lastSeen) return "غير متصل";
  try {
    const cleanStr = lastSeen.replace(" ", "T").split(".")[0];
    const date = new Date(cleanStr);
    if (isNaN(date.getTime())) return "غير متصل";
    
    const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diffMin <= 1) return "آخر ظهور قبل دقيقة";
    if (diffMin < 60) return `آخر ظهور منذ ${diffMin} دقيقة`;
    
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `آخر ظهور منذ ${diffHours} ساعة`;
    
    return `آخر ظهور ${date.toLocaleDateString("ar-SA", { month: "short", day: "numeric" })} ${date.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}`;
  } catch {
    return "غير متصل";
  }
}

// دالة ذكية لتنسيق وقت آخر رسالة (مثل واتساب)
function formatContactTime(rawTime: string | number | Date): string {
  if (!rawTime) return "";
  const date = new Date(rawTime);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return date.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
  } else if (isYesterday) {
    return "أمس";
  } else {
    return date.toLocaleDateString("ar-SA", { year: "numeric", month: "2-digit", day: "2-digit" });
  }
}
export function LabChatView() {
  const [contacts, setContacts] = useState<Contact[]>(getInitialContacts);
  const [activeContact, setActiveContact] = useState<Contact | null>(() => contacts[0] || null);
  const [isContactsLoading, setIsContactsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const [messages, setMessages] = useState<MessageData[]>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const lastScrollContactIdRef = useRef<string | null>(null);
  const activeContactRef = useRef(activeContact);
  const messagesRef = useRef(messages);

  useEffect(() => {
    activeContactRef.current = activeContact;
    messagesRef.current = messages;
  }, [activeContact, messages]);

  // On mount: verify session is still valid. If the session user changed,
  // wipe the contacts cache so stale contacts are never shown.
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
        if (currentUser && savedUser && currentUser.toLowerCase() !== savedUser.toLowerCase()) {
          // Different user — wipe all stale caches
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith("newlab_chat") || key.startsWith("newlab_patient"))) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(k => localStorage.removeItem(k));
        }
        if (currentUser) {
          localStorage.setItem("newlab_current_user", currentUser);
        }
      })
      .catch(() => {});
  }, []);

  // Tracks contactIds where we marked as read locally — suppresses poll from resetting unread badge
  const suppressUnreadUntil = useRef<Map<string, number>>(new Map());

  const isFetchingContacts = useRef(false);

const fetchContacts = useCallback(async (isPolling = false) => {
    if (isFetchingContacts.current) return;
    isFetchingContacts.current = true;
    if (!isPolling) setIsContactsLoading(true); // تشغيل الأيقونة فقط في التحميل الأول أو اليدوي
    
    try {
      const res = await fetch("/api/chat-contacts", { credentials: "include", cache: "no-store" });
      const json = await res.json();
      const rawList = extractArray(json);
      
      if (Array.isArray(rawList) && rawList.length > 0) {
        const now = Date.now();
        const mapped = rawList.map((item: any, idx: number) => {
          const cid = String(item.user_id || item.id || idx);
          const centerName = item.center_name || item.name || "مركز طبي";
          const suppressUntil = suppressUnreadUntil.current.get(cid) || 0;
          
          const isActiveContact = activeContactRef.current?.id === cid;
          const unreadNum = isActiveContact ? 0 : (now < suppressUntil ? 0 : Number(item.unread_count || item.unread || 0));
          
          const lastMsgText = item.last_message || "";
          
          const rawTime = item.last_message_time || item.updated_at || item.modified || item.creation || item.time;
          const timeFormatted = formatContactTime(rawTime);
          
          const parseTimestampSafe = (timeVal: any): number => {
            if (!timeVal) return 0;
            if (typeof timeVal === "number") return timeVal;
            const parsed = new Date(timeVal).getTime();
            if (!isNaN(parsed) && parsed > 0) return parsed;
            if (typeof timeVal === "string") {
              const sqlParsed = new Date(timeVal.replace(" ", "T")).getTime();
              if (!isNaN(sqlParsed) && sqlParsed > 0) return sqlParsed;
            }
            return 0;
          };

          const rawTimestamp = parseTimestampSafe(rawTime);
          
          const isOnline = item.online !== undefined ? Boolean(item.online || item.is_online) : true;
          const lastSeenStr = item.last_seen || item.lastSeen || "";

          return {
            id: cid, name: centerName, type: "center" as const, avatar: centerName.trim().substring(0, 2),
            lastMessage: lastMsgText, time: timeFormatted, rawTimestamp, backendIndex: idx,
            unread: unreadNum, online: isOnline, lastSeen: lastSeenStr,
          };
        });

        // الفرز بناءً على الوقت بدقة (الأحدث أولاً ثم الفهرس)
        mapped.sort((a, b) => (b.rawTimestamp || 0) - (a.rawTimestamp || 0) || (a.backendIndex - b.backendIndex));

        setContacts(prev => {
          const isChanged = JSON.stringify(prev) !== JSON.stringify(mapped);
          if (isChanged) {
            try { localStorage.setItem(CONTACTS_CACHE_KEY, JSON.stringify(mapped)); } catch {}
            return mapped as Contact[];
          }
          return prev;
        });

        setActiveContact((prev: Contact | null) => {
          if (!prev) return (mapped[0] as Contact) || null;
          const updated = mapped.find(c => c.id === prev.id);
          return updated ? (updated as Contact) : prev;
        });
      }
    } catch {
    } finally {
      isFetchingContacts.current = false;
      if (!isPolling) setIsContactsLoading(false); // إيقاف الأيقونة فقط إذا كان التحميل يدوياً
    }
  }, []);
  const isFetchingMessages = useRef(false);

const fetchMessages = useCallback(async (contactId : string) => {
    if (!contactId || isFetchingMessages.current) return;
    isFetchingMessages.current = true;
    try {
      const url = `/api/chat-messages?contact_id=${encodeURIComponent(contactId)}`;
      // 🚀 إيقاف الكاش هو ما سيجعل الرسالة تصل في أجزاء من الثانية بدلاً من دقيقة!
      const res = await fetch(url, { credentials: "include", cache: "no-store" });
      if (!res.ok) return;
      
      const json = await res.json();
      const rawList = extractArray(json);
      if (!Array.isArray(rawList)) return;

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

      const mapped = rawList.map((item) => {
        const isSenderContact = String(item.sender_id || "").toLowerCase() === contactId.toLowerCase();
        const rawTime = item.created_at || item.creation || item.modified || item.updated_at || item.time;
        const rawTimestamp = parseTimestampSafe(rawTime);
        return {
          id: String(item.id),
          text: item.message_text || "",
          time: item.created_at ? new Date(item.created_at).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }) : "",
          rawTimestamp,
          isOutgoing: !isSenderContact,
          isUrgent: Boolean(item.is_urgent),
          status: (Number(item.is_read) === 1) ? "read" : "sent",
          fileName: item.file_name || "",
          fileSize: item.file_size || "",
          isPdf: Boolean(item.result_link || item.report_name || item.result_name) || (item.file_name && item.file_name.toLowerCase().endsWith('.pdf')) || (item.attachment_url ? item.attachment_url.toLowerCase().endsWith('.pdf') : false),
          attachmentUrl: item.attachment_url || (item.file_name ? `/files/${item.file_name}` : ""),
          reportName: item.result_link || item.report_name || item.result_name || ""
        };
      });

      // 🚀 إذا وصلت رسالة جديدة (غير مقروءة) وأنت فاتح المحادثة، أخبر السيرفر فوراً أنك قرأتها!
      const hasUnreadIncoming = mapped.some(m => !m.isOutgoing && m.status !== "read");
      if (hasUnreadIncoming && activeContactRef.current?.id === contactId) {
         fetch("/api/chat-read", {
           method: "POST", headers: getFrappeHeaders(), credentials: "include", cache: "no-store",
           body: JSON.stringify({ contact_id: contactId })
         }).catch(() => {});
      }

      mapped.sort((a, b) => (a.rawTimestamp || 0) - (b.rawTimestamp || 0));

      // 2. تحديث الـ State مع منع التكرار الذكي
    setMessages((prev) => {
      if (activeContactRef.current?.id !== contactId) return prev;
      
      const messageMap = new Map();
      
      // أ. نضع رسائل السيرفر أولاً (هي الأصح دائماً وتملك حالة الصحين)
      mapped.forEach(m => messageMap.set(m.id, m));
      
      // ب. نمر على رسائل الشاشة، ولا نضيف الرسالة المؤقتة أو المحلية إذا كان السيرفر قد جلبها بالفعل
      prev.forEach(localMsg => {
        if (!messageMap.has(localMsg.id)) {
          const isLocalOrTemp = localMsg.id.startsWith("temp-") || localMsg.id.startsWith("file-sent-") || !mapped.some(m => m.id === localMsg.id);
          if (isLocalOrTemp) {
            // هل السيرفر جلب رسالة بنفس النص أو نفس اسم الملف للتو؟ إذاً تجاهل المحلية/المؤقتة
            const alreadyFetched = mapped.some(serverMsg => {
              if (localMsg.fileName || serverMsg.fileName) {
                return serverMsg.fileName === localMsg.fileName && serverMsg.isOutgoing === localMsg.isOutgoing;
              }
              return Boolean(serverMsg.text) && serverMsg.text === localMsg.text && serverMsg.isOutgoing === localMsg.isOutgoing;
            });
            if (!alreadyFetched) messageMap.set(localMsg.id, localMsg);
          } else {
            messageMap.set(localMsg.id, localMsg);
          }
        }
      });
      
      const uniqueMessages = Array.from(messageMap.values());
      uniqueMessages.sort((a, b) => (a.rawTimestamp || 0) - (b.rawTimestamp || 0));
      
      saveCachedMessages(contactId, uniqueMessages);
      return uniqueMessages;
    });
    } catch (e) {
      console.error("Error fetching messages:", e);
    } finally {
      isFetchingMessages.current = false;
    }
  }, []);

  // Contacts poll every 8s + Presence heartbeat every 60s
  useEffect(() => {
    fetchContacts(false); // التحميل الأولي (يُظهر الدائرة)
    fetch("/api/chat-ping", { method: "POST", credentials: "include" }).catch(() => {});
    
    const contactsInterval = setInterval(() => {
      if (!document.hidden) {
        fetchContacts(true); // التحديث الصامت (لا يُظهر الدائرة)
      }
    }, 3500);

    const pingInterval = setInterval(() => {
      if (!document.hidden) {
        fetch("/api/chat-ping", { method: "POST", credentials: "include" }).catch(() => {});
      }
    }, 60000);

    return () => {
      clearInterval(contactsInterval);
      clearInterval(pingInterval);
    };
  }, [fetchContacts]);

  // Messages fetch + poll — triggered only when active contact changes
  useEffect(() => {
    if (!activeContact?.id) return;
    const contactId = activeContact.id;

    // Show cache instantly (zero flicker)
    const cached = getCachedMessages(contactId);
    setMessages(cached.length > 0 ? cached : []);

    // Fetch full message list from server (always, to get fresh read status)
    fetchMessages(contactId);

    // Poll full list every 3.5s so read-status updates and new messages propagate quickly
    const interval = setInterval(() => {
      if (!document.hidden && activeContactRef.current?.id === contactId) {
        fetchMessages(contactId);
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [activeContact?.id, fetchMessages]);
const markMessagesRead = (contactId: string) => {
    setMessages(prev => {
      if (activeContactRef.current?.id !== contactId) return prev;
      
      const updated: MessageData[] = prev.map(m => 
        !m.isOutgoing ? { ...m, status: "read" as const } : m
      );
      
      saveCachedMessages(contactId, updated);
      return updated;
    });

    suppressUnreadUntil.current.set(contactId, Date.now() + 15000);
    setContacts(prev => {
      const updated = prev.map(c => c.id === contactId ? { ...c, unread: 0 } : c);
      try { localStorage.setItem(CONTACTS_CACHE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });

    // 🚀 إضافة cache: "no-store" هنا ضرورية جداً
    fetch("/api/chat-read", {
      method: "POST",
      headers: getFrappeHeaders(),
      credentials: "include",
      cache: "no-store", 
      body: JSON.stringify({ contact_id: contactId }),
    }).then(() => {
      suppressUnreadUntil.current.delete(contactId);
    }).catch(() => {
      suppressUnreadUntil.current.delete(contactId);
    });
  };

  const selectContact = (contact: Contact) => {
    setActiveContact(contact);
    setShowMobileChat(true);
    markMessagesRead(contact.id);
  };

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    
    if (filter === "unread") return (c.unread || 0) > 0;
    if (filter === "urgent") return c.hasUrgent;
    return true;
  });

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
    if (showMobileChat || activeContact) {
      const contactChanged = lastScrollContactIdRef.current !== activeContact?.id;
      if (contactChanged) {
        lastScrollContactIdRef.current = activeContact?.id || null;
        isNearBottomRef.current = true;
        scrollToBottom(false);
      } else if (isNearBottomRef.current) {
        scrollToBottom(true);
      }
    }
  }, [messages, showMobileChat, activeContact]);

  const handleSendMessage = async (text: string, files: File[], isUrgent?: boolean) => {
    if (!activeContact?.id) return;
    const time = new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
    
    if (text) {
      const tempId = `temp-${Date.now()}`;
      const optimisticMsg: MessageData = { id: tempId, text, time, rawTimestamp: Date.now(), isOutgoing: true, status: "sending", isUrgent: Boolean(isUrgent) };
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
              receiver_id: activeContact.id,
              message_text: text,
              is_urgent: isUrgent ? 1 : 0
            })
          });

          if (!res.ok) {
            const errorText = await res.text();
            console.error("🚨 API Error Status:", res.status);
            console.error("🚨 API Error Body:", errorText);
            throw new Error(`HTTP error! status: ${res.status}`);
          }

          const json = await res.json();
          const returnedMsg = json?.message?.data || json?.data;
          if (returnedMsg?.id) {
            const realId = String(returnedMsg.id);
            setMessages(prev => {
              if (prev.some(m => m.id === realId)) {
                return prev.filter(m => m.id !== tempId);
              }
              return prev.map(m => m.id === tempId ? { ...m, id: realId, status: "sent" } : m);
            });
          } else {
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: "sending" } : m));
          }
        } catch {
          setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: "sending" } : m));
        }
      })();
    }

    const pdfFiles = files.filter(f => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (pdfFiles.length !== files.length && files.length > 0) {
      alert("يُسمح برفع ملفات بصيغة PDF فقط (.pdf). تم استبعاد الملفات غير المدعومة.");
    }
    if (pdfFiles.length === 0 && !text) return;

    for (let i = 0; i < pdfFiles.length; i++) {
      const file = pdfFiles[i];
      const tempFileId = `temp-file-${Date.now()}-${i}`;
      const fileSizeStr = (file.size / 1024 / 1024).toFixed(2) + " MB";
      const localUrl = URL.createObjectURL(file);
      
      setMessages(prev => [...prev, {
        id: tempFileId, fileName: file.name, fileSize: fileSizeStr,
        isPdf: file.type === "application/pdf" || file.name.endsWith(".pdf"),
        attachmentUrl: localUrl,
        time, rawTimestamp: Date.now(), isOutgoing: true, status: "sending", isUrgent: Boolean(isUrgent)
      }]);
      isNearBottomRef.current = true;
      setTimeout(() => scrollToBottom(true), 50);

      (async () => {
        try {
          const formData = new FormData();
          formData.append("file", file, file.name);
          formData.append("is_private", "0");
          
          const uploadRes = await fetch("/api/upload-proxy", {
            method: "POST",
            headers: { "X-Frappe-CSRF-Token": (window as any).frappe?.csrf_token || "" },
            body: formData,
          });
          
          if (!uploadRes.ok) throw new Error("Upload failed");

          const uploadJson = await uploadRes.json();
          const fileUrl = uploadJson?.message?.file_url;
          if (!fileUrl) throw new Error("No URL");

          const payload = {
              receiver_id: activeContact.id,
              message_text: "",
              file_name: file.name,
              file_size: fileSizeStr,
              attachment_url: fileUrl,
              is_urgent: isUrgent ? 1 : 0
          };

          const sendRes = await fetch("/api/chat-send", {
            method: "POST", headers: getFrappeHeaders(), credentials: "include",
            body: JSON.stringify(payload)
          });

          if (!sendRes.ok) throw new Error("Chat send failed");
          
          const sendJson = await sendRes.json();
          const returnedMsg = sendJson?.message?.data || sendJson?.data;
          const realFileId = returnedMsg?.id ? String(returnedMsg.id) : `file-sent-${Date.now()}-${i}`;

          setMessages(prev => {
            if (prev.some(m => m.id === realFileId)) {
              return prev.filter(m => m.id !== tempFileId);
            }
            return prev.map(m => m.id === tempFileId ? { ...m, id: realFileId, status: "sent", attachmentUrl: fileUrl } : m);
          });
        } catch (error) {
          console.error("Critical Failure:", error);
          setMessages(prev => prev.filter(m => m.id !== tempFileId));
          alert("فشل رفع الملف، يرجى المحاولة مرة أخرى.");
        }
      })();
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      handleSendMessage("", droppedFiles, false);
    }
  };

  return (
    <div className="flex h-full w-full bg-white dark:bg-slate-900 overflow-hidden" dir="rtl">
      
      {/* Sidebar - Hidden on mobile if chat is active */}
      <div className={`${showMobileChat ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 lg:w-[350px] border-l border-slate-200 dark:border-slate-800 flex-col bg-white dark:bg-slate-900 z-10 flex-shrink-0`}>
        <div className="p-3 md:p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="بحث عن مركز طبي أو عيادة..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-4 pr-10 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-full outline-none text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-primary/20 transition-all"
              />
              <svg className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
           <button
  onClick={() => fetchContacts(false)} // 🚀 التعديل هنا
  disabled={isContactsLoading}
  title="تحديث قائمة المراكز"
  className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-brand-primary transition-colors disabled:opacity-50"
>
              <RefreshCw className={`w-4 h-4 ${isContactsLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
          
          {/* Filters */}
          <div className="flex gap-2">
            <button 
              onClick={() => setFilter("all")} 
              className={`flex-1 text-xs py-1.5 rounded-full font-semibold transition-colors ${filter === "all" ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              الكل
            </button>
            <button 
              onClick={() => setFilter("unread")} 
              className={`flex-1 text-xs py-1.5 rounded-full font-semibold transition-colors ${filter === "unread" ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              غير مقروءة
            </button>
            <button 
              onClick={() => setFilter("urgent")} 
              className={`flex-1 text-xs py-1.5 rounded-full font-semibold transition-colors ${filter === "urgent" ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              حرجة 🔴
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredContacts.length === 0 && (
            <div className="text-center p-8 text-slate-400 text-sm">لا يوجد محادثات مطابقة</div>
          )}
          {filteredContacts.map(contact => (
            <div
              key={contact.id}
              onClick={() => selectContact(contact)}
              className={`flex p-3 md:p-4 cursor-pointer border-b border-slate-100 dark:border-slate-800/50 transition-colors ${activeContact?.id === contact.id ? 'bg-slate-50 dark:bg-slate-800 border-r-4 border-r-brand-primary' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
            >
              <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold shadow-sm bg-gradient-to-br from-brand-primary to-blue-600 relative">
                {contact.avatar}
                {contact.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                )}
              </div>
              <div className="mr-3 flex-1 overflow-hidden flex flex-col justify-center">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate text-[14px] md:text-[15px]">{contact.name}</span>
                  <span className="text-[11px] md:text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap mr-2">{contact.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs md:text-sm truncate max-w-[75%] ${contact.hasUrgent ? 'text-red-500 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                    {contact.hasUrgent && '🔴 '} {contact.lastMessage}
                  </span>
                  {contact.unread > 0 && (
                    <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      {contact.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area - Hidden on mobile if NO chat is active */}
      <div 
        className={`${!showMobileChat ? 'hidden md:flex' : 'flex'} flex-1 flex-col relative bg-slate-50 dark:bg-slate-950 overflow-hidden`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 bg-brand-primary/90 dark:bg-brand-primary/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white transition-all pointer-events-none">
            <div className="text-6xl mb-4 animate-bounce">📂</div>
            <div className="text-2xl font-bold">إفلات الملف لإرساله فوراً</div>
          </div>
        )}

        {activeContact ? (
          <>
            <div className="flex items-center px-4 md:px-6 py-3 md:py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-10 flex-shrink-0">
              <button 
                onClick={() => setShowMobileChat(false)}
                className="md:hidden ml-3 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                title="العودة للقائمة"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
              <div className="w-10 h-10 md:w-11 md:h-11 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold shadow-sm bg-gradient-to-br from-brand-primary to-blue-600">
                {activeContact.avatar}
              </div>
              <div className="mr-3 md:mr-4 flex flex-col">
                <span className="font-bold text-slate-800 dark:text-slate-100 text-[14px] md:text-[15px]">{activeContact.name}</span>
                <span className="text-[11px] md:text-[12px] text-brand-primary dark:text-brand-primary flex items-center gap-1.5">
                  {activeContact.online ? (
                    <><span className="w-2 h-2 rounded-full bg-green-500"></span>متصل الآن</>
                  ) : (
                    <span className="text-slate-400">آخر ظهور: {activeContact.time}</span>
                  )}
                </span>
              </div>
            </div>

            <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col relative precision-grid-light dark:precision-grid-dark z-0"
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

            <ChatInput onSendMessage={handleSendMessage} />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-8 text-center bg-slate-50 dark:bg-slate-950">
            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            <h2 className="text-lg font-bold mb-2">بوابة المراسلة</h2>
            <p className="text-sm">قم باختيار محادثة من القائمة للبدء</p>
          </div>
        )}
      </div>
    </div>
  );
}
