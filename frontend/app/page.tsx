
"use client";

import { useCallback, useEffect, useState } from "react";
import { TaskForm } from "@/components/TaskForm";
import { TaskFilters } from "@/components/TaskFilters";
import { TaskList } from "@/components/TaskList";
import { api } from "@/lib/api";
import type { Filter, Task, TaskStatus } from "@/types/task";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch tasks from backend
  const reload = useCallback(async () => {
    try {
      setTasks(await api.list());
      setError("");
    } catch {
      setError(
        "Unable to load tasks. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  // Update task status
  async function changeStatus(id: number, status: TaskStatus) {
    try {
      const updated = await api.updateStatus(id, status);

      setTasks((current) =>
        current.map((task) => (task.id === id ? updated : task))
      );

      setError("");
    } catch {
      setError("Unable to update the task. Please try again.");
    }
  }

  // Delete task
  async function remove(id: number) {
    try {
      await api.remove(id);

      setTasks((current) =>
        current.filter((task) => task.id !== id)
      );

      setError("");
    } catch {
      setError("Unable to delete the task. Please try again.");
    }
  }

  // Dashboard summary calculations
  const totalTasks = tasks.length;

  const todoTasks = tasks.filter(
    (task) => task.status === "todo"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "in_progress"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "done"
  ).length;

  // Search and status filtering
  const visible = tasks.filter((task) => {
    const matchesFilter =
      filter === "all" || task.status === filter;

    const searchText = search.trim().toLowerCase();

    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchText);

    return matchesFilter && matchesSearch;
  });

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">

      {/* Header */}
      <header className="mb-9 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-600">
            Your workspace
          </div>

          <h1 className="mt-1 text-4xl font-bold tracking-tight">
            TaskFlow
          </h1>

          <p className="mt-2 text-slate-500">
            Keep your work moving, one task at a time.
          </p>
        </div>

        <div className="hidden rounded-xl bg-indigo-100 px-4 py-3 text-indigo-700 sm:block">
          ✦ Focus on what matters
        </div>
      </header>

      {/* Dashboard Summary Cards */}
      <section
        aria-label="Task summary"
        className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4"
      >
        {[
          { label: "Total tasks", count: totalTasks },
          { label: "To Do", count: todoTasks },
          { label: "In Progress", count: inProgressTasks },
          { label: "Completed", count: completedTasks },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-sm text-slate-500">
              {item.label}
            </p>

            <p className="mt-2 text-2xl font-bold text-indigo-600">
              {item.count}
            </p>
          </div>
        ))}
      </section>

      {/* Main Content */}
      <div className="grid gap-7 lg:grid-cols-[320px_1fr]">

        {/* Task Creation Form */}
        <aside>
          <TaskForm
            onCreated={() => {
              setFilter("all");
              setSearch("");
              void reload();
            }}
          />
        </aside>

        {/* Task List */}
        <section>
          <div className="mb-5 flex flex-col gap-4">

            <div>
              <h2 className="text-xl font-semibold">
                Your tasks
              </h2>

              <p className="text-sm text-slate-500">
                A home for everything on your list.
              </p>
            </div>

            {/* Search */}
            <input
              aria-label="Search tasks"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-indigo-500"
            />

            {/* Status Filters */}
            <TaskFilters
              value={filter}
              onChange={setFilter}
            />
          </div>

          {/* Loading, Error and Task List */}
          {loading ? (
            <p className="py-10 text-center text-slate-500">
              Loading tasks…
            </p>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-center">
              <p className="font-medium text-rose-700">
                {error}
              </p>

              <button
                onClick={() => {
                  setLoading(true);
                  void reload();
                }}
                className="mt-3 text-sm font-semibold text-indigo-600 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : visible.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white px-5 py-12 text-center">
              <p className="text-lg font-semibold text-slate-700">
                {tasks.length === 0
                  ? "No tasks yet"
                  : "No matching tasks found"}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                {tasks.length === 0
                  ? "Create your first task to get started."
                  : "Try changing your search or status filter."}
              </p>
            </div>
          ) : (
            <TaskList
              tasks={visible}
              onStatus={changeStatus}
              onDelete={remove}
            />
          )}
        </section>
      </div>
    </main>
  );
}
