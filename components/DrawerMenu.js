import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Switch,
  Linking,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

const DrawerMenu = ({ visible, onClose, navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const [showLanguageOptions, setShowLanguageOptions] = useState(false);
  
  const menuItems = [
    {
      id: 'about',
      title: t('about'),
      icon: 'info',
      onPress: () => {
        onClose();
        if (navigation) {
          navigation.navigate('About');
        }
      },
    },
    {
      id: 'help',
      title: t('helpFeedback'),
      icon: 'help',
      onPress: async () => {
        onClose();
        const email = 'musagun.272@gmail.com';
        const subject = t('feedbackSubject');
        const body = t('feedbackBody');
        const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        try {
          const canOpen = await Linking.canOpenURL(mailtoUrl);
          if (canOpen) {
            await Linking.openURL(mailtoUrl);
          } else {
            Alert.alert(
              t('error'),
              t('emailClientNotFound'),
              [{ text: t('ok') }]
            );
          }
        } catch (error) {
          console.error('Error opening email:', error);
          Alert.alert(
            t('error'),
            t('emailError'),
            [{ text: t('ok') }]
          );
        }
      },
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.drawer, { backgroundColor: theme.cardBackground }]}>
              {/* Drawer Header */}
              <View style={[styles.drawerHeader, { 
                backgroundColor: theme.background,
                borderBottomColor: theme.border,
              }]}>
                <View style={styles.headerContent}>
                  <MaterialIcons name="access-time" size={40} color={theme.primary} />
                  <Text style={[styles.appName, { color: theme.textPrimary }]}>PomoTimer</Text>
                  <Text style={[styles.appVersion, { color: theme.textSecondary }]}>v1.0.0</Text>
                </View>
              </View>

              {/* Theme Toggle */}
              <View style={styles.menuItems}>
                <View style={[styles.themeSection, { borderBottomColor: theme.border }]}>
                  <View style={styles.themeSectionHeader}>
                    <MaterialIcons name="palette" size={20} color={theme.textSecondary} />
                    <Text style={[styles.themeSectionTitle, { color: theme.textSecondary }]}>
                      {t('appearance')}
                    </Text>
                  </View>
                  
                  <View style={styles.themeToggleContainer}>
                    <View style={styles.themeToggleLeft}>
                      <MaterialIcons 
                        name={isDarkMode ? "dark-mode" : "light-mode"} 
                        size={24} 
                        color={theme.textPrimary} 
                      />
                      <Text style={[styles.themeToggleText, { color: theme.textPrimary }]}>
                        {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                      </Text>
                    </View>
                    <Switch
                      value={isDarkMode}
                      onValueChange={toggleTheme}
                      trackColor={{ false: '#d1d5db', true: '#A8D8B9' }}
                      thumbColor="#ffffff"
                    />
                  </View>
                </View>

                {/* Language Section */}
                <View style={[styles.themeSection, { borderBottomColor: theme.border }]}>
                  <View style={styles.themeSectionHeader}>
                    <MaterialIcons name="language" size={20} color={theme.textSecondary} />
                    <Text style={[styles.themeSectionTitle, { color: theme.textSecondary }]}>
                      {t('language')}
                    </Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.languageSelector}
                    onPress={() => setShowLanguageOptions(!showLanguageOptions)}
                  >
                    <View style={styles.languageSelectorLeft}>
                      <MaterialIcons 
                        name="translate" 
                        size={24} 
                        color={theme.textPrimary} 
                      />
                      <Text style={[styles.languageText, { color: theme.textPrimary }]}>
                        {currentLanguage === 'tr' ? 'Türkçe' : 'English'}
                      </Text>
                    </View>
                    <MaterialIcons 
                      name={showLanguageOptions ? "expand-less" : "expand-more"} 
                      size={24} 
                      color={theme.textSecondary} 
                    />
                  </TouchableOpacity>

                  {showLanguageOptions && (
                    <View style={styles.languageOptions}>
                      <TouchableOpacity
                        style={[
                          styles.languageOption,
                          currentLanguage === 'tr' && styles.languageOptionActive,
                        ]}
                        onPress={() => {
                          changeLanguage('tr');
                          setShowLanguageOptions(false);
                        }}
                      >
                        <Text style={[
                          styles.languageOptionText, 
                          { color: theme.textPrimary },
                          currentLanguage === 'tr' && { color: theme.primary, fontWeight: 'bold' }
                        ]}>
                          🇹🇷 Türkçe
                        </Text>
                        {currentLanguage === 'tr' && (
                          <MaterialIcons name="check" size={20} color={theme.primary} />
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.languageOption,
                          currentLanguage === 'en' && styles.languageOptionActive,
                        ]}
                        onPress={() => {
                          changeLanguage('en');
                          setShowLanguageOptions(false);
                        }}
                      >
                        <Text style={[
                          styles.languageOptionText, 
                          { color: theme.textPrimary },
                          currentLanguage === 'en' && { color: theme.primary, fontWeight: 'bold' }
                        ]}>
                          🇬🇧 English
                        </Text>
                        {currentLanguage === 'en' && (
                          <MaterialIcons name="check" size={20} color={theme.primary} />
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Menu Items */}
                {menuItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.menuItem}
                    onPress={item.onPress}
                  >
                    <MaterialIcons name={item.icon} size={24} color={theme.textPrimary} />
                    <Text style={[styles.menuItemText, { color: theme.textPrimary }]}>
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Drawer Footer */}
              <View style={[styles.drawerFooter, { borderTopColor: theme.border }]}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <MaterialIcons name="close" size={24} color={theme.textSecondary} />
                  <Text style={[styles.closeButtonText, { color: theme.textSecondary }]}>
                    {t('close')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  drawer: {
    width: DRAWER_WIDTH,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  
  // Header
  drawerHeader: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  headerContent: {
    alignItems: 'center',
    gap: 8,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  appVersion: {
    fontSize: 14,
  },
  
  // Menu Items
  menuItems: {
    flex: 1,
    paddingTop: 8,
  },
  
  // Theme Section
  themeSection: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  themeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  themeSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeToggleText: {
    fontSize: 16,
    fontWeight: '500',
  },
  
  // Language Selector
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  languageSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  languageText: {
    fontSize: 16,
    fontWeight: '500',
  },
  languageOptions: {
    marginTop: 8,
    marginLeft: 36,
    gap: 4,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  languageOptionActive: {
    backgroundColor: 'rgba(168, 216, 185, 0.1)',
  },
  languageOptionText: {
    fontSize: 15,
  },
  
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  
  // Footer
  drawerFooter: {
    borderTopWidth: 1,
    padding: 16,
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default DrawerMenu;

