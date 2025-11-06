import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@pomodoro_sessions';

/**
 * Pomodoro Session Data Structure:
 * {
 *   id: string (unique identifier),
 *   type: 'focus' | 'break',
 *   duration: number (in seconds),
 *   completedAt: string (ISO date string),
 *   date: string (YYYY-MM-DD format for easy filtering),
 *   task: { id, name, color, icon } | null (optional task info)
 * }
 */

/**
 * Save a completed Pomodoro session
 * @param {Object} session - Session data
 * @param {string} session.type - 'focus' or 'break'
 * @param {number} session.duration - Duration in seconds
 * @param {Object} session.task - Optional task info { id, name, color, icon }
 * @returns {Promise<boolean>} Success status
 */
export const saveSession = async (session) => {
  try {
    const now = new Date();
    // Get local date instead of UTC date
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const localDate = `${year}-${month}-${day}`;
    
    const sessionData = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: session.type,
      duration: session.duration,
      task: session.task || null,
      completedAt: now.toISOString(),
      date: localDate, // YYYY-MM-DD in local timezone
    };

    // Get existing sessions
    const existingSessions = await getSessions();
    
    // Add new session
    const updatedSessions = [sessionData, ...existingSessions];
    
    // Save to storage
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
    
    console.log('✅ Session saved:', sessionData);
    return true;
  } catch (error) {
    console.error('❌ Error saving session:', error);
    return false;
  }
};

/**
 * Get all saved sessions
 * @returns {Promise<Array>} Array of session objects
 */
export const getSessions = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('❌ Error getting sessions:', error);
    return [];
  }
};

/**
 * Get sessions filtered by date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} Filtered sessions
 */
export const getSessionsByDateRange = async (startDate, endDate) => {
  try {
    const allSessions = await getSessions();
    // Use local date strings for comparison
    const year1 = startDate.getFullYear();
    const month1 = String(startDate.getMonth() + 1).padStart(2, '0');
    const day1 = String(startDate.getDate()).padStart(2, '0');
    const start = `${year1}-${month1}-${day1}`;
    
    const year2 = endDate.getFullYear();
    const month2 = String(endDate.getMonth() + 1).padStart(2, '0');
    const day2 = String(endDate.getDate()).padStart(2, '0');
    const end = `${year2}-${month2}-${day2}`;
    
    return allSessions.filter(session => {
      return session.date >= start && session.date <= end;
    });
  } catch (error) {
    console.error('❌ Error filtering sessions:', error);
    return [];
  }
};

/**
 * Get weekly statistics
 * @returns {Promise<Object>} Weekly stats
 */
