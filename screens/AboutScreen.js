import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const AboutScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const { t } = useLanguage();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLinkedInPress = () => {
    Linking.openURL('https://tr.linkedin.com/in/musa-g%C3%BCn-217a00361');
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
        
        <Text style={styles.headerTitle}>{t('about')}</Text>
        
        <View style={styles.headerSpacer} />
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={isDarkMode ? require('../assets/logo-dark.png') : require('../assets/logo-light.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* App Name */}
        <Text style={styles.appName}>PomoTimer</Text>
        <Text style={styles.version}>v1.0.0</Text>

        {/* Mission Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('mission')}</Text>
          <Text style={styles.missionText}>
            {t('missionText1')}
          </Text>
          <Text style={styles.missionText}>
            {t('missionText2')}
          </Text>
          <Text style={styles.missionText}>
            {t('missionText3')}
          </Text>
        </View>

        {/* Developer Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('developer')}</Text>
          <TouchableOpacity 
            style={styles.developerCard}
            onPress={handleLinkedInPress}
            activeOpacity={0.7}
          >
            <View style={styles.developerInfo}>
              <MaterialIcons name="person" size={24} color={theme.primary} />
              <Text style={styles.developerName}>Musa Gün</Text>
            </View>
            <MaterialIcons name="open-in-new" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t('madeWith')}
          </Text>
          <Text style={styles.footerSubtext}>
            © 2024 PomoTimer
          </Text>
        </View>
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
    backgroundColor: theme.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
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
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  
  // Logo
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
  },
  
  // App Info
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  version: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  
  // Section
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 12,
  },
  missionText: {
    fontSize: 15,
    color: theme.textSecondary,
    lineHeight: 24,
    marginBottom: 12,
    textAlign: 'justify',
  },
  
  // Developer
  developerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.cardBackground,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  developerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  developerName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  
  // Footer
  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  footerText: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 12,
    color: theme.textTertiary,
  },
});

export default AboutScreen;

