import { type FormEvent, useEffect, useState } from "react";
import "./App.css";

interface Task {
  id: number;
  title: string;
  done: boolean;
}

export function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then(setTasks)
      .catch(() => setTasks([]));
  }, []);

  async function addTask(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const task: Task = await res.json();
    setTasks((prev) => [...prev, task]);
    setTitle("");
  }

  async function toggleTask(id: number) {
    const res = await fetch(`/api/tasks/${id}/toggle`, { method: "PATCH" });
    if (!res.ok) return;
    const updated: Task = await res.json();
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }

  async function deleteTask(id: number) {
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  const remaining = tasks.filter((t) => !t.done).length;

  return (
    <main className="app">
      <header>
        <h1>Tasks</h1>
        <p className="count">
          {tasks.length === 0 ? "Nothing yet" : `${remaining} of ${tasks.length} remaining`}
        </p>
      </header>
      <form className="add" onSubmit={addTask}>
        <input
          aria-label="New task"
          placeholder="What needs doing?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>
      <ul className="tasks">
        {tasks.map((t) => (
          <li key={t.id} className={t.done ? "done" : undefined}>
            <label>
              <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} />
              <span>{t.title}</span>
            </label>
            <button
              className="delete"
              aria-label={`Delete ${t.title}`}
              onClick={() => deleteTask(t.id)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
