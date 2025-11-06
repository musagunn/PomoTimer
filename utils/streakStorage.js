import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_STORAGE_KEY = '@pomodoro_streak';

/**
 * Get streak data
 * @returns {Promise<{currentStreak: number, longestStreak: number, lastSessionDate: string}>}
 */
export const getStreakData = async () => {
  try {
    const data = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    // Default streak data
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastSessionDate: null,
    };
  } catch (error) {
    console.error('Error loading streak data:', error);
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastSessionDate: null,
    };
  }
};

/**
 * Save streak data
 */
const saveStreakData = async (streakData) => {
  try {
    await AsyncStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(streakData));
    return true;
  } catch (error) {
    console.error('Error saving streak data:', error);
    return false;
  }
};

/**
 * Check if two dates are on the same day
 */
const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

/**
 * Check if two dates are consecutive days
 */
const isConsecutiveDay = (today, lastDate) => {
  const todayDate = new Date(today);
  const lastDateObj = new Date(lastDate);
  
  // Reset time to midnight for accurate comparison
  todayDate.setHours(0, 0, 0, 0);
  lastDateObj.setHours(0, 0, 0, 0);
  
  const diffTime = todayDate - lastDateObj;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays === 1;
};

/**
 * Update streak when a session is completed
 * Called after each Pomodoro session
 */
export const updateStreak = async () => {
  try {
    const streakData = await getStreakData();
    const today = new Date().toISOString();
    
    // If no previous session, start new streak
    if (!streakData.lastSessionDate) {
      const newStreakData = {
        currentStreak: 1,
        longestStreak: 1,
        lastSessionDate: today,
      };
      await saveStreakData(newStreakData);
      return newStreakData;
    }
    
    // If already completed a session today, don't increment
    if (isSameDay(today, streakData.lastSessionDate)) {
      return streakData;
    }
    
    // If yesterday, increment streak
    if (isConsecutiveDay(today, streakData.lastSessionDate)) {
      const newCurrentStreak = streakData.currentStreak + 1;
      const newLongestStreak = Math.max(newCurrentStreak, streakData.longestStreak);
      
      const newStreakData = {
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastSessionDate: today,
      };
      await saveStreakData(newStreakData);
      return newStreakData;
    }
    
    // If more than 1 day gap, reset streak
    const newStreakData = {
      currentStreak: 1,
      longestStreak: streakData.longestStreak,
      lastSessionDate: today,
    };
    await saveStreakData(newStreakData);
    return newStreakData;
  } catch (error) {
    console.error('Error updating streak:', error);
    return null;
  }
};

/**
 * Reset streak (for testing)
 */
export const resetStreak = async () => {
  try {
    const resetData = {
      currentStreak: 0,
      longestStreak: 0,
      lastSessionDate: null,
    };
    await saveStreakData(resetData);
    return true;
  } catch (error) {
    console.error('Error resetting streak:', error);
    return false;
  }
};


