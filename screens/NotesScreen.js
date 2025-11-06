import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const NotesScreen = ({ navigation, route }) => {
  const { theme, isDarkMode } = useTheme();
  const { t } = useLanguage();
  const note = route?.params?.note;
  const [noteTitle, setNoteTitle] = useState(note?.title || '');
  const [noteText, setNoteText] = useState(note?.content || '');
  const maxCharacters = 500;

  const handleClose = () => {
    // Navigation back veya modal close
    if (navigation) {
      navigation.goBack();
    }
  };

  const handleSave = () => {
    // Validate
    if (!noteTitle.trim() && !noteText.trim()) {
      alert(t('enterTitleOrContent'));
      return;
    }

    // Create/update note object
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const savedNote = {
      id: note?.id || Date.now().toString(),
      title: noteTitle.trim() || t('untitledNote'),
      content: noteText.trim(),
      date: formattedDate,
      session: t('focusTime'),
    };
    
    // Navigate back with the saved note as a param
    if (navigation) {
      navigation.navigate('Notes', { savedNote });
    }
  };

  const styles = getStyles(theme);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={styles.innerContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
            >
              <MaterialIcons name="close" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>
              {note ? t('editNote') : t('newNote')}
            </Text>
            
            {/* Spacer for centering title */}
            <View style={styles.headerSpacer} />
          </View>
        </View>

        {/* Main Content */}
        <ScrollView
          style={styles.mainContent}
          contentContainerStyle={styles.mainContentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title Input */}
          <TextInput
            style={styles.titleInput}
            placeholder={t('noteTitlePlaceholder')}
            placeholderTextColor="#64748b"
            value={noteTitle}
            onChangeText={setNoteTitle}
            maxLength={100}
          />

          {/* Text Input Container */}
          <View style={styles.textFieldContainer}>
            <TextInput
              style={styles.textInput}
              multiline
              placeholder={t('noteContentPlaceholder')}
              placeholderTextColor="#64748b"
              value={noteText}
              onChangeText={setNoteText}
              maxLength={maxCharacters}
              textAlignVertical="top"
            />
            
            {/* Character Counter */}
            <Text style={styles.characterCounter}>
              {noteText.length}/{maxCharacters} {t('characters')}
            </Text>
          </View>
        </ScrollView>

        {/* Footer with Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>{t('saveNote')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  innerContainer: {
    flex: 1,
  },
  
  // Header Styles
  header: {
    backgroundColor: theme.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    marginRight: 40, // Balance the close button
  },
  headerSpacer: {
    width: 40,
  },
  
  // Main Content
  mainContent: {
    flex: 1,
  },
  mainContentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexGrow: 1,
  },
  titleInput: {
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  
  // Text Field
  textFieldContainer: {
    flex: 1,
    minHeight: 200,
  },
  textInput: {
    flex: 1,
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme.textPrimary,
    minHeight: 150,
    borderWidth: 1,
    borderColor: theme.border,
  },
  characterCounter: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'right',
    marginTop: 8,
  },
  
  // Footer
  footer: {
    backgroundColor: theme.background,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  saveButton: {
    width: '100%',
    height: 48,
    backgroundColor: theme.secondary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.24,
  },
});

export default NotesScreen;

