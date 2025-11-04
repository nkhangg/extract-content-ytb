import { useEffect, useRef, useState, useCallback } from "react";

function useSSE({
  baseUrl = import.meta.env.VITE_BASE_URL,
  url,
}: {
  url?: string; // cho phép undefined
  baseUrl?: string;
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Hàm start SSE
  const start = useCallback(() => {
    if (!url) return;
    if (eventSourceRef.current) return; // tránh mở nhiều lần

    const newUrl = new URL(url, baseUrl).toString();
    const es = new EventSource(newUrl, { withCredentials: true });
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    es.onerror = (err) => {
      console.error("SSE error:", err);
      es.close();
      eventSourceRef.current = null;
    };
  }, [url, baseUrl]);

  // cleanup khi unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  return { messages, start };
}

export default useSSE;
