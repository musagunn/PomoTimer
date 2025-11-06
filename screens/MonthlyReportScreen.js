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
import { MaterialIcons } from '@expo/vector-icons';
import DrawerMenu from '../components/DrawerMenu';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getMonthlyStats, formatDuration } from '../utils/storage';
import { getStreakData } from '../utils/streakStorage';

const MonthlyReportScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const { t, currentLanguage } = useLanguage();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Date states
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(new Date().getMonth());
  
  // Stats data
  const [monthlyStats, setMonthlyStats] = useState({
    totalFocusTime: 0,
    totalBreakTime: 0,
    focusSessions: 0,
    breakSessions: 0,
    avgFocusTime: 0,
    dailyData: [],
    topTasks: [],
  });

  // Streak data
  const [streak, setStreak] = useState({
    currentStreak: 0,
    longestStreak: 0,
  });

  // Get month name
  const getMonthName = (index) => {
    const monthKeys = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    return t(monthKeys[index]);
  };
  const selectedMonth = `${getMonthName(selectedMonthIndex)} ${selectedYear}`;

  // Load monthly stats and streak
  const loadMonthlyStats = async () => {
    try {
      setLoading(true);
      const stats = await getMonthlyStats(selectedYear, selectedMonthIndex);
      const streakData = await getStreakData();
      setMonthlyStats(stats);
      setStreak({
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
      });
    } catch (error) {
      console.error('Error loading monthly stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data when screen comes into focus or month changes
  useFocusEffect(
    React.useCallback(() => {
      loadMonthlyStats();
    }, [selectedYear, selectedMonthIndex])
  );

  // Navigate to previous/next month
  const changeMonth = (direction) => {
    if (direction === 'prev') {
      if (selectedMonthIndex === 0) {
        setSelectedMonthIndex(11);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonthIndex(selectedMonthIndex - 1);
      }
    } else {
      if (selectedMonthIndex === 11) {
        setSelectedMonthIndex(0);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonthIndex(selectedMonthIndex + 1);
      }
    }
  };

  const handleBack = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  const handleShare = () => {
    console.log('Share report');
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

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

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <MaterialIcons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{t('monthlyReportTitle')}</Text>
        
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => setDrawerVisible(true)}
        >
          <MaterialIcons name="menu" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => changeMonth('prev')}
          >
            <MaterialIcons name="chevron-left" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
          
          <View style={styles.monthButton}>
            <MaterialIcons name="calendar-today" size={20} color={theme.secondary} />
            <Text style={styles.monthText}>{selectedMonth}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => changeMonth('next')}
          >
            <MaterialIcons name="chevron-right" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

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
                  {formatDuration(monthlyStats.totalFocusTime)}
                </Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>{t('completedSessions')}</Text>
                <Text style={styles.statValue}>
                  {monthlyStats.focusSessions + monthlyStats.breakSessions}
                </Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>{t('averageSession')}</Text>
                <Text style={styles.statValue}>
                  {monthlyStats.focusSessions > 0 
                    ? formatDuration(monthlyStats.avgFocusTime)
                    : '0m'
                  }
                </Text>
              </View>
            </View>
          </>
        )}

        {!loading && (
          <>
            {/* Chart Card */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Daily Focus Time</Text>
                <View style={styles.chartStats}>
                  <Text style={styles.chartValue}>
                    {formatDuration(monthlyStats.totalFocusTime)}
                  </Text>
                  <Text style={styles.chartSubtitle}>
                    {monthlyStats.focusSessions} sessions
                  </Text>
                </View>
              </View>
              
              <View style={styles.barChartContainer}>
                {monthlyStats.dailyData
                  .filter((_, index) => (index + 1) % 5 === 0 || index === 0)
                  .map((item, index) => {
                    const maxMinutes = Math.max(...monthlyStats.dailyData.map(d => d.totalMinutes), 1);
                    const height = item.totalMinutes / maxMinutes;
                    const isToday = new Date().getDate() === item.day && 
                                    new Date().getMonth() === selectedMonthIndex &&
                                    new Date().getFullYear() === selectedYear;
                    
                    return (
                      <View key={index} style={styles.barWrapper}>
                        <View 
                          style={[
                            styles.barColumn, 
                            { height: `${height * 100}%` }
                          ]}
                        >
                          <View 
                            style={[
                              styles.bar,
                              isToday ? styles.barHighlighted : styles.barNormal,
                            ]} 
                          />
                        </View>
                        <Text 
                          style={[
                            styles.barLabel,
                            isToday && styles.barLabelHighlighted,
                          ]}
                        >
                          {item.day}
                        </Text>
                      </View>
                    );
                  })}
              </View>
              
              {monthlyStats.dailyData.every(d => d.totalMinutes === 0) && (
                <View style={styles.emptyChart}>
                  <Text style={styles.emptyChartText}>
                    No focus sessions this month yet.
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

        {!loading && (
          <>
            {/* Accordions */}
            <View style={styles.accordionsContainer}>
          {/* Top Tasks Accordion */}
          <View style={styles.accordion}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => toggleSection('tasks')}
            >
              <View style={styles.accordionTitle}>
                <MaterialIcons name="work" size={24} color={theme.textPrimary} />
                <Text style={styles.accordionTitleText}>{t('topTasksTitle')}</Text>
              </View>
              <MaterialIcons 
                name={expandedSection === 'tasks' ? 'expand-less' : 'expand-more'}
                size={24} 
                color={theme.textSecondary} 
              />
            </TouchableOpacity>
            
            {expandedSection === 'tasks' && (
              <View style={styles.accordionContent}>
                {monthlyStats.topTasks && monthlyStats.topTasks.length > 0 ? (
                  monthlyStats.topTasks.map((taskStat, index) => {
                    const percentage = monthlyStats.totalFocusTime > 0 
                      ? ((taskStat.duration / monthlyStats.totalFocusTime) * 100).toFixed(0)
                      : 0;
                    
                    return (
                      <View key={taskStat.task.id} style={styles.taskItem}>
                        <View style={[styles.taskItemIcon, { backgroundColor: taskStat.task.color + '30' }]}>
                          <Text style={styles.taskItemEmoji}>{taskStat.task.icon}</Text>
                        </View>
                        <View style={styles.taskItemInfo}>
                          <Text style={styles.taskItemName}>{taskStat.task.name}</Text>
                          <View style={styles.taskItemMeta}>
                            <Text style={styles.taskItemMetaText}>
                              {taskStat.count} seans • {percentage}%
                            </Text>
                          </View>
                          <View style={styles.progressBarContainer}>
                            <View 
                              style={[
                                styles.progressBar, 
                                { 
                                  width: `${percentage}%`,
                                  backgroundColor: taskStat.task.color
                                }
                              ]} 
                            />
                          </View>
                        </View>
                        <Text style={[styles.taskItemDuration, { color: taskStat.task.color }]}>
                          {formatDuration(taskStat.duration)}
                        </Text>
                      </View>
                    );
                  })
                ) : (
                  <Text style={styles.emptyListText}>
                    {t('noTaskDataYet')}
                  </Text>
                )}
              </View>
            )}
          </View>

            </View>
          </>
        )}
      </ScrollView>
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
  headerButton: {
    width: 40,
    height: 40,
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
  
  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  
  // Month Selector
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(226, 232, 240, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(66, 182, 240, 0.2)',
    gap: 8,
  },
  monthText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.secondary,
  },
  
  // Streak Card
  streakCardContainer: {
    paddingHorizontal: 16,
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
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 8,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.textPrimary,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.textPrimary,
    letterSpacing: -0.5,
  },
  
  // Chart Card
  chartCard: {
    marginHorizontal: 16,
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 16,
    marginBottom: 24,
  },
  chartHeader: {
    gap: 4,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.textPrimary,
  },
  chartStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  chartValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.textPrimary,
    letterSpacing: -0.5,
  },
  chartChange: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.success,
  },
  chartSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  
  // Bar Chart
  barChartContainer: {
    flexDirection: 'row',
    height: 180,
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    gap: 12,
    paddingHorizontal: 12,
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
  barNormal: {
    backgroundColor: 'rgba(66, 182, 240, 0.3)',
  },
  barHighlighted: {
    backgroundColor: theme.secondary,
    borderWidth: 2,
    borderColor: theme.secondary,
    shadowColor: theme.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  barLabelHighlighted: {
    color: theme.secondary,
    fontWeight: 'bold',
  },
  
  // Accordions
  accordionsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  accordion: {
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  accordionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accordionTitleText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textPrimary,
  },
  accordionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  listItemText: {
    flex: 1,
    fontSize: 14,
    color: theme.textSecondary,
    paddingRight: 12,
  },
  listItemValue: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  // Task Item Styles
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  taskItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskItemEmoji: {
    fontSize: 20,
  },
  taskItemInfo: {
    flex: 1,
  },
  taskItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  taskItemMeta: {
    marginBottom: 6,
  },
  taskItemMetaText: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: theme.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  taskItemDuration: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  emptyListText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    paddingVertical: 12,
    fontStyle: 'italic',
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
});

export default MonthlyReportScreen;

