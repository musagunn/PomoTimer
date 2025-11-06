import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getTasks, addTask, deleteTask } from '../utils/tasksStorage';

const TaskSelectorModal = ({ visible, onClose, onSelectTask }) => {
  const { theme } = useTheme();
  const { currentLanguage, t } = useLanguage();
  const styles = getStyles(theme);
  
  const [tasks, setTasks] = useState([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🎯');
  const [selectedColor, setSelectedColor] = useState('#4ECDC4');

  const ICONS = ['📚', '💻', '🎯', '📖', '✍️', '🌍', '🎨', '🏃', '🎵', '🔬', '💼', '🍳'];
  const COLORS = ['#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181', '#FFA07A', '#98D8C8', '#FFD93D', '#A8E6CF', '#C7CEEA'];

  useEffect(() => {
    if (visible) {
      loadTasks();
    }
  }, [visible]);

  const loadTasks = async () => {
    const loadedTasks = await getTasks(currentLanguage);
    setTasks(loadedTasks);
  };

  const handleAddTask = async () => {
    if (!newTaskName.trim()) {
      Alert.alert(t('error'), t('enterTaskName'));
      return;
    }

    const newTask = await addTask(newTaskName.trim(), selectedColor, selectedIcon);
    if (newTask) {
      setTasks([...tasks, newTask]);
      setNewTaskName('');
      setShowAddTask(false);
      setSelectedIcon('🎯');
      setSelectedColor('#4ECDC4');
    }
  };

  const handleDeleteTask = async (taskId) => {
    Alert.alert(
      t('deleteTask'),
      t('deleteTaskConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            const success = await deleteTask(taskId);
            if (success) {
              setTasks(tasks.filter(t => t.id !== taskId));
            }
          },
        },
      ]
    );
  };

  const handleSelectTask = (task) => {
    onSelectTask(task);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('whatWillYouWorkOn')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Tasks List */}
          <ScrollView style={styles.tasksList} showsVerticalScrollIndicator={false}>
            {tasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={[styles.taskItem, { borderLeftColor: task.color }]}
                onPress={() => handleSelectTask(task)}
                onLongPress={() => handleDeleteTask(task.id)}
              >
                <View style={styles.taskContent}>
                  <Text style={styles.taskIcon}>{task.icon}</Text>
                  <Text style={styles.taskName}>{task.name}</Text>
                </View>
                <Text style={styles.taskArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Add New Task Section */}
          {showAddTask ? (
            <View style={styles.addTaskContainer}>
              <Text style={styles.addTaskTitle}>{t('newTask')}</Text>
              
              {/* Task Name Input */}
              <TextInput
                style={styles.taskInput}
                placeholder={t('taskName')}
                placeholderTextColor={theme.textSecondary}
                value={newTaskName}
                onChangeText={setNewTaskName}
                maxLength={30}
              />

              {/* Icon Selector */}
              <Text style={styles.selectorLabel}>{t('selectIcon')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScroll}>
                {ICONS.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconButton,
                      selectedIcon === icon && styles.iconButtonSelected,
                    ]}
                    onPress={() => setSelectedIcon(icon)}
                  >
                    <Text style={styles.iconText}>{icon}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Color Selector */}
              <Text style={styles.selectorLabel}>{t('selectColor')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorScroll}>
                {COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorButton,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorButtonSelected,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </ScrollView>

              {/* Action Buttons */}
              <View style={styles.addTaskActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => {
                    setShowAddTask(false);
                    setNewTaskName('');
                    setSelectedIcon('🎯');
                    setSelectedColor('#4ECDC4');
                  }}
                >
                  <Text style={styles.actionButtonText}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={handleAddTask}
                >
                  <Text style={[styles.actionButtonText, styles.saveButtonText]}>{t('save')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddTask(true)}
            >
              <Text style={styles.addButtonText}>{t('addNewTask')}</Text>
            </TouchableOpacity>
          )}

          {/* Skip Button */}
          {!showAddTask && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => {
                onSelectTask(null);
                onClose();
              }}
            >
              <Text style={styles.skipButtonText}>{t('continueWithoutTask')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (theme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.textPrimary,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.borderColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: theme.textPrimary,
    fontWeight: 'bold',
  },
  tasksList: {
    maxHeight: 300,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.background,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  taskName: {
    fontSize: 16,
    color: theme.textPrimary,
    fontWeight: '500',
  },
  taskArrow: {
    fontSize: 20,
    color: theme.textSecondary,
  },
  addButton: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 15,
    backgroundColor: theme.primary,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 15,
    alignItems: 'center',
  },
  skipButtonText: {
    color: theme.textSecondary,
    fontSize: 14,
  },
  addTaskContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.borderColor,
  },
  addTaskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 15,
  },
  taskInput: {
    backgroundColor: theme.background,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: theme.textPrimary,
    borderWidth: 1,
    borderColor: theme.borderColor,
    marginBottom: 15,
  },
  selectorLabel: {
    fontSize: 14,
    color: theme.textPrimary,
    fontWeight: '600',
    marginBottom: 8,
  },
  iconScroll: {
    marginBottom: 15,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 2,
    borderColor: theme.borderColor,
  },
  iconButtonSelected: {
    borderColor: theme.primary,
    backgroundColor: theme.primary + '20',
  },
  iconText: {
    fontSize: 24,
  },
  colorScroll: {
    marginBottom: 15,
  },
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorButtonSelected: {
    borderColor: '#FFFFFF',
    borderWidth: 3,
  },
  addTaskActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.borderColor,
  },
  saveButton: {
    backgroundColor: theme.primary,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.textPrimary,
  },
  saveButtonText: {
    color: '#FFFFFF',
  },
});

export default TaskSelectorModal;

