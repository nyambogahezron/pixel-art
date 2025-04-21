
  import { NavigationContainer } from '@react-navigation/native';
  import { createNativeStackNavigator } from '@react-navigation/native-stack';
  import { StyleSheet } from 'react-native';
  import { SafeAreaProvider } from "react-native-safe-area-context"
  import { Toaster } from 'sonner-native';
  import HomeScreen from "./screens/HomeScreen"
  
  const Stack = createNativeStackNavigator();
  
  function RootStack() {
    return (
      <Stack.Navigator screenOptions={{
      headerShown: false
    }}>
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    );
  }
  
  export default function App() {
    return (
      <SafeAreaProvider style={styles.container}>
      <Toaster />
        <NavigationContainer>
          <RootStack />
        </NavigationContainer>
      </SafeAreaProvider>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1
    }
  });
