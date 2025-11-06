import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  PanResponder,
  Alert,
  Vibration,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { MaterialIcons } from '@expo/vector-icons';
import DrawerMenu from '../components/DrawerMenu';
import TimerPickerModal from '../components/TimerPickerModal';
import TaskSelectorModal from '../components/TaskSelectorModal';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { saveSession } from '../utils/storage';
import { getStreakData, updateStreak } from '../utils/streakStorage';

const HomeScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const { t } = useLanguage();
  const [selectedMode, setSelectedMode] = useState('Focus Time');
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('Timer');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [timerPickerVisible, setTimerPickerVisible] = useState(false);
  const [pendingMode, setPendingMode] = useState(null);
  
  // Task selection
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Timer duration in seconds
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [initialTime, setInitialTime] = useState(25 * 60);
  const intervalRef = useRef(null);
  
  // Swipe animation
  const swipeX = useRef(new Animated.Value(0)).current;

  // Streak data
  const [streak, setStreak] = useState({
    currentStreak: 0,
    longestStreak: 0,
  });

  // Timer modes
  const modes = ['Focus Time', 'Break Time'];
  
  // Mode durations (in minutes)
  const modeDurations = {
    'Focus Time': 25,
    'Break Time': 5,
  };

  // Don't auto-update time when mode changes - let user choose via modal

  // Load streak data on mount
  useEffect(() => {
    loadStreak();
  }, []);

  const loadStreak = async () => {
    const streakData = await getStreakData();
    setStreak({
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
    });
  };

  // Play completion notification (vibration with special pattern)
  const playCompletionNotification = async () => {
    try {
      // Victory vibration pattern: Short-Long-Long for celebration!
      // Pattern: [wait, vibrate, wait, vibrate, wait, vibrate]
      Vibration.vibrate([0, 100, 50, 300, 50, 300]);
    } catch (error) {
      console.error('Error with notification:', error);
    }
  };

  // Handle timer completion
  const handleTimerComplete = async () => {
    // Play completion notification (sound + vibration)
    await playCompletionNotification();

    // Save session to storage
    const sessionType = selectedMode === 'Focus Time' ? 'focus' : 'break';
    const success = await saveSession({
      type: sessionType,
      duration: initialTime,
      task: selectedTask,
    });

    if (success) {
      // Update streak (only for Focus Time sessions)
      if (selectedMode === 'Focus Time') {
        const updatedStreak = await updateStreak();
        if (updatedStreak) {
          setStreak({
            currentStreak: updatedStreak.currentStreak,
            longestStreak: updatedStreak.longestStreak,
          });
        }
      }

      // Show completion message
      const taskInfo = selectedTask ? `\n🎯 ${selectedTask.name}` : '';
      const message = selectedMode === 'Focus Time' 
        ? `${t('focusSessionComplete')}${taskInfo}` 
        : t('breakComplete');
      
      Alert.alert(
        t('sessionComplete'),
        message,
        [{ text: t('ok') }]
      );
      
      // Clear selected task after completion
      setSelectedTask(null);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, selectedMode, initialTime]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) {
      return '00:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Calculate progress for circle
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = initialTime > 0 ? timeLeft / initialTime : 0;
  const strokeDashoffset = circumference * (1 - progress);

  // Handle task selection
  const handleTaskSelected = (task) => {
    setSelectedTask(task);
    setTaskModalVisible(false);
    setIsRunning(true);
  };

  // Handle start/pause
  const handleStartPause = () => {
    if (!isRunning && selectedMode === 'Focus Time' && !selectedTask && timeLeft === initialTime) {
      // First time starting focus - show task selector
      setTaskModalVisible(true);
    } else {
      setIsRunning(!isRunning);
    }
  };

  // Handle reset
  const handleReset = () => {
    setIsRunning(false);
    setSelectedTask(null);
    if (modeDurations[selectedMode]) {
      const duration = modeDurations[selectedMode] * 60;
      setTimeLeft(duration);
      setInitialTime(duration);
    } else {
      // If custom mode, reset to initial custom time
      setTimeLeft(initialTime);
    }
  };

  // Handle custom time selection
  const handleCustomTimeSelect = (totalSeconds) => {
    if (totalSeconds && totalSeconds > 0) {
      setIsRunning(false);
      setTimeLeft(totalSeconds);
      setInitialTime(totalSeconds);
      // Update selected mode if there was a pending one
      if (pendingMode) {
        setSelectedMode(pendingMode);
        setPendingMode(null);
      }
    }
  };

  // Handle mode button press
  const handleModePress = (mode) => {
    setPendingMode(mode);
    setSelectedMode(mode); // Update immediately for visual feedback
    setTimerPickerVisible(true);
  };

  // Handle timer press
  const handleTimerPress = () => {
    setTimerPickerVisible(true);
  };

  // Swipe to change mode - Symmetrical
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        swipeX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        const SWIPE_THRESHOLD = 50;
        
        // Swipe RIGHT → Break Time
        if (gestureState.dx > SWIPE_THRESHOLD) {
          setSelectedMode('Break Time');
          setPendingMode('Break Time');
          Animated.timing(swipeX, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setTimerPickerVisible(true);
          });
          return;
        }
        
        // Swipe LEFT → Focus Time  
        if (gestureState.dx < -SWIPE_THRESHOLD) {
          setSelectedMode('Focus Time');
          setPendingMode('Focus Time');
          Animated.timing(swipeX, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setTimerPickerVisible(true);
          });
          return;
        }
        
        // Not enough swipe, return to center
        Animated.spring(swipeX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  // Dynamic styles based on theme
  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor={theme.background} 
      />
      
      {/* Drawer Menu */}
      <DrawerMenu 
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        navigation={navigation}
      />

      {/* Timer Picker Modal */}
      <TimerPickerModal
        visible={timerPickerVisible}
        onClose={() => {
          setTimerPickerVisible(false);
          setPendingMode(null);
        }}
        onSelect={handleCustomTimeSelect}
        mode={pendingMode || selectedMode}
      />

      {/* Task Selector Modal */}
      <TaskSelectorModal
        visible={taskModalVisible}
        onClose={() => setTaskModalVisible(false)}
        onSelectTask={handleTaskSelected}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => setDrawerVisible(true)}
        >
          <MaterialIcons name="menu" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{t('pomodoro')}</Text>
        
        {/* Streak Badge */}
        <TouchableOpacity 
          style={styles.streakBadge}
          onPress={() => {
            const dayText = streak.currentStreak === 1 ? t('day') : t('days');
            const longestDayText = streak.longestStreak === 1 ? t('day') : t('days');
            const motivationText = streak.currentStreak > 0 ? t('keepItUp') : t('startStreak');
            
            Alert.alert(
              t('streakStats'),
              `${t('currentStreak')}: ${streak.currentStreak} ${dayText}\n${t('longestStreak')}: ${streak.longestStreak} ${longestDayText}\n\n${motivationText}`,
              [{ text: t('ok') }]
            );
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakNumber}>{streak.currentStreak}</Text>
        </TouchableOpacity>
      </View>

      {/* Task Badge */}
      {selectedTask && (
        <View style={[styles.taskBadge, { backgroundColor: selectedTask.color + '20' }]}>
          <Text style={styles.taskBadgeIcon}>{selectedTask.icon}</Text>
          <Text style={styles.taskBadgeText}>{selectedTask.name}</Text>
          <TouchableOpacity 
            onPress={() => setSelectedTask(null)}
            style={styles.taskBadgeClose}
          >
            <MaterialIcons name="close" size={16} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Main Content */}
      <View style={styles.mainContent}>
        <View style={styles.contentCenter}>
          {/* Timer Mode Selector */}
          <View style={styles.modeContainer}>
            <View style={styles.modeSelector}>
              {modes.map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.modeButton,
                    selectedMode === mode && styles.modeButtonActive,
                  ]}
                  onPress={() => handleModePress(mode)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.modeText,
                      selectedMode === mode && styles.modeTextActive,
                    ]}
                  >
                    {mode === 'Focus Time' ? t('focusTime') : t('breakTime')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Circular Timer with Swipe */}
          <Animated.View 
            style={[
              styles.timerContainer,
              {
                transform: [{ translateX: swipeX }],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <TouchableOpacity 
              onPress={handleTimerPress}
              activeOpacity={0.9}
              style={styles.timerTouchable}
            >
              <Svg width={256} height={256} viewBox="0 0 100 100" style={styles.svg}>
                {/* Background Circle */}
                <Circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke={theme.border}
                  strokeWidth="8"
                  fill="none"
                />
                {/* Progress Circle */}
                <Circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke={selectedMode === 'Break Time' ? theme.secondary : theme.primary}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  rotation="-90"
                  origin="50, 50"
                />
              </Svg>
              
              <View style={styles.timerTextContainer}>
                <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                {!isRunning && (
                  <Text style={styles.timerHint}>{t('swipeToSwitchMode')}</Text>
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>
          
          {/* Mode Indicator */}
          <View style={styles.modeIndicator}>
            <View style={styles.modeIndicatorDots}>
              <View style={[
                styles.indicatorDot,
                selectedMode === 'Focus Time' && styles.indicatorDotActive,
              ]} />
              <View style={[
                styles.indicatorDot,
                selectedMode === 'Break Time' && styles.indicatorDotActive,
              ]} />
            </View>
            <Text style={styles.modeIndicatorText}>
              {selectedMode === 'Focus Time' 
                ? t('swipeRightForBreak')
                : t('swipeLeftForFocus')
              }
            </Text>
          </View>

          {/* Control Buttons */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartPause}
            >
              <Text style={styles.startButtonText}>
                {isRunning ? t('pause') : t('start')}
              </Text>
            </TouchableOpacity>
            
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleReset}
                >
                  <MaterialIcons name="refresh" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'Timer' && styles.navItemActive]}
          onPress={() => setActiveTab('Timer')}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="timer"
            size={24}
            color={activeTab === 'Timer' ? theme.navActive : theme.navInactive}
          />
          <Text
            style={[
              styles.navText,
              activeTab === 'Timer' && styles.navTextActive,
            ]}
          >
            Timer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'Notes' && styles.navItemActive]}
          onPress={() => navigation.navigate('Notes')}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="description"
            size={24}
            color={activeTab === 'Notes' ? theme.navActive : theme.navInactive}
          />
          <Text
            style={[
              styles.navText,
              activeTab === 'Notes' && styles.navTextActive,
            ]}
          >
            Notes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'Reports' && styles.navItemActive]}
          onPress={() => navigation.navigate('Reports')}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="bar-chart"
            size={24}
            color={activeTab === 'Reports' ? theme.navActive : theme.navInactive}
          />
          <Text
            style={[
              styles.navText,
              activeTab === 'Reports' && styles.navTextActive,
            ]}
          >
            Reports
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 8,
    backgroundColor: theme.background,
  },
  headerButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
    flex: 1,
    textAlign: 'center',
    letterSpacing: -0.27,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  streakEmoji: {
    fontSize: 16,
  },
  streakNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.textPrimary,
  },
  
  // Task Badge
  taskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
    gap: 8,
  },
  taskBadgeIcon: {
    fontSize: 18,
  },
  taskBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  taskBadgeClose: {
    marginLeft: 4,
  },
  
  // Main Content
  mainContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  contentCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  
  // Mode Selector
  modeContainer: {
    width: '100%',
    maxWidth: 448,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modeSelector: {
    flexDirection: 'row',
    height: 48,
    backgroundColor: theme.border,
    borderRadius: 12,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  modeButtonActive: {
    backgroundColor: theme.cardBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modeText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  modeTextActive: {
    color: theme.textPrimary,
  },
  
  // Timer Circle
  timerContainer: {
    width: 256,
    height: 256,
    marginVertical: 32,
  },
  timerTouchable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  timerTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: theme.textPrimary,
    letterSpacing: -2,
  },
  timerHint: {
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  
  // Mode Indicator
  modeIndicator: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  modeIndicatorDots: {
    flexDirection: 'row',
    gap: 8,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.border,
  },
  indicatorDotActive: {
    backgroundColor: theme.primary,
    width: 24,
  },
  modeIndicatorText: {
    fontSize: 13,
    color: theme.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  
  // Control Buttons
  controlsContainer: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 384,
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 16,
  },
  startButton: {
    flex: 1,
    minWidth: 84,
    height: 56,
    backgroundColor: theme.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
    letterSpacing: 0.27,
  },
  resetButton: {
    width: 56,
    height: 56,
    backgroundColor: theme.border,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Bottom Navigation
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: theme.cardBackground,
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    paddingVertical: 4,
  },
  navItemActive: {
    backgroundColor: 'transparent',
  },
  navText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.navInactive,
    letterSpacing: 0.18,
  },
  navTextActive: {
    color: theme.navActive,
  },
});

export default HomeScreen;
