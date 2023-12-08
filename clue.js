import { useEffect, useState} from 'react';
import { View, Text, Button, Alert, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { removeToken } from './slices.js';
import { styles } from './styles.js';

import AntDesign from '@expo/vector-icons/AntDesign';

import * as Location from 'expo-location'
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';


export default function LocationClue({navigation, route}){
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token.tokens);
  const [Hunt] = useState(route.params.Hunt);

  const [location, setLocation] = useState(route.params.location);

  const [locationGranted, setLocationGranted] = useState(false);
  const [subscription, setSubscription] = useState(null)
  const [userLocation, setUserLocation] = useState({
    latitude: 39.9937,
    longitude: -81.7340,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05
  });

  const [tooFarMap, setTooFarMap] = useState(false);
  const [updateCheck, setUpdateCheck] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          onPress={() => {
            dispatch(removeToken());
            navigation.reset({
              index: 0,
              routes: [{ name: 'Authentication' }],
            });
          }}
          title="Logout"/>
      ),
    });
  }, [navigation, dispatch]);

  useEffect(() => {
    (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setLocationGranted(false);
            Alert.alert('Location Denied.', "You will not be able to use the location features of this Scavenger Hunt App. Please enable them in your settings and refresh the App.", [
                {text: 'OK'}
            ]);
            return;
        }

        setLocationGranted(true);
        
        let result = await Location.watchPositionAsync({
            accuracy: Location.Accuracy.Highest,
            distanceInterval: 3,
        }, watchLocation);

        setSubscription(result)
        return () => {
            stopTracking();
        }
    })();
    }, []);

    useEffect(() => {
        (async () => {
            let formData = new FormData();
            formData.append("token", token[0]);
            formData.append("huntid", Hunt.huntid);
            const result = await fetch('https://cpsc345sh.jayshaffstall.com/getAvailableLocations.php',{
                method: 'POST',
                body: formData
            });
            if (result.ok){
            const data = await result.json()
                if (data.status == "error"){
                    Alert.alert('Oops!', String(data.error), [
                        {text: 'OK'}]);
                    return;
                }else{
                    if(data.locations.find(element => String(element.locationid) == String(location.locationid))){
                        setLocation(data.locations.find(element => String(element.locationid) == String(location.locationid)));
                    }
                }   
            }else{
                Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
                {text: 'OK'}]);
            }
    })()}, [updateCheck]);
    
    const stopTracking = async () => {
        if (subscription != null){
            await subscription.remove()
        }
    }
    const watchLocation = (location) => {
        if (location && location.coords) {
            setUserLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05
            });
        }
    }

  const completeLocation = async() =>{
    if (locationGranted == false){
        Alert.alert('Location Not Granted.', "You will not be able to use the location features of this Scavenger Hunt App until you enable them in your settings and refresh the App.", [
            {text: 'OK'}
        ]);
        return;
    }
    let formData = new FormData();
    formData.append("token", token[0]);
    formData.append("locationid", location.locationid);
    formData.append("latitude", userLocation.latitude);
    formData.append("longitude", userLocation.longitude);
    const result = await fetch('https://cpsc345sh.jayshaffstall.com/completeLocation.php',{
      method: 'POST',
      body: formData
      })
    if (result.ok){
      const data = await result.json()
      
      
      if(data.status == "error"){
        if (data.error == "Wrong time of day"){
            Alert.alert('Wrong time of day!', 'You can\'t check into this location at this moment, so come back when you think it\'s available. Maybe the clue will help...', [
                {text: 'OK'}]);
        }else{
            Alert.alert('Oops!', String(data.error), [
                {text: 'OK'}]);
        }
        }else{
            setUpdateCheck(!updateCheck);
            if(data.status == "toofar"){
                Alert.alert('You\'re too Far!', tooFarMap==true ?'Please move within 5 meters (~16 feet) of the location.': 'Please move within 5 meters (~16 feet) of the location.\n\nDo you want to see the location on a map?', tooFarMap==false?[
                    {text: 'YES', onPress:()=>{setTooFarMap(true);}}, {text: 'NO'}]:[{text:'OK'}]);
            }else{
                if(tooFarMap == true){
                    setTooFarMap(!false);
                }
            }
        }
    }
    else{
      Alert.alert('Oops! Something went wrong with our API. Please try again, or come back another time.', String(result.status), [
        {text: 'OK'}]);
    } 
  }

return(
  <View style={styles.container}>
    <ScrollView>
    <Text style={{fontSize: 25, fontWeight: '400', textAlign:'center', margin:20}}>
        Location Name: <Text style={{fontSize: 25, fontWeight: '200', textAlign:'center'}}>{location.name}{"\n"}</Text>Description: <Text style={{fontSize: 25, fontWeight: '200', textAlign:'center'}}>{location.description}{"\n"}</Text>Clue: <Text style={{fontSize: 25, fontWeight: '200', textAlign:'center'}}>{location.clue}</Text>
    </Text>
    {tooFarMap == true?
    <View style={styles.container}>
    <Text style={{fontSize: 25, fontWeight: '400', textAlign:'center', marginBottom:20}}>Here's the location and you on a map!</Text>
    <View style={{height:200, width: 300, alignContent: 'center'}}>
        <MapView style={{height: '100%', width: '100%'}} initialRegion={userLocation}>
        <Marker
            key='userLocation'
            identifier='userLocation'
            coordinate={{longitude: userLocation.longitude, latitude: userLocation.latitude, }}
            title='You'
            description='This is your current Location'
        />
        <Marker
            key={location.name}
            identifier={location.name}
            coordinate={{longitude: location.longitude, latitude: location.latitude, }}
            title={location.name}
            description={'This is where \'' + location.name +'\' is located'}
        />
        </MapView>
    </View>
    </View>:<View style={styles.container}></View>}
    {location.completed == true? <View style={styles.container}>
    <View style={{ width: 200, height: 200, alignSelf:'center', alignContent:'center', justifyContent: 'center', marginBottom:10}}>
        <MapView style={{ height: '100%', width: '100%' }}
        minZoomLevel={14}
        maxZoomLevel={14}
        scrollEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        zoomEnabled={false}
        region={{longitude: location.longitude, latitude: location.latitude, longitudeDelta:0.05, latitudeDelta:0.05}}>
        <Marker
            key={location.name}
            identifier={location.name}
            coordinate={{longitude: location.longitude, latitude: location.latitude, }}
            title={location.name}
            description={'This is where \'' + location.name +'\' is located'}
        />
        </MapView>
    </View>
    <Text style={{fontSize: 25, fontWeight: '400', textAlign:'center'}}>
    <AntDesign name="staro" size={25}/> Congrats! You found and checked in at this location! <AntDesign name="staro" size={25}/>
    </Text>
    </View>
    :
    <View style={styles.container}>
    <AntDesign.Button alignContent='center' name="save" backgroundColor={subscription == null? 'red':'green'} disabled={subscription == null} onPress={completeLocation}>
        {subscription == null? "Getting your location....":"Check in"}
    </AntDesign.Button>
    </View>
    }
    </ScrollView>
  </View>
)}