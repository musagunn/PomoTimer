import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const ReportsScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const { t } = useLanguage();
  const handleWeeklyReport = () => {
    navigation.navigate('WeeklyReport');
  };

  const handleMonthlyReport = () => {
    navigation.navigate('MonthlyReport');
  };

  const handleBack = () => {
    navigation.goBack();
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
        
        <Text style={styles.headerTitle}>{t('reportsTitle')}</Text>
        
        <View style={styles.headerSpacer} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          {t('chooseReportPrompt')}
        </Text>

        {/* Weekly Report Card */}
        <TouchableOpacity 
          style={styles.reportCard}
          onPress={handleWeeklyReport}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <MaterialIcons name="insert-chart" size={48} color={theme.primary} />
          </View>
          
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{t('weeklyReport')}</Text>
            <Text style={styles.cardDescription}>
              {t('weeklyReportDesc')}
            </Text>
          </View>
          
          <MaterialIcons name="chevron-right" size={32} color={theme.textSecondary} />
        </TouchableOpacity>

        {/* Monthly Report Card */}
        <TouchableOpacity 
          style={styles.reportCard}
          onPress={handleMonthlyReport}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <MaterialIcons name="calendar-today" size={48} color={theme.secondary} />
          </View>
          
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{t('monthlyReport')}</Text>
            <Text style={styles.cardDescription}>
              {t('monthlyReportDesc')}
            </Text>
          </View>
          
          <MaterialIcons name="chevron-right" size={32} color={theme.textSecondary} />
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
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  headerSpacer: {
    width: 48,
  },
  
  // Content
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  subtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  
  // Report Cards
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.border,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: theme.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
  },
});

export default ReportsScreen;

