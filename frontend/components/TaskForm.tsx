
"use client";

import { FormEvent, useState } from "react";
import { api } from "@/lib/api";
import type { TaskPriority } from "@/types/task";

export function TaskForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle || !trimmedTitle.replace(/["']/g, "").trim()) {
      setError("Please enter a valid task title.");
      return;
    }

    setError("");
    setSaving(true);

    try {
      await api.create(trimmedTitle, description, priority);

      setTitle("");
      setDescription("");
      setPriority("medium");

      onCreated();
    } catch {
      setError("Unable to create task. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold">Add a task</h2>

      <p className="mt-1 text-sm text-slate-500">
        Get an idea out of your head and into your plan.
      </p>

      <label htmlFor="title" className="mt-5 block text-sm font-medium">
        Title
      </label>

      <input
        id="title"
        required
        maxLength={255}
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setError("");
        }}
        placeholder="What needs doing?"
        className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-indigo-500"
      />

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      <label
        htmlFor="description"
        className="mt-4 block text-sm font-medium"
      >
        Description{" "}
        <span className="font-normal text-slate-400">optional</span>
      </label>

      <textarea
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        placeholder="Add a little context"
        className="mt-2 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-indigo-500"
      />

      <label
        htmlFor="priority"
        className="mt-4 block text-sm font-medium"
      >
        Priority
      </label>

      <select
        id="priority"
        value={priority}
        onChange={(e) =>
          setPriority(e.target.value as TaskPriority)
        }
        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-indigo-500"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <button
        type="submit"
        disabled={saving}
        className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {saving ? "Adding…" : "Add task"}
      </button>
    </form>
  );
}
