import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import HomeScreen from './HomeScreen';
import JoinScreen from './JoinScreen';
import GameScreen from './GameScreen';
import SelectRoomScreen from './SelectRoomScreen';

const Stack = createNativeStackNavigator();

function forFade({ current }) {
  return {
    cardStyle: {
      opacity: current.progress,
    },
  };
}

export default function App() {
  return (
      <NavigationContainer>
        <Stack.Navigator
          mode="modal"
          screenOptions={{
            headerShown: false,
            cardStyleInterpolator: forFade, // Use the custom fade transition
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Join" component={JoinScreen} />
          <Stack.Screen name="Game" component={GameScreen} />
          <Stack.Screen name="Select" component={SelectRoomScreen} />
        </Stack.Navigator>
      </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundStyle: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});