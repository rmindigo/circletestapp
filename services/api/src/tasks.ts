export interface Task {
  id: number;
  title: string;
  done: boolean;
}

export class TaskStore {
  private tasks: Task[] = [];
  private nextId = 1;

  list(): Task[] {
    return [...this.tasks];
  }

  create(title: string): Task {
    const task = { id: this.nextId++, title, done: false };
    this.tasks.push(task);
    return task;
  }

  toggle(id: number): Task | undefined {
    const task = this.tasks.find((t) => t.id === id);
    if (task) task.done = !task.done;
    return task;
  }

  remove(id: number): boolean {
    const before = this.tasks.length;
    this.tasks = this.tasks.filter((t) => t.id !== id);
    return this.tasks.length < before;
  }
}
