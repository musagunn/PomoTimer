import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = -80;

const SwipeableNoteCard = ({ note, onPress, onDelete }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const translateX = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal swipes
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow left swipe (negative dx)
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
        } else if (lastOffset.current < 0) {
          // If already swiped, allow closing
          translateX.setValue(gestureState.dx + lastOffset.current);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < SWIPE_THRESHOLD) {
          // Open delete button
          Animated.spring(translateX, {
            toValue: SWIPE_THRESHOLD,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start();
          lastOffset.current = SWIPE_THRESHOLD;
        } else {
          // Close
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start();
          lastOffset.current = 0;
        }
      },
    })
  ).current;

  const handleDelete = () => {
    // Animate out
    Animated.timing(translateX, {
      toValue: -SCREEN_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDelete(note.id);
    });
  };

  const handlePress = () => {
    if (lastOffset.current < 0) {
      // If swiped, close it
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
      lastOffset.current = 0;
    } else {
      onPress(note);
    }
  };

  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      {/* Delete Button (Behind) */}
      <View style={styles.deleteContainer}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <MaterialIcons name="delete" size={24} color="#ffffff" />
          <Text style={styles.deleteText}>{t('delete')}</Text>
        </TouchableOpacity>
      </View>

      {/* Note Card (Front) */}
      <Animated.View
        style={[
          styles.noteCard,
          {
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.noteContent}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <View style={styles.noteHeader}>
            <Text style={styles.noteTitle} numberOfLines={1}>
              {note.title}
            </Text>
            <Text style={styles.noteDate}>{note.date}</Text>
          </View>
          
          <Text style={styles.noteContentText} numberOfLines={2}>
            {note.content}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    marginBottom: 12,
    position: 'relative',
  },
  
  // Delete Button (Behind)
  deleteContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: theme.error,
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    gap: 4,
  },
  deleteText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Note Card (Front)
  noteCard: {
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.border,
  },
  noteContent: {
    padding: 16,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  noteTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginRight: 8,
  },
  noteDate: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  noteContentText: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
  },
});

export default SwipeableNoteCard;

