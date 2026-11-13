import { type FormEvent, useEffect, useState } from "react";

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

  return (
    <main style={{ fontFamily: "system-ui", maxWidth: 480, margin: "2rem auto" }}>
      <h1>Tasks</h1>
      <form onSubmit={addTask}>
        <input
          aria-label="New task"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>
      <ul>
        {tasks.map((t) => (
          <li key={t.id}>{t.done ? <s>{t.title}</s> : t.title}</li>
        ))}
      </ul>
    </main>
  );
}
