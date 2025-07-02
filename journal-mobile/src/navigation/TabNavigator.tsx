import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

import TodayScreen from '../screens/TodayScreen';
import HistoryScreen from '../screens/HistoryScreen';
import CalendarScreen from '../screens/CalendarScreen';

export type TabParamList = {
  Today: undefined;
  History: undefined;
  Calendar: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Today') {
            iconName = focused ? 'today' : 'today-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Calendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary[600],
        tabBarInactiveTintColor: Colors.gray[400],
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.gray[200],
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: Colors.surface,
          borderBottomColor: Colors.gray[200],
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          color: Colors.text.primary,
          fontSize: 18,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen
        name="Today"
        component={TodayScreen}
        options={{
          title: '今日の日記',
          tabBarLabel: '今日',
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: '履歴',
          tabBarLabel: '履歴',
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          title: 'カレンダー',
          tabBarLabel: 'カレンダー',
        }}
      />
    </Tab.Navigator>
  );
}