export const getWeeklyStats = async () => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
    endOfWeek.setHours(23, 59, 59, 999);
    
    const sessions = await getSessionsByDateRange(startOfWeek, endOfWeek);
    
    // Calculate stats
    const focusSessions = sessions.filter(s => s.type === 'focus');
    const breakSessions = sessions.filter(s => s.type === 'break');
    
    const totalFocusTime = focusSessions.reduce((sum, s) => sum + s.duration, 0);
    const totalBreakTime = breakSessions.reduce((sum, s) => sum + s.duration, 0);
    
    // Daily breakdown
    const dailyData = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      // Use local date string
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const dayNum = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${dayNum}`;
      
      const daySessions = sessions.filter(s => s.date === dateStr && s.type === 'focus');
      const dayTotal = daySessions.reduce((sum, s) => sum + s.duration, 0);
      
      return {
        day,
        date: dateStr,
        totalMinutes: Math.round(dayTotal / 60),
        sessions: daySessions.length,
      };
    });
    
    // Calculate task statistics
    const taskStats = {};
    focusSessions.forEach(session => {
      if (session.task) {
        const taskId = session.task.id;
        if (!taskStats[taskId]) {
          taskStats[taskId] = {
            task: session.task,
            count: 0,
            duration: 0,
          };
        }
        taskStats[taskId].count++;
        taskStats[taskId].duration += session.duration;
      }
    });

    // Sort tasks by duration (descending) and get top 5
    const topTasks = Object.values(taskStats)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);
    
    return {
      totalFocusTime, // in seconds
      totalBreakTime, // in seconds
      focusSessions: focusSessions.length,
      breakSessions: breakSessions.length,
      dailyData,
      topTasks,
      sessions,
    };
  } catch (error) {
    console.error('❌ Error getting weekly stats:', error);
    return {
      totalFocusTime: 0,
      totalBreakTime: 0,
      focusSessions: 0,
      breakSessions: 0,
      dailyData: [],
      topTasks: [],
      sessions: [],
    };
  }
};

/**
 * Get monthly statistics
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {Promise<Object>} Monthly stats
 */
export const getMonthlyStats = async (year, month) => {
  try {
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    
    const sessions = await getSessionsByDateRange(startOfMonth, endOfMonth);
    
    // Calculate stats
    const focusSessions = sessions.filter(s => s.type === 'focus');
    const breakSessions = sessions.filter(s => s.type === 'break');
    
    const totalFocusTime = focusSessions.reduce((sum, s) => sum + s.duration, 0);
    const totalBreakTime = breakSessions.reduce((sum, s) => sum + s.duration, 0);
    
    // Daily breakdown for the entire month
    const daysInMonth = endOfMonth.getDate();
    const dailyData = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      // Use local date string
      const yearNum = date.getFullYear();
      const monthNum = String(date.getMonth() + 1).padStart(2, '0');
      const dayNum = String(date.getDate()).padStart(2, '0');
      const dateStr = `${yearNum}-${monthNum}-${dayNum}`;
      
      const daySessions = sessions.filter(s => s.date === dateStr && s.type === 'focus');
      const dayTotal = daySessions.reduce((sum, s) => sum + s.duration, 0);
      
      dailyData.push({
        day: day,
        date: dateStr,
        totalMinutes: Math.round(dayTotal / 60),
        sessions: daySessions.length,
      });
    }
    
    // Calculate average
    const avgFocusTime = focusSessions.length > 0 
      ? Math.round(totalFocusTime / focusSessions.length) 
      : 0;
    
    // Calculate task statistics
    const taskStats = {};
    focusSessions.forEach(session => {
      if (session.task) {
        const taskId = session.task.id;
        if (!taskStats[taskId]) {
          taskStats[taskId] = {
            task: session.task,
            count: 0,
            duration: 0,
          };
        }
        taskStats[taskId].count++;
        taskStats[taskId].duration += session.duration;
      }
    });

    // Sort tasks by duration (descending) and get top 5
    const topTasks = Object.values(taskStats)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);
    
    return {
      totalFocusTime, // in seconds
      totalBreakTime, // in seconds
      focusSessions: focusSessions.length,
      breakSessions: breakSessions.length,
      avgFocusTime, // in seconds
      dailyData,
      topTasks,
      sessions,
    };
  } catch (error) {
    console.error('❌ Error getting monthly stats:', error);
    return {
      totalFocusTime: 0,
      totalBreakTime: 0,
      focusSessions: 0,
      breakSessions: 0,
      avgFocusTime: 0,
      dailyData: [],
      topTasks: [],
      sessions: [],
    };
  }
};

/**
 * Clear all sessions (for testing/reset)
 * @returns {Promise<boolean>} Success status
 */
export const clearAllSessions = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('✅ All sessions cleared');
    return true;
  } catch (error) {
    console.error('❌ Error clearing sessions:', error);
    return false;
  }
};

/**
 * Format seconds to readable time string
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted time (e.g., "2h 30m" or "45m")
 */
export const formatDuration = (seconds) => {
  if (seconds === 0) return '0m';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  // If we have time but less than a minute, show at least 1m
  if (seconds > 0 && hours === 0 && minutes === 0) {
    return '1m';
  }
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};



