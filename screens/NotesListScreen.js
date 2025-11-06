import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import SwipeableNoteCard from '../components/SwipeableNoteCard';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getNotes, saveNote, deleteNote as deleteNoteFromStorage } from '../utils/notesStorage';

const NotesListScreen = ({ navigation, route }) => {
  const { theme, isDarkMode } = useTheme();
  const { t } = useLanguage();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load notes from storage when component mounts
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const loadedNotes = await getNotes();
      setNotes(loadedNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Listen for saved notes when returning from NotesEntry screen
  useEffect(() => {
    if (route.params?.savedNote) {
      const savedNote = route.params.savedNote;
      
      // Save to storage and update state
      saveNote(savedNote).then((updatedNotes) => {
        if (updatedNotes) {
          setNotes(updatedNotes);
        }
      });
      
      // Clear the param
      navigation.setParams({ savedNote: undefined });
    }
  }, [route.params?.savedNote, navigation]);

  // Reload notes when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadNotes();
    }, [])
  );

  const handleAddNote = () => {
    navigation.navigate('NotesEntry');
  };

  const handleNotePress = (note) => {
    // Navigate to edit note
    navigation.navigate('NotesEntry', { note });
  };

  const handleDeleteNote = async (noteId) => {
    const updatedNotes = await deleteNoteFromStorage(noteId);
    if (updatedNotes) {
      setNotes(updatedNotes);
    }
  };

  const renderNoteItem = ({ item }) => (
    <SwipeableNoteCard
      note={item}
      onPress={handleNotePress}
      onDelete={handleDeleteNote}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="note-add" size={64} color={theme.border} />
      <Text style={styles.emptyStateTitle}>{t('noNotes')}</Text>
      <Text style={styles.emptyStateText}>
        {t('startTakingNotes')}
      </Text>
    </View>
  );

  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor={theme.background} 
      />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('notes')}</Text>
        <Text style={styles.headerSubtitle}>
          {notes.length} {notes.length === 1 ? t('note') : t('notesCount')}
        </Text>
      </View>

      {/* Notes List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          renderItem={renderNoteItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            notes.length === 0 && styles.listContentEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddNote}
        activeOpacity={0.8}
      >
        <MaterialIcons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="timer"
            size={24}
            color={theme.navInactive}
          />
          <Text style={styles.navText}>Timer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, styles.navItemActive]}
          activeOpacity={1}
        >
          <MaterialIcons
            name="description"
            size={24}
            color={theme.navActive}
          />
          <Text style={styles.navTextActive}>{t('notes')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Reports')}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="bar-chart"
            size={24}
            color={theme.navInactive}
          />
          <Text style={styles.navText}>Reports</Text>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: theme.background,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  
  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: theme.textSecondary,
  },
  
  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    fontSize: 12,
    fontWeight: '500',
    color: theme.navActive,
    letterSpacing: 0.18,
  },
});

export default NotesListScreen;

