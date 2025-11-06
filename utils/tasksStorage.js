import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_STORAGE_KEY = '@pomodoro_tasks';

// Get default tasks based on language
export const getDefaultTasks = (language = 'tr') => {
  const taskNames = {
    tr: {
      studying: 'Ders Çalışma',
      coding: 'Kodlama',
      projectWork: 'Proje Çalışması',
      reading: 'Okuma',
      writing: 'Yazı Yazma',
      languageLearning: 'Dil Öğrenme',
    },
    en: {
      studying: 'Studying',
      coding: 'Coding',
      projectWork: 'Project Work',
      reading: 'Reading',
      writing: 'Writing',
      languageLearning: 'Language Learning',
    },
  };

  const names = taskNames[language] || taskNames.tr;

  return [
    { id: '1', name: names.studying, color: '#FF6B6B', icon: '📚' },
    { id: '2', name: names.coding, color: '#4ECDC4', icon: '💻' },
    { id: '3', name: names.projectWork, color: '#95E1D3', icon: '🎯' },
    { id: '4', name: names.reading, color: '#F38181', icon: '📖' },
    { id: '5', name: names.writing, color: '#FFA07A', icon: '✍️' },
    { id: '6', name: names.languageLearning, color: '#98D8C8', icon: '🌍' },
  ];
};

/**
 * Tüm görevleri getirir
 */
export const getTasks = async (language = 'tr') => {
  try {
    const tasksJson = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    
    if (tasksJson === null) {
      // İlk kez açılıyorsa varsayılan görevleri kaydet
      const defaultTasks = getDefaultTasks(language);
      await saveTasks(defaultTasks);
      return defaultTasks;
    }
    
    return JSON.parse(tasksJson);
  } catch (error) {
    console.error('Error loading tasks:', error);
    return getDefaultTasks(language);
  }
};

/**
 * Görevleri kaydeder
 */
export const saveTasks = async (tasks) => {
  try {
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch (error) {
    console.error('Error saving tasks:', error);
    return false;
  }
};

/**
 * Yeni görev ekler
 */
export const addTask = async (taskName, color = '#4ECDC4', icon = '🎯') => {
  try {
    const tasks = await getTasks();
    const newTask = {
      id: Date.now().toString(),
      name: taskName,
      color: color,
      icon: icon,
    };
    
    const updatedTasks = [...tasks, newTask];
    await saveTasks(updatedTasks);
    return newTask;
  } catch (error) {
    console.error('Error adding task:', error);
    return null;
  }
};

/**
 * Görevi siler
 */
export const deleteTask = async (taskId) => {
  try {
    const tasks = await getTasks();
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    await saveTasks(updatedTasks);
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    return false;
  }
};

/**
 * Görevi günceller
 */
export const updateTask = async (taskId, updates) => {
  try {
    const tasks = await getTasks();
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    );
    await saveTasks(updatedTasks);
    return true;
  } catch (error) {
    console.error('Error updating task:', error);
    return false;
  }
};

/**
 * Tüm görevleri siler (DEBUG için)
 */
export const clearAllTasks = async () => {
  try {
    await AsyncStorage.removeItem(TASKS_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing tasks:', error);
    return false;
  }
};

