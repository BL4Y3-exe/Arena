"use client";

import { useState } from "react";
import { profileApi, type Profile } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { useProfile } from "@/hooks/useArena";

const INTENSITY_OPTIONS = ["light", "medium", "hard"];

export default function ProfilePage() {
  const token = useAuthStore((s) => s.accessToken);
  const { profile, loading, setProfile } = useProfile();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<Profile>>({});

  const currentValues = { ...profile, ...form };

  const handleChange = (field: keyof Profile, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      let saved: Profile;
      if (profile) {
        saved = await profileApi.update(token, form);
      } else {
        saved = await profileApi.create(token, form as Profile);
      }
      setProfile(saved);
      setForm({});
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{profile ? "Edit Profile" : "Create Profile"}</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-md">{error}</div>}
        {success && <div className="bg-green-50 text-green-700 text-sm px-3 py-2 rounded-md">Profile saved!</div>}

        <Field label="Name" required>
          <input
            type="text"
            value={currentValues.name ?? ""}
            onChange={(e) => handleChange("name", e.target.value)}
            required
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Age">
            <input type="number" value={currentValues.age ?? ""} onChange={(e) => handleChange("age", +e.target.value)} className={inputCls} />
          </Field>
          <Field label="Weight (kg)">
            <input type="number" value={currentValues.weight ?? ""} onChange={(e) => handleChange("weight", +e.target.value)} className={inputCls} />
          </Field>
          <Field label="Height (cm)">
            <input type="number" value={currentValues.height ?? ""} onChange={(e) => handleChange("height", +e.target.value)} className={inputCls} />
          </Field>
          <Field label="Experience (years)">
            <input type="number" value={currentValues.experience_years ?? ""} onChange={(e) => handleChange("experience_years", +e.target.value)} className={inputCls} />
          </Field>
        </div>

        <Field label="Sport" required>
          <input
            type="text"
            value={currentValues.sport ?? ""}
            onChange={(e) => handleChange("sport", e.target.value)}
            required
            placeholder="e.g. Boxing, Judo, MMA"
            className={inputCls}
          />
        </Field>

        <Field label={`Skill Level: ${currentValues.skill_level ?? 5}`}>
          <input
            type="range"
            min={1}
            max={10}
            value={currentValues.skill_level ?? 5}
            onChange={(e) => handleChange("skill_level", +e.target.value)}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Beginner (1)</span><span>Elite (10)</span>
          </div>
        </Field>

        <Field label="City">
          <input type="text" value={currentValues.city ?? ""} onChange={(e) => handleChange("city", e.target.value)} className={inputCls} />
        </Field>

        <Field label="Training Intensity">
          <select
            value={currentValues.training_intensity ?? ""}
            onChange={(e) => handleChange("training_intensity", e.target.value)}
            className={inputCls}
          >
            <option value="">Select…</option>
            {INTENSITY_OPTIONS.map((o) => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
          </select>
        </Field>

        <Field label="Goals">
          <textarea
            value={currentValues.goals ?? ""}
            onChange={(e) => handleChange("goals", e.target.value)}
            rows={3}
            placeholder="e.g. Improve footwork, prepare for competition"
            className={inputCls}
          />
        </Field>

        <button
          type="submit"
          disabled={saving}
          className="bg-primary text-primary-foreground px-8 py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-60 transition"
        >
          {saving ? "Saving…" : "Save Profile"}
        </button>
      </form>
    </div>
  );
}

const inputCls =
  "w-full border border-input rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
