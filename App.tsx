import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { loadTasks, saveTasks } from './src/storage';
import { categories, makeTask, Priority, Task, TaskInput, taskStats, todayISO, validDate } from './src/tasks';

type Screen = 'Home' | 'Tasks' | 'Editor';
type Filter = 'All' | 'Pending' | 'Completed';
const ink = '#172340';
const muted = '#71809A';
const blue = '#4868F6';

function Button({ label, onPress, secondary = false, danger = false }: { label: string; onPress: () => void; secondary?: boolean; danger?: boolean }) {
  return <TouchableOpacity accessibilityRole="button" onPress={onPress} style={[styles.button, secondary && styles.secondaryButton, danger && styles.dangerButton]}>
    <Text style={[styles.buttonText, secondary && styles.secondaryButtonText]}>{label}</Text>
  </TouchableOpacity>;
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <TouchableOpacity accessibilityRole="button" onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </TouchableOpacity>;
}

function TaskCard({ task, onToggle, onEdit, onDelete }: { task: Task; onToggle: () => void; onEdit: () => void; onDelete: () => void }) {
  const overdue = !task.completed && !!task.dueDate && task.dueDate < todayISO();
  return <View style={styles.taskCard}>
    <TouchableOpacity accessibilityRole="checkbox" accessibilityState={{ checked: task.completed }} onPress={onToggle} style={[styles.check, task.completed && styles.checked]}>
      <Text style={styles.checkLabel}>{task.completed ? '✓' : ''}</Text>
    </TouchableOpacity>
    <View style={styles.taskBody}>
      <Text style={[styles.taskTitle, task.completed && styles.doneText]}>{task.title}</Text>
      <Text style={styles.taskMeta}>{task.category}  ·  {task.priority} priority{task.dueDate ? `  ·  ${task.dueDate}` : ''}</Text>
      {overdue && <Text style={styles.overdue}>Overdue</Text>}
      {!!task.notes && <Text style={styles.taskNotes} numberOfLines={2}>{task.notes}</Text>}
      <View style={styles.taskActions}>
        <TouchableOpacity onPress={onEdit}><Text style={styles.actionText}>Edit</Text></TouchableOpacity>
        <TouchableOpacity onPress={onDelete}><Text style={[styles.actionText, styles.deleteText]}>Delete</Text></TouchableOpacity>
      </View>
    </View>
  </View>;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('Home');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('Study');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [formError, setFormError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  useEffect(() => {
    loadTasks().then(setTasks).catch(() => setStorageError('Could not load saved tasks.')).finally(() => setLoaded(true));
  }, []);
  useEffect(() => {
    if (loaded) saveTasks(tasks).then(() => setStorageError('')).catch(() => setStorageError('Changes could not be saved on this device.'));
  }, [tasks, loaded]);

  const stats = useMemo(() => taskStats(tasks), [tasks]);
  const visible = useMemo(() => tasks.filter(task => {
    const matchesQuery = `${task.title} ${task.notes}`.toLowerCase().includes(query.toLowerCase().trim());
    const matchesStatus = filter === 'All' || (filter === 'Completed' ? task.completed : !task.completed);
    return matchesQuery && matchesStatus && (categoryFilter === 'All' || task.category === categoryFilter) && (priorityFilter === 'All' || task.priority === priorityFilter);
  }).sort((a, b) => Number(a.completed) - Number(b.completed) || a.dueDate.localeCompare(b.dueDate) || b.createdAt.localeCompare(a.createdAt)), [tasks, query, filter, categoryFilter, priorityFilter]);

  function openEditor(task?: Task) {
    setEditingId(task?.id ?? null);
    setTitle(task?.title ?? ''); setNotes(task?.notes ?? ''); setCategory(task?.category ?? 'Study');
    setPriority(task?.priority ?? 'Medium'); setDueDate(task?.dueDate ?? ''); setFormError('');
    setScreen('Editor');
  }
  function submit() {
    const cleanTitle = title.trim();
    const cleanDate = dueDate.trim();
    if (!cleanTitle) { setFormError('Please enter a task title.'); return; }
    if (cleanDate && !validDate(cleanDate)) { setFormError('Use a valid date in YYYY-MM-DD format.'); return; }
    const input: TaskInput = { title: cleanTitle, notes: notes.trim(), category, priority, dueDate: cleanDate };
    setTasks(current => editingId ? current.map(task => task.id === editingId ? { ...task, ...input } : task) : [makeTask(input), ...current]);
    setScreen('Tasks');
  }
  function remove(task: Task) {
    const perform = () => setTasks(current => current.filter(item => item.id !== task.id));
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`Delete “${task.title}”?`)) perform();
    } else Alert.alert('Delete task?', task.title, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: perform }]);
  }

  return <SafeAreaView style={styles.safe}>
    <ExpoStatusBar style="dark" />
    <View style={styles.shell}>
      <View style={styles.header}><View><Text style={styles.brand}>focusflow<Text style={styles.brandDot}>.</Text></Text><Text style={styles.headerSub}>Plan clearly. Finish confidently.</Text></View><View style={styles.avatar}><Text style={styles.avatarText}>KV</Text></View></View>
      {!!storageError && <Text style={styles.errorBanner}>{storageError}</Text>}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {screen === 'Home' && <>
          <View style={styles.hero}><Text style={styles.eyebrow}>YOUR WORKSPACE</Text><Text style={styles.heroTitle}>Make today count.</Text><Text style={styles.heroCopy}>A simple place to collect tasks and keep your day moving.</Text><Button label="+ New task" onPress={() => openEditor()} /></View>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            {[['Total tasks', stats.total, '#E9EEFF'], ['In progress', stats.pending, '#E7F7F5'], ['Completed', stats.completed, '#EFF8EA'], ['Due today', stats.dueToday, '#FFF1E6']].map(([label, value, color]) => <View key={String(label)} style={[styles.statCard, { backgroundColor: String(color) }]}><Text style={styles.statNumber}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>)}
          </View>
          {stats.overdue > 0 && <Text style={styles.overdueBanner}>{stats.overdue} overdue task{stats.overdue === 1 ? '' : 's'} need attention.</Text>}
          <View style={styles.sectionRow}><Text style={styles.sectionTitle}>Up next</Text><TouchableOpacity onPress={() => setScreen('Tasks')}><Text style={styles.link}>See all →</Text></TouchableOpacity></View>
          {tasks.filter(task => !task.completed).slice(0, 3).map(task => <TaskCard key={task.id} task={task} onToggle={() => setTasks(current => current.map(item => item.id === task.id ? { ...item, completed: !item.completed } : item))} onEdit={() => openEditor(task)} onDelete={() => remove(task)} />)}
          {stats.pending === 0 && <View style={styles.empty}><Text style={styles.emptyIcon}>✦</Text><Text style={styles.emptyTitle}>All clear</Text><Text style={styles.emptyCopy}>Create a task to start planning your day.</Text></View>}
        </>}
        {screen === 'Tasks' && <>
          <View style={styles.sectionRow}><View><Text style={styles.pageTitle}>My tasks</Text><Text style={styles.pageSub}>{stats.pending} pending · {stats.completed} completed</Text></View><TouchableOpacity onPress={() => openEditor()} style={styles.smallAdd}><Text style={styles.smallAddText}>＋</Text></TouchableOpacity></View>
          <TextInput accessibilityLabel="Search tasks" placeholder="Search tasks or notes" placeholderTextColor="#9CA7BA" value={query} onChangeText={setQuery} style={styles.input} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>{(['All', 'Pending', 'Completed'] as Filter[]).map(item => <Chip key={item} label={item} active={filter === item} onPress={() => setFilter(item)} />)}</ScrollView>
          <Text style={styles.filterLabel}>CATEGORY</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>{['All', ...categories].map(item => <Chip key={item} label={item} active={categoryFilter === item} onPress={() => setCategoryFilter(item)} />)}</ScrollView>
          <Text style={styles.filterLabel}>PRIORITY</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>{['All', 'High', 'Medium', 'Low'].map(item => <Chip key={item} label={item} active={priorityFilter === item} onPress={() => setPriorityFilter(item)} />)}</ScrollView>
          <Text style={styles.results}>{visible.length} result{visible.length === 1 ? '' : 's'}</Text>
          {visible.map(task => <TaskCard key={task.id} task={task} onToggle={() => setTasks(current => current.map(item => item.id === task.id ? { ...item, completed: !item.completed } : item))} onEdit={() => openEditor(task)} onDelete={() => remove(task)} />)}
          {visible.length === 0 && <View style={styles.empty}><Text style={styles.emptyIcon}>⌕</Text><Text style={styles.emptyTitle}>No tasks found</Text><Text style={styles.emptyCopy}>Try another filter, or add a new task.</Text></View>}
        </>}
        {screen === 'Editor' && <>
          <TouchableOpacity onPress={() => setScreen('Tasks')}><Text style={styles.link}>← Back to tasks</Text></TouchableOpacity>
          <Text style={[styles.pageTitle, { marginTop: 22 }]}>{editingId ? 'Edit task' : 'New task'}</Text><Text style={styles.pageSub}>Keep the details simple and actionable.</Text>
          <Text style={styles.label}>Task title *</Text><TextInput accessibilityLabel="Task title" value={title} onChangeText={setTitle} placeholder="e.g. Finish project report" placeholderTextColor="#9CA7BA" style={styles.input} maxLength={100} />
          <Text style={styles.label}>Notes</Text><TextInput accessibilityLabel="Notes" value={notes} onChangeText={setNotes} placeholder="Add a little context" placeholderTextColor="#9CA7BA" style={[styles.input, styles.textarea]} multiline maxLength={500} />
          <Text style={styles.label}>Category</Text><View style={styles.chipRow}>{categories.map(item => <Chip key={item} label={item} active={category === item} onPress={() => setCategory(item)} />)}</View>
          <Text style={styles.label}>Priority</Text><View style={styles.chipRow}>{(['Low', 'Medium', 'High'] as Priority[]).map(item => <Chip key={item} label={item} active={priority === item} onPress={() => setPriority(item)} />)}</View>
          <Text style={styles.label}>Due date (optional)</Text><TextInput accessibilityLabel="Due date" value={dueDate} onChangeText={setDueDate} placeholder="YYYY-MM-DD" placeholderTextColor="#9CA7BA" style={styles.input} autoCapitalize="none" keyboardType="numbers-and-punctuation" /><Text style={styles.hint}>Example: 2026-10-15</Text>
          {!!formError && <Text style={styles.formError}>{formError}</Text>}
          <View style={{ marginTop: 24 }}><Button label={editingId ? 'Save changes' : 'Create task'} onPress={submit} /></View>
        </>}
      </ScrollView>
      <View style={styles.nav}><TouchableOpacity onPress={() => setScreen('Home')} style={styles.navItem}><Text style={[styles.navText, screen === 'Home' && styles.navActive]}>⌂  Home</Text></TouchableOpacity><TouchableOpacity onPress={() => setScreen('Tasks')} style={styles.navItem}><Text style={[styles.navText, (screen === 'Tasks' || screen === 'Editor') && styles.navActive]}>☷  Tasks</Text></TouchableOpacity></View>
    </View>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FB', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  shell: { flex: 1, width: '100%', maxWidth: 760, alignSelf: 'center', backgroundColor: '#F5F7FB' },
  header: { paddingHorizontal: 24, paddingTop: 18, paddingBottom: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { fontSize: 26, fontWeight: '800', color: ink, letterSpacing: -1 }, brandDot: { color: blue }, headerSub: { color: muted, fontSize: 12, marginTop: 2 },
  avatar: { width: 38, height: 38, backgroundColor: '#DCE4FF', borderRadius: 19, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: blue, fontWeight: '800', fontSize: 12 },
  scroll: { flex: 1 }, content: { paddingHorizontal: 24, paddingBottom: 40 },
  hero: { backgroundColor: '#DCE5FF', borderRadius: 24, padding: 26, marginBottom: 28 }, eyebrow: { color: blue, fontSize: 11, fontWeight: '800', letterSpacing: 1.6 },
  heroTitle: { color: ink, fontSize: 31, fontWeight: '800', marginTop: 10, letterSpacing: -1 }, heroCopy: { color: '#4C5E85', fontSize: 14, lineHeight: 21, marginTop: 10, marginBottom: 20, maxWidth: 310 },
  button: { backgroundColor: blue, paddingHorizontal: 22, paddingVertical: 15, borderRadius: 13, alignSelf: 'flex-start', alignItems: 'center' }, buttonText: { color: 'white', fontWeight: '800', fontSize: 14 },
  secondaryButton: { backgroundColor: '#E9EEFF' }, secondaryButtonText: { color: blue }, dangerButton: { backgroundColor: '#E45461' },
  sectionTitle: { color: ink, fontSize: 20, fontWeight: '800', marginBottom: 14 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 18 }, statCard: { width: '48%', padding: 20, borderRadius: 18, marginBottom: 12 }, statNumber: { color: ink, fontSize: 29, fontWeight: '800' }, statLabel: { color: '#5B6880', fontSize: 13, marginTop: 4 },
  overdueBanner: { color: '#A14A22', backgroundColor: '#FFF1E6', padding: 12, borderRadius: 10, marginBottom: 15, fontWeight: '600' },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 8 }, link: { color: blue, fontWeight: '700' },
  pageTitle: { color: ink, fontSize: 28, fontWeight: '800', letterSpacing: -0.7 }, pageSub: { color: muted, marginTop: 5, marginBottom: 16 },
  smallAdd: { width: 42, height: 42, borderRadius: 12, backgroundColor: blue, alignItems: 'center', justifyContent: 'center' }, smallAddText: { color: 'white', fontSize: 27, lineHeight: 32 },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#E1E6F0', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 14, color: ink, fontSize: 14, marginBottom: 14 }, textarea: { minHeight: 105, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', gap: 8, paddingBottom: 6 }, chip: { borderRadius: 20, paddingHorizontal: 15, paddingVertical: 9, backgroundColor: '#E9EDF5' }, chipActive: { backgroundColor: blue }, chipText: { color: '#526079', fontSize: 13, fontWeight: '700' }, chipTextActive: { color: 'white' },
  filterLabel: { fontSize: 10, color: muted, fontWeight: '800', letterSpacing: 1.2, marginTop: 13, marginBottom: 8 }, results: { color: muted, fontSize: 12, marginVertical: 16 },
  taskCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, flexDirection: 'row', marginBottom: 11, borderWidth: 1, borderColor: '#EBEEF4' }, check: { width: 24, height: 24, borderWidth: 2, borderColor: '#B8C3D5', borderRadius: 7, marginRight: 13, alignItems: 'center', justifyContent: 'center' }, checked: { backgroundColor: blue, borderColor: blue }, checkLabel: { color: 'white', fontWeight: '800' },
  taskBody: { flex: 1 }, taskTitle: { fontSize: 15, fontWeight: '800', color: ink }, doneText: { textDecorationLine: 'line-through', color: muted }, taskMeta: { color: muted, fontSize: 11, marginTop: 5 }, taskNotes: { color: '#5E6B80', fontSize: 12, marginTop: 8, lineHeight: 17 }, overdue: { color: '#C24F43', fontSize: 11, fontWeight: '800', marginTop: 6 }, taskActions: { flexDirection: 'row', gap: 20, marginTop: 12 }, actionText: { color: blue, fontSize: 12, fontWeight: '800' }, deleteText: { color: '#D35B61' },
  empty: { alignItems: 'center', backgroundColor: 'white', borderRadius: 18, padding: 32, marginTop: 4 }, emptyIcon: { color: blue, fontSize: 34 }, emptyTitle: { color: ink, fontSize: 18, fontWeight: '800', marginTop: 7 }, emptyCopy: { color: muted, fontSize: 13, textAlign: 'center', marginTop: 6 },
  label: { color: ink, fontWeight: '800', marginTop: 13, marginBottom: 8, fontSize: 13 }, hint: { color: muted, fontSize: 11, marginTop: -8 }, formError: { color: '#B83B47', marginTop: 12, fontWeight: '600' }, errorBanner: { backgroundColor: '#FFF0F0', color: '#B83B47', padding: 8, textAlign: 'center' },
  nav: { flexDirection: 'row', backgroundColor: 'white', borderTopWidth: 1, borderColor: '#E7EBF2', paddingVertical: 15 }, navItem: { flex: 1, alignItems: 'center' }, navText: { color: '#98A3B5', fontWeight: '800' }, navActive: { color: blue },
});
