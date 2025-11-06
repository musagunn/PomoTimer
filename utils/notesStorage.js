import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTES_STORAGE_KEY = '@pomodoro_notes';

/**
 * Get all notes from storage
 */
export const getNotes = async () => {
  try {
    const data = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
    const notes = data ? JSON.parse(data) : [];
    return notes;
  } catch (error) {
    console.error('Error loading notes:', error);
    return [];
  }
};

/**
 * Save all notes to storage
 */
export const saveNotes = async (notes) => {
  try {
    await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    return true;
  } catch (error) {
    console.error('Error saving notes:', error);
    return false;
  }
};

/**
 * Add or update a single note
 */
export const saveNote = async (note) => {
  try {
    const notes = await getNotes();
    const existingIndex = notes.findIndex((n) => n.id === note.id);
    
    let updatedNotes;
    if (existingIndex >= 0) {
      // Update existing note
      updatedNotes = [...notes];
      updatedNotes[existingIndex] = note;
    } else {
      // Add new note at the beginning
      updatedNotes = [note, ...notes];
    }
    
    await saveNotes(updatedNotes);
    return updatedNotes;
  } catch (error) {
    console.error('Error saving note:', error);
    return null;
  }
};

/**
 * Delete a note by ID
 */
export const deleteNote = async (noteId) => {
  try {
    const notes = await getNotes();
    const updatedNotes = notes.filter((n) => n.id !== noteId);
    await saveNotes(updatedNotes);
    return updatedNotes;
  } catch (error) {
    console.error('Error deleting note:', error);
    return null;
  }
};

/**
 * Clear all notes (for testing)
 */
export const clearAllNotes = async () => {
  try {
    await AsyncStorage.removeItem(NOTES_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing notes:', error);
    return false;
  }
};

