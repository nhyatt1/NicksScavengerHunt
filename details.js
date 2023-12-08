import { Text, TextInput, Button, Alert, KeyboardAvoidingView, View, ScrollView } from "react-native"
import { useEffect, useState, useRef } from "react"
import { useDispatch, useSelector } from "react-redux";
import { useIsFocused } from "@react-navigation/native";

import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';

import * as Location from 'expo-location'
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';

import { removeToken } from "./slices.js";
import { styles } from "./styles.js";

export default function HuntDetails({navigation, route}){
    const dropdownData = [
        { label: 'Not Active (Private)', value: '0' },
        { label: 'Active (Public)', value: '1' },
      ];
    const [activeValue, setActiveValue] = useState('');
    const dispatch = useDispatch();
    const token = useSelector(state => state.token.tokens);
    const [Hunt, setHunt] = useState(route.params.hunt);
    const [huntLocations, setHuntLocations] = useState([]);

    const [newName, setNewName] = useState('');
    const [newLocation, setNewLocation] = useState('')

    const [locationGranted, setLocationGranted] = useState(false);
    const [subscription, setSubscription] = useState(null)
    const regionRef = useRef();
    regionRef.current = region;
    const [userLocation, setUserLocation] = useState({
        latitude: 39.9937,
        longitude: -81.7340,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05
    });

    const [region, setRegion] = useState({
        latitude: 39.9937,
        longitude: -81.7340,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05
    });
    const [updateCheck, SetUpdateCheck] = useState(false);
    const isFocused = useIsFocused();
    
    const [requiredLocationIDS, setRequiredLocationIDS] = useState([]);

    const displayMarkers = (locationsData, requiredData) => {
        if (locationsData && locationsData.length > 0) {
            return(locationsData.map((position, index) => (
                <Marker
                key={index}
                identifier={index}
                coordinate={{longitude: position.longitude, latitude: position.latitude, }}
                title={position.name}
                description={"Tap me to edit!"}
                onCalloutPress={async() => {{navigation.navigate('Location', {hunt: Hunt, huntLocations: locationsData, locationIndex: index, requiredLocationIDS: requiredData.filter((value, index, self) => self.indexOf(value) === index)});setRequiredLocationIDS(requiredData.filter((value, index, self) => self.indexOf(value) === index));stopTracking();}}}
                />
            )));
        } else {
            return null;
        }
        };
    
    function removeDuplicates(arr, prop1, prop2) {
        return arr.filter(
            (obj, index, self) => 
                index === self.findIndex(o => o[prop1] === obj[prop1] && o[prop2] === obj[prop2])
    );
    }   

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

        })();}, []);

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

    useEffect(()=>{(async()=>{
        let formData = new FormData();
            formData.append("token", token[0]);
            formData.append("huntid", Hunt.huntid)
            const result = await fetch('https://cpsc345sh.jayshaffstall.com/getHuntLocations.php',{
                method: 'POST',
                body: formData
                })
            if (result.ok){
                const data = await result.json()
                if (data.status == "error"){
                    Alert.alert('Oops!', String(data.error), [
                        {text: 'OK'}]);
                    return;
                }
                else{
                setHuntLocations(data.locations);
                displayMarkers(data.locations, requiredLocationIDS);
                }
            }
            else{
                Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
                    {text: 'OK'}]);
            }
    })()}, [updateCheck, isFocused])

    useEffect(()=>{(async () => {
        let reqlocids = [];
        for (let i = 0; i < huntLocations.length; i++){
            let formData = new FormData();
            formData.append('token', token[0]);
            formData.append('locationid', huntLocations[i].locationid);
            const response = await fetch('https://cpsc345sh.jayshaffstall.com/getConditions.php', {
                method: 'POST',
                body: formData
            });
            if(response.ok){
                const data = await response.json();
                if (data.status == "error"){
                    Alert.alert('Oops!', String(data.error), [
                        {text: 'OK'}]);
                    return;
                }else{
                    if (data.conditions[0] != null){
                        reqlocids = reqlocids.concat(data.conditions.filter((element) => element.requiredlocationid != null).map((element) => {return{originalLocation: huntLocations[i].locationid, requiredlocationid: element.requiredlocationid};}));
                        setRequiredLocationIDS(reqlocids);  
                    }else{
                        setRequiredLocationIDS(reqlocids);
                        continue;
                    }
                }
            }else{
                Alert.alert('Oops! Something went wrong with "getConditions.php" from the API. Please try again, or come back another time.', String(response.status), [
                    {text: 'OK'}]);
            }
        } 
    })()
    }, [huntLocations]);


    useEffect(()=>{(async()=>{
        let formData = new FormData();
        formData.append("token", token[0]);
        const result = await fetch('https://cpsc345sh.jayshaffstall.com/getMyHunts.php',{
            method: 'POST',
            body: formData
        });
        if (result.ok){
            const data = await result.json()
            if (data.status == "error"){
                Alert.alert('Oops!', String(data.error), [
                    {text: 'OK'}]);
                return;
            }
            else{
                setHunt(data.hunts.find(obj => obj.huntid === Hunt.huntid));
                setNewName('');
                setNewLocation('');
            }
        }
        else{
            
            Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
                {text: 'OK'}]);
        }
    })()}, [updateCheck])

    

    const updateConfirmation = () =>
        Alert.alert('ARE YOU SURE?', 'You are changing this hunt\'s details.', [
            {text: 'Confirm', onPress:() => updateHunt()},
            {text: 'Cancel', style: 'cancel'}
    ]);
    const updateHunt = async () =>{
        let formData = new FormData();
        formData.append('token', token[0]);
        formData.append('huntid', Hunt.huntid);
        if (newName == ''){
            formData.append('name', Hunt.name);
        }
        else{
            formData.append('name', newName);
        }
        if (activeValue == ''){
            if (Hunt.active == true){
                formData.append('active', 1)
            }
            else{
                formData.append('active', 0)
            }
        }else{
            formData.append('active', activeValue)
        }
        
        const result = await fetch('https://cpsc345sh.jayshaffstall.com/updateHunt.php', {
            method: 'POST',
            body: formData
        });
        if(result.ok){
            const data = await result.json();
            if (data.status == "error"){
                Alert.alert('Oops!', String(data.error), [
                    {text: 'OK'}]);
                return;
            }
            else{
                SetUpdateCheck(!updateCheck);
            }   
        }
        else{
            Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
                {text: 'OK'}]);
            return;
        }
    }
    const deleteConfirmation = () =>
        Alert.alert('ARE YOU SURE?', 'If you delete this Hunt, it will not be recoverable.', [
            {text: 'Confirm', onPress:() => deleteHunt()},
            {text: 'Cancel', style: 'cancel'}
    ]);

    const deleteHunt = async () =>{
        let formData = new FormData();
        formData.append('token', token[0]);
        formData.append('huntid', Hunt.huntid);
        const result = await fetch('https://cpsc345sh.jayshaffstall.com/deleteHunt.php', {
            method: 'POST',
            body: formData
        });
        if(result.ok){
            const data = await result.json();
            if (data.status == "error"){
                Alert.alert('Oops!', String(data.error), [
                    {text: 'OK'}]);
                return;
            }
            else{
                navigation.navigate('Hunts');
            }   
        }
        else{
            Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
                {text: 'OK'}]);
            return;
        }
    }

    const addLocation = async () =>{
        if (locationGranted==false){
            Alert.alert('Location Not Granted.', "You will not be able to use the location features of this Scavenger Hunt App until you enable them in your settings and refresh the App.", [
                {text: 'OK'}
            ]);
            return;
        }
        let formData = new FormData();
        formData.append('token', token[0]);
        formData.append('huntid', Hunt.huntid);
        formData.append('name', newLocation);
        const result = await fetch('https://cpsc345sh.jayshaffstall.com/addHuntLocation.php', {
            method: 'POST',
            body: formData
        });
        if(result.ok){
            const data = await result.json()
            if (data.status == "error"){
                Alert.alert('Oops!', String(data.error), [
                    {text: 'OK'}]);
                return;
            }
            else{
                setLocationPosition(data.locationid)
            }   
        }
        else{
            Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
                {text: 'OK'}]);
            return;
        }
    }

    const setLocationPosition = async (value) =>{
        let formData = new FormData();
        formData.append('token', token[0]);
        formData.append('locationid', value);
        formData.append('latitude', userLocation.latitude);
        formData.append('longitude', userLocation.longitude);
        setRegion({
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05
        });
        
        const result = await fetch('https://cpsc345sh.jayshaffstall.com/updateHuntLocationPosition.php', {
            method: 'POST',
            body: formData
        });
        if(result.ok){
            const data = await result.json();
            if (data.status == "error"){
                Alert.alert('Oops!', String(data.error), [
                    {text: 'OK'}]);
                return;
            }
            else{
                SetUpdateCheck(!updateCheck);
            }   
        }
        else{
            Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
                {text: 'OK'}]);
            return;
        }
    }

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
              title="Logout"
            />
          ),
        });
    }, [navigation, dispatch]);
    
    return(
        <KeyboardAvoidingView behavior='position' style={styles.container} keyboardVerticalOffset={100}>
            <ScrollView>
            <View style={styles.container}>
            <Text style={{fontSize: 25, fontWeight: '400', textAlign:'center', marginBottom:10}}>
                Hunt: <Text style={{fontSize: 25, fontWeight: '200'}}>{Hunt.name}</Text>
            </Text>
            <Text style={{fontSize: 25, fontWeight: '400', textAlign:'center'}}>
                Your Hunt's Locations:
            </Text>
            <View style={{ width: 300, height: 250, alignSelf:'center', alignContent:'center', justifyContent: 'center', marginBottom:10}}>
            <MapView 
                style={{ height: '100%', width: '100%', alignSelf:'center'}}
                initialRegion={userLocation}
                >
            {displayMarkers(huntLocations, removeDuplicates(requiredLocationIDS, 'originalLocation', 'requiredlocationid'))}
            </MapView>
            </View>
            <Text style={{fontSize: 20, fontWeight: '200', textAlign:'center', marginBottom:10}}>
                Scroll down to add more locations, tap on markers to see more details. If you put 2+ locations on top of each other, the markers will overlap and the map will only let you select 2 at a time.
            </Text>
            <Text style={{fontSize: 25, fontWeight: '400', textAlign:'center',marginBottom:20}}>
                    Privacy: <Text style={{fontSize: 25, fontWeight: '200'}}>{Hunt.active == true?  "Active (Public)": "Not Active (Private)"}</Text>
            </Text>
            
            <AntDesign.Button backgroundColor='#FF0000' name='delete' onPress={deleteConfirmation}>Delete this Hunt?</AntDesign.Button>
            </View>
            <View style={styles.container}>
            <Text style={{fontSize:20, fontWeight:'600', marginTop: 20}}>Want to update this hunt's details?</Text>
            <Text style={{fontSize:20, fontWeight:'200', marginTop: 20, textAlign:'center', marginBottom:20}}>Enter a new name, or change the privacy of your hunt below, press the button when you're ready.</Text>
            <TextInput value={newName} onChangeText={text => setNewName(text)} style={{width: 300, height: 30, backgroundColor: '#D3D3D3', marginBottom:20}} placeholderTextColor='#000000' maxLength={255} textAlign='center' placeholder='Enter a new Hunt name:' />
            <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={dropdownData}
                maxHeight={200}
                labelField="label"
                valueField="value"
                placeholder="Choose Hunt Privacy"
                searchPlaceholder="Search..."
                value={activeValue}
                onChange={item => {
                    setActiveValue(item.value);
                }}
                renderLeftIcon={() => (
                    <AntDesign style={styles.icon} color="black" name="Safety" size={20} />
                )}
            />
            <View style={{marginTop:20}}>
                <AntDesign.Button onPress={updateConfirmation} disabled={newName == '' && activeValue == ''} backgroundColor={newName == '' && activeValue == ''?'grey':'#077AFF'}name='upload'>Update this Hunt</AntDesign.Button>
            
            </View>
            </View>
            <View style={styles.container}>
            <Text style={{fontSize:20, fontWeight:'600', textAlign:'center', marginBottom:20}}>
            Add new locations to this Hunt here:
            </Text>
            <Text style={{fontSize:20, fontWeight:'200', textAlign:'center', marginBottom:20}}>
                Enter the name for the location here (Defaults to your current Position.)
            </Text>
            <TextInput value={newLocation} onChangeText={text => setNewLocation(text)} style={{width: 300, height: 30, backgroundColor: '#D3D3D3', marginBottom:20}} placeholderTextColor='#000000' maxLength={255} textAlign='center' placeholder='Enter a Location name:' />
            <View style={{margin:20}}>
            <AntDesign.Button onPress={addLocation} disabled={newLocation == ''} backgroundColor={newLocation == ''?'grey':'#077AFF'} name='plussquareo'>Add the location</AntDesign.Button>
            
            </View>
            
            </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}