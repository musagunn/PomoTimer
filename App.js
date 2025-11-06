import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import HomeScreen from './screens/HomeScreen';
import NotesListScreen from './screens/NotesListScreen';
import NotesScreen from './screens/NotesScreen';
import ReportsScreen from './screens/ReportsScreen';
import WeeklyReportScreen from './screens/WeeklyReportScreen';
import MonthlyReportScreen from './screens/MonthlyReportScreen';
import AboutScreen from './screens/AboutScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen 
            name="Notes" 
            component={NotesListScreen}
          />
          <Stack.Screen 
            name="NotesEntry" 
            component={NotesScreen}
            options={{
              presentation: 'modal',
              animationEnabled: true,
            }}
          />
          <Stack.Screen 
            name="Reports" 
            component={ReportsScreen}
          />
          <Stack.Screen 
            name="WeeklyReport" 
            component={WeeklyReportScreen}
          />
          <Stack.Screen 
            name="MonthlyReport" 
            component={MonthlyReportScreen}
          />
          <Stack.Screen 
            name="About" 
            component={AboutScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
      </ThemeProvider>
    </LanguageProvider>
  );
}

