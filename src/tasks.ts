export type Priority = 'Low' | 'Medium' | 'High';
export type Task = {
  id: string;
  title: string;
  notes: string;
  category: string;
  priority: Priority;
  dueDate: string;
  completed: boolean;
  createdAt: string;
};

export type TaskInput = Pick<Task, 'title' | 'notes' | 'category' | 'priority' | 'dueDate'>;

export const categories = ['Study', 'Personal', 'Work'];

export const todayISO = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
};

export function makeTask(input: TaskInput): Task {
  return {
    ...input,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    completed: false,
    createdAt: new Date().toISOString(),
  };
}

export function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function taskStats(tasks: Task[]) {
  const completed = tasks.filter((task) => task.completed).length;
  const pending = tasks.length - completed;
  const dueToday = tasks.filter((task) => !task.completed && task.dueDate === todayISO()).length;
  const overdue = tasks.filter((task) => !task.completed && task.dueDate && task.dueDate < todayISO()).length;
  return { total: tasks.length, completed, pending, dueToday, overdue };
}
