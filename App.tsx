import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthScreen from './screens/AuthScreen';
import Welcome from './components/Welcome';
import HearMeScreen from './modules/HearMe';
import ReadMeScreen from './modules/ReadMe';
import WriteMeScreen from './modules/WriteMe';
import TellMeScreen from './modules/TellMe';

const Stack = createNativeStackNavigator();

const Navigation: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Welcome" component={Welcome} />
          <Stack.Screen name="HearMe" component={HearMeScreen} />
          <Stack.Screen name="ReadMe" component={ReadMeScreen} />
          <Stack.Screen name="WriteMe" component={WriteMeScreen} />
          <Stack.Screen name="TellMe" component={TellMeScreen} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Navigation />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
