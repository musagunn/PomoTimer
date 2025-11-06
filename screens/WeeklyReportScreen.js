import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Circle } from 'react-native-svg';
import { MaterialIcons } from '@expo/vector-icons';
import DrawerMenu from '../components/DrawerMenu';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getWeeklyStats, formatDuration } from '../utils/storage';
import { getStreakData } from '../utils/streakStorage';

const WeeklyReportScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const { t } = useLanguage();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Stats data
  const [weeklyStats, setWeeklyStats] = useState({
    totalFocusTime: 0,
    totalBreakTime: 0,
    focusSessions: 0,
    breakSessions: 0,
    dailyData: [],
    topTasks: [],
  });

  // Streak data
  const [streak, setStreak] = useState({
    currentStreak: 0,
    longestStreak: 0,
  });

  // Accomplishments data (empty - will be populated as user completes sessions)
  const accomplishments = [];

  // Bar colors for each day
  const dayColors = ['#D6C1E8', '#A8D8C6', '#FFDAB9', '#B2E0F2', '#D6C1E8', '#A8D8C6', '#FFDAB9'];

  // Load weekly stats and streak
  const loadWeeklyStats = async () => {
    try {
      setLoading(true);
      const stats = await getWeeklyStats();
      const streakData = await getStreakData();
      setWeeklyStats(stats);
      setStreak({
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
      });
    } catch (error) {
      console.error('Error loading weekly stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadWeeklyStats();
    }, [])
  );

  const handleBack = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor={theme.background} 
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <MaterialIcons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{t('weeklyReportTitle')}</Text>
        
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setDrawerVisible(true)}
        >
          <MaterialIcons name="menu" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={styles.loadingText}>{t('loadingStats')}</Text>
          </View>
        ) : (
          <>
            {/* Streak Card - Featured */}
            <View style={styles.streakCardContainer}>
              <View style={styles.streakCard}>
                <View style={styles.streakHeader}>
                  <Text style={styles.streakEmoji}>🔥</Text>
                  <View>
                    <Text style={styles.streakTitle}>Current Streak</Text>
                    <Text style={styles.streakValue}>{streak.currentStreak} day{streak.currentStreak !== 1 ? 's' : ''}</Text>
                  </View>
                </View>
                <View style={styles.streakDivider} />
                <View style={styles.streakFooter}>
                  <MaterialIcons name="emoji-events" size={16} color={theme.textSecondary} />
                  <Text style={styles.streakLongest}>
                    Longest: {streak.longestStreak} day{streak.longestStreak !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>{t('totalFocusTime')}</Text>
                <Text style={styles.statValue}>
                  {formatDuration(weeklyStats.totalFocusTime)}
                </Text>
                <Text style={styles.statSubtext}>
                  {weeklyStats.focusSessions} {weeklyStats.focusSessions === 1 ? t('session') : t('sessions')}
                </Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>{t('completedSessions')}</Text>
                <Text style={styles.statValue}>
                  {weeklyStats.focusSessions + weeklyStats.breakSessions}
                </Text>
                <Text style={styles.statSubtext}>
                  {weeklyStats.focusSessions} {t('focusTime').toLowerCase()} · {weeklyStats.breakSessions} {t('breakTime').toLowerCase()}
                </Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>{t('dailyAverage')}</Text>
                <Text style={styles.statValue}>
                  {weeklyStats.focusSessions > 0 
                    ? formatDuration(Math.ceil(weeklyStats.totalFocusTime / 7))
                    : '0m'
                  }
                </Text>
                <Text style={styles.statSubtext}>
                  {Math.ceil((weeklyStats.focusSessions + weeklyStats.breakSessions) / 7)} {t('sessions')}/{t('day')}
                </Text>
              </View>
            </View>
          </>
        )}

        {!loading && (
          <>
            {/* Charts Section */}
            <View style={styles.chartsContainer}>
              {/* Bar Chart */}
              <View style={styles.barChartCard}>
                <Text style={styles.chartTitle}>Daily Focus</Text>
                
                <View style={styles.barChartContainer}>
                  {weeklyStats.dailyData.map((item, index) => {
                    const maxMinutes = Math.max(...weeklyStats.dailyData.map(d => d.totalMinutes), 1);
                    const height = item.totalMinutes / maxMinutes;
                    
                    return (
                      <View key={index} style={styles.barWrapper}>
                        <View style={[styles.barColumn, { height: `${height * 100}%` }]}>
                          <View style={[styles.bar, { backgroundColor: dayColors[index] }]} />
                        </View>
                        <Text style={styles.barLabel}>{item.day}</Text>
                      </View>
                    );
                  })}
                </View>
                
                {weeklyStats.dailyData.every(d => d.totalMinutes === 0) && (
                  <View style={styles.emptyChart}>
                    <Text style={styles.emptyChartText}>
                      No focus sessions yet. Start your first session!
                    </Text>
                  </View>
                )}
              </View>

              {/* Overall Stats */}
              <View style={styles.overallStatsCard}>
                <Text style={styles.chartTitle}>Week Summary</Text>
                
                <View style={styles.overallStatsContent}>
                  <View style={styles.overallStatItem}>
                    <MaterialIcons name="timer" size={32} color={theme.primary} />
                    <Text style={styles.overallStatValue}>
                      {formatDuration(weeklyStats.totalFocusTime)}
                    </Text>
                    <Text style={styles.overallStatLabel}>Focus Time</Text>
                  </View>
                  
                  <View style={styles.overallStatItem}>
                    <MaterialIcons name="coffee" size={32} color={theme.secondary} />
                    <Text style={styles.overallStatValue}>
                      {formatDuration(weeklyStats.totalBreakTime)}
                    </Text>
                    <Text style={styles.overallStatLabel}>Break Time</Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}

        {!loading && weeklyStats.topTasks && weeklyStats.topTasks.length > 0 && (
          <>
            {/* Top Tasks */}
            <View style={styles.sectionHeader}>
              <MaterialIcons name="star" size={24} color={theme.primary} />
              <Text style={styles.sectionTitle}>{t('topTasks')}</Text>
            </View>
            
            <View style={styles.tasksContainer}>
              {weeklyStats.topTasks.map((taskStat, index) => (
                <View key={taskStat.task.id} style={styles.taskCard}>
                  <View style={styles.taskRank}>
                    <Text style={styles.taskRankText}>#{index + 1}</Text>
                  </View>
                  <View style={[styles.taskIconContainer, { backgroundColor: taskStat.task.color + '30' }]}>
                    <Text style={styles.taskIcon}>{taskStat.task.icon}</Text>
                  </View>
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskName}>{taskStat.task.name}</Text>
                    <Text style={styles.taskMeta}>
                      {taskStat.count} seans • {formatDuration(taskStat.duration)}
                    </Text>
                  </View>
                  <View style={styles.taskStats}>
                    <Text style={styles.taskDuration}>{formatDuration(taskStat.duration)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
      
      {/* Drawer Menu */}
      <DrawerMenu 
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        navigation={navigation}
      />
    </SafeAreaView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 8,
    backgroundColor: theme.background,
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.27,
  },
  menuButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  
  // Streak Card
  streakCardContainer: {
    marginBottom: 24,
  },
  streakCard: {
    backgroundColor: theme.primary,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  streakEmoji: {
    fontSize: 40,
  },
  streakTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textPrimary,
    opacity: 0.9,
  },
  streakValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.textPrimary,
    letterSpacing: -0.5,
  },
  streakDivider: {
    height: 1,
    backgroundColor: theme.textPrimary,
    opacity: 0.2,
    marginVertical: 16,
  },
  streakFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakLongest: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  
  // Stats Cards
  statsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 8,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.textPrimary,
    letterSpacing: -0.5,
  },
  statChange: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.success,
  },
  
  // Charts
  chartsContainer: {
    gap: 24,
    marginBottom: 24,
  },
  
  // Bar Chart
  barChartCard: {
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.textPrimary,
  },
  barChartContainer: {
    flexDirection: 'row',
    height: 180,
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    gap: 8,
  },
  barWrapper: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  barColumn: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.textSecondary,
  },
  
  // Overall Stats Card
  overallStatsCard: {
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 16,
  },
  overallStatsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  overallStatItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  overallStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.textPrimary,
  },
  overallStatLabel: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  
  // Empty States
  emptyChart: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyChartText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: theme.textSecondary,
  },
  
  statSubtext: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  
  // Section Title
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
    letterSpacing: -0.27,
    marginTop: 16,
    marginBottom: 8,
  },
  
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  
  // Tasks
  tasksContainer: {
    gap: 12,
    marginBottom: 24,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.cardBackground,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  taskRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskRankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.textPrimary,
  },
  taskIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskIcon: {
    fontSize: 24,
  },
  taskInfo: {
    flex: 1,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  taskMeta: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  taskStats: {
    alignItems: 'flex-end',
  },
  taskDuration: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.primary,
  },
  
  // Empty State
  emptyAccomplishments: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
  },
});


export default WeeklyReportScreen;

