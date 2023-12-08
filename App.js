import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { store } from './store.js';
import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist'
import { ActivityIndicator } from 'react-native';
import SplashPage from './splash.js';
import AuthenticationPage from './authentication.js';
import MenuPage from './menu.js';
import HuntsPage from './hunts.js';
import DetailsPage from './details.js';
import LocationPage from './location.js';
import ConditionsPage from './conditions.js';
import FindHunts from './find.js';
import PlayHunts from './play.js';
import LocationClue from './clue.js';

const persistor = persistStore(store)
const Stack = createNativeStackNavigator()


export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<ActivityIndicator/>} persistor={persistor}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="Splash"
              component={SplashPage}
              options={{title: "Welcome!"}}
            />
            <Stack.Screen
              name="Authentication"
              component={AuthenticationPage}
              options={{title: 'Authentication'}}
            />
            <Stack.Screen
              name="Menu"
              component={MenuPage}
              options={{title: 'Menu'}}
            />
            <Stack.Screen
              name="Hunts"
              component={HuntsPage}
              options={{title: 'Hunts'}}
              />
            <Stack.Screen
              name="Details"
              component={DetailsPage}
              options={{title: 'Details'}}
            />
            <Stack.Screen
              name="Location"
              component={LocationPage}
              options={{title: 'Location Details'}}
            />
            <Stack.Screen
              name="Conditions"
              component={ConditionsPage}
              options={{title: 'Conditions'}}
            />
            <Stack.Screen
              name="Find Hunts"
              component={FindHunts}
              options={{title: 'Find Hunts'}}
            />
            <Stack.Screen
              name="Play Hunts"
              component={PlayHunts}
              options={{title: 'Play Hunts'}}
            />
            <Stack.Screen
              name="Location Clue"
              component={LocationClue}
              options={{title: 'Location Clue'}}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PersistGate>
    </Provider>
  )
}