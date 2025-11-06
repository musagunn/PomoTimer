import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const TimerPickerModal = ({ visible, onClose, onSelect, mode = 'Focus Time' }) => {
  const { theme, isDarkMode } = useTheme();
  const { t } = useLanguage();
  // Set default based on mode
  const defaultMinutes = mode === 'Break Time' ? '5' : '25';
  const [minutes, setMinutes] = useState(defaultMinutes);
  const [seconds, setSeconds] = useState('00');

  // Reset to defaults when mode changes
  React.useEffect(() => {
    if (visible) {
      const newDefault = mode === 'Break Time' ? '5' : '25';
      setMinutes(newDefault);
      setSeconds('00');
    }
  }, [mode, visible]);

  // Quick select options based on mode
  const focusOptions = [
    { label: '15 min', value: 15 },
    { label: '25 min', value: 25 },
    { label: '30 min', value: 30 },
    { label: '45 min', value: 45 },
    { label: '60 min', value: 60 },
    { label: '90 min', value: 90 },
  ];

  const breakOptions = [
    { label: '5 min', value: 5 },
    { label: '10 min', value: 10 },
    { label: '15 min', value: 15 },
    { label: '20 min', value: 20 },
    { label: '30 min', value: 30 },
  ];

  const quickOptions = mode === 'Break Time' ? breakOptions : focusOptions;

  const handleQuickSelect = (value) => {
    setMinutes(String(value));
    setSeconds('00');
  };

  const handleConfirm = () => {
    const mins = parseInt(minutes) || 0;
    const secs = parseInt(seconds) || 0;
    
    const totalSeconds = mins * 60 + secs;
    
    // Validate: must be at least 1 minute (60 seconds)
    if (totalSeconds < 60) {
      alert(t('minimumOneMinute'));
      return;
    }
    
    if (totalSeconds > 0) {
      onSelect(totalSeconds);
      onClose();
    }
  };

  const handleMinutesChange = (text) => {
    // Only allow numbers
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned === '' || parseInt(cleaned) <= 999) {
      setMinutes(cleaned);
    }
  };

  const handleSecondsChange = (text) => {
    // Only allow numbers
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned === '' || (parseInt(cleaned) >= 0 && parseInt(cleaned) <= 59)) {
      setSeconds(cleaned);
    }
  };

  const styles = getStyles(theme);

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
            <View style={styles.modal}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>
                  {mode === 'Break Time' ? t('setBreakTime') : t('setFocusTime')}
                </Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <MaterialIcons name="close" size={24} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Quick Select */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('quickSelect')}</Text>
                <View style={styles.quickOptions}>
                  {quickOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.quickButton,
                        minutes === String(option.value) && seconds === '00' && styles.quickButtonActive,
                      ]}
                      onPress={() => handleQuickSelect(option.value)}
                    >
                      <Text
                        style={[
                          styles.quickButtonText,
                          minutes === String(option.value) && seconds === '00' && styles.quickButtonTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Custom Time Input */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('customTime')}</Text>
                <View style={styles.timeInputContainer}>
                  <View style={styles.timeInputGroup}>
                    <TextInput
                      style={styles.timeInput}
                      value={minutes}
                      onChangeText={handleMinutesChange}
                      keyboardType="number-pad"
                      maxLength={3}
                      selectTextOnFocus
                    />
                    <Text style={styles.timeLabel}>{t('minutes')}</Text>
                  </View>
                  
                  <Text style={styles.timeSeparator}>:</Text>
                  
                  <View style={styles.timeInputGroup}>
                    <TextInput
                      style={styles.timeInput}
                      value={seconds}
                      onChangeText={handleSecondsChange}
                      keyboardType="number-pad"
                      maxLength={2}
                      selectTextOnFocus
                    />
                    <Text style={styles.timeLabel}>{t('seconds')}</Text>
                  </View>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                >
                  <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleConfirm}
                >
                  <Text style={styles.confirmButtonText}>{t('setTimer')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const getStyles = (theme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: theme.cardBackground,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  
  // Section
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Quick Options
  quickOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: theme.background,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  quickButtonActive: {
    backgroundColor: theme.background,
    borderColor: theme.primary,
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  quickButtonTextActive: {
    color: theme.primary,
  },
  
  // Time Input
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  timeInputGroup: {
    alignItems: 'center',
    gap: 8,
  },
  timeInput: {
    width: 80,
    height: 80,
    backgroundColor: theme.background,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.border,
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.textPrimary,
    textAlign: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  timeSeparator: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.textSecondary,
    marginBottom: 28,
  },
  
  // Actions
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: theme.background,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: theme.primary,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default TimerPickerModal;

