import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from './tasks';

const KEY = 'focusflow.tasks.v1';

export async function loadTasks(): Promise<Task[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((item): item is Task =>
    typeof item === 'object' && item !== null &&
    typeof item.id === 'string' && typeof item.title === 'string' &&
    typeof item.completed === 'boolean'
  );
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(tasks));
}
