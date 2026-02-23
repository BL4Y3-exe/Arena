"use client";

import { useState, useEffect } from "react";
import { availabilityApi, type Availability } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function AvailabilityPage() {
  const token = useAuthStore((s) => s.accessToken);
  const [slots, setSlots] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [day, setDay] = useState(0);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("11:00");
  const [saving, setSaving] = useState(false);

  const fetchSlots = async () => {
    if (!token) return;
    const data = await availabilityApi.get(token);
    setSlots(data);
    setLoading(false);
  };

  useEffect(() => { fetchSlots(); }, [token]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      await availabilityApi.add(token, { day_of_week: day, start_time: start, end_time: end });
      await fetchSlots();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    await availabilityApi.remove(token, id);
    setSlots((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold">Availability</h1>

      <form onSubmit={handleAdd} className="p-5 border border-border rounded-xl bg-card space-y-4">
        <h2 className="font-semibold">Add Time Slot</h2>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Day</label>
            <select
              value={day}
              onChange={(e) => setDay(+e.target.value)}
              className="w-full border border-input rounded-md px-2 py-1.5 text-sm bg-background"
            >
              {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Start</label>
            <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="w-full border border-input rounded-md px-2 py-1.5 text-sm bg-background" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">End</label>
            <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="w-full border border-input rounded-md px-2 py-1.5 text-sm bg-background" />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-primary text-primary-foreground px-5 py-1.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-60 transition"
        >
          {saving ? "Adding…" : "Add Slot"}
        </button>
      </form>

      <div>
        <h2 className="font-semibold mb-3">Your Schedule</h2>
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading…</p>
        ) : slots.length === 0 ? (
          <p className="text-muted-foreground text-sm">No availability set yet.</p>
        ) : (
          <ul className="space-y-2">
            {slots.map((slot) => (
              <li key={slot.id} className="flex items-center justify-between px-4 py-3 border border-border rounded-lg bg-card">
                <span className="text-sm font-medium">
                  {DAYS[slot.day_of_week]} · {slot.start_time} – {slot.end_time}
                </span>
                <button
                  onClick={() => handleDelete(slot.id)}
                  className="text-xs text-destructive hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
