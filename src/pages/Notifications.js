// src/pages/Notifications.js
import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Notifications() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return setLoading(false);

    setLoading(true);
    api.get(`/notifications/${user.id}`)
      .then((res) => {
        // backend returns either array or { data: [] }
        const data = res.data.data || res.data;
        setNotes(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error fetching notifications:", err);
        toast.error("Failed to load notifications");
      })
      .finally(() => setLoading(false));
  }, [user]);

  async function markAsRead(notificationId) {
    // optimistic UI
    setNotes((prev) => prev.map(n => n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n));
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      toast.success("Marked as read");
    } catch (err) {
      console.error("Failed to mark read:", err);
      toast.error("Could not mark as read");
      // revert optimistic change (simple refetch)
      api.get(`/notifications/${user.id}`)
        .then((res) => setNotes(res.data.data || res.data))
        .catch(() => {});
    }
  }

  if (loading) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-pink-50 to-pink-100">
        <div className="text-5xl animate-bounce">🔔</div>
        <p className="mt-3 text-pink-600 font-semibold animate-pulse">
          Loading notifications...
        </p>
      </div>
  );
}


  return (
    <div className="min-h-screen p-6 bg-pink-50">
      <h1 className="text-2xl font-semibold text-center text-pink-600 mb-4">🔔 Notifications</h1>

      {notes.length === 0 ? (
        <p className="text-3xl text-center text-[#d77fa1] mb-8">No notifications yet.</p>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {notes.map((n) => (
            <div key={n.id} className={`p-4 rounded-xl bg-white shadow flex justify-between items-start ${n.read_at ? "opacity-60" : ""}`}>
              <div>
                <div className="text-sm text-gray-600 mb-1">{new Date(n.created_at).toLocaleString()}</div>
                <div className="text-gray-800">{n.data?.message || (n.data && JSON.stringify(n.data)) || n.type}</div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {n.read_at ? (
                  <span className="text-xs text-green-600">Read</span>
                ) : (
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="text-sm bg-pink-600 text-white px-3 py-1 rounded-lg"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
