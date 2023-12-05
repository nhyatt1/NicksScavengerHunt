import { Text, TextInput, Button, Alert, KeyboardAvoidingView } from "react-native"
import { useEffect, useState, useRef } from "react"
import { useDispatch, useSelector } from "react-redux";
import { styles } from "./styles.js";
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';
import { removeToken } from "./slices.js";
import { useIsFocused } from "@react-navigation/native";
import * as Location from 'expo-location'
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';

export default function HuntDetails({navigation, route}){
    const dropdownData = [
        { label: 'Not Active (Private)', value: '0' },
        { label: 'Active (Public)', value: '1' },
      ];
    const [activeValue, setActiveValue] = useState('');
    const dispatch = useDispatch();
    const token = useSelector(state => state.token.tokens);
    const [Hunt, setHunt] = useState(route.params.hunt);
    const [newName, setNewName] = useState('');
    const [huntLocations, setHuntLocations] = useState([]);
    const [huntConditions, setHuntConditions] = useState(null);
    const [newLocation, setNewLocation] = useState('')
    const [condplaceholder, setCondplaceholder] = useState('Loading...')
    const [updateCheck, SetUpdateCheck] = useState(false);
    // const [locationIsRequiredArr] = useState(route.params.locationIsRequired)
    const isFocused = useIsFocused();
    const [locationGranted, setLocationGranted] = useState(false)
    const [subscription, setSubscription] = useState(null)
    const [requiredLocationIDS, setRequiredLocationIDS] = useState([]);


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
        })
        const displayMarkers = (locationsData, requiredData) => {
            if (locationsData && locationsData.length > 0) {
                console.log('not null')
                console.log(locationsData.filter((location) => location.longitude !== null && location.latitude !== null))
              return(locationsData.map((position, index) => (
                  <Marker
                    key={index}
                    identifier={index}
                    coordinate={{longitude: position.longitude, latitude: position.latitude, }}
                    title={position.name}
                    description={position.description + " Tap me to edit!"}
                    onCalloutPress={async() => {{navigation.navigate('Location', {hunt: Hunt, huntLocations: locationsData, locationIndex: index, requiredLocationIDS: requiredData.filter((value, index, self) => self.indexOf(value) === index)}); setRequiredLocationIDS(requiredData.filter((value, index, self) => self.indexOf(value) === index));stopTracking(); console.log('Location callout Pressed:', index, locationsData, requiredLocationIDS)}}}
                  />
                )));
            } else {
                console.log('null')
              return null;
            }
          };
          function removeDuplicates(arr, prop1, prop2) {
            return arr.filter(
              (obj, index, self) =>
                index ===
                self.findIndex(
                  (o) => o[prop1] === obj[prop1] && o[prop2] === obj[prop2]
                )
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
        console.log('user loc:::::', location.coords.latitude, location.coords.longitude)
        setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05
        });
    }
    
}

    useEffect(()=>{(async()=>{
        console.log('updating locations array')
        let formData = new FormData();
            formData.append("token", token[0]);
            formData.append("huntid", Hunt.huntid)
            const result = await fetch('https://cpsc345sh.jayshaffstall.com/getHuntLocations.php',{
                method: 'POST',
                body: formData
                })
            if (result.ok){
                const data = await result.json()
                console.log("locations data:", data.locations);
                console.log('Loc arr: ', huntLocations)
                
                // console.log("typeoflocationreqid:", typeof route.params.locationIsRequired[0], route.params.locationIsRequired[0])
                // console.log("typeof data locid:", typeof data.locations[0].locationid, data.locations[0].locationid)
                // console.log(route.params.locationIsRequired.find(element => element == data.locations[0].locationid))
                // if(route.params.locationIsRequired.find(element => element == data.locations[0].locationid) != null){
                //     console.log('true')
                //     setLocationIsRequired(true);
                // }else{
                //     console.log('false')
                // }
                setHuntLocations(data.locations);
                displayMarkers(data.locations, requiredLocationIDS);
            }
            else{
                console.log("Error fetching data, status code: " + result.status)
                Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
                    {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
            }
    })()}, [updateCheck, isFocused])

    useEffect(()=>{(async () => {
        console.log('ISFOCUSED CONDITIONS huntlocations:', huntLocations)
        let reqlocids = [];
            console.log('Fetching Hunt conditions...')
            for (let i = 0; i < huntLocations.length; i++){
                let formData = new FormData();
                formData.append('token', token[0]);
                formData.append('locationid', huntLocations[i].locationid);
                const response = await fetch('https://cpsc345sh.jayshaffstall.com/getConditions.php', {
                    method: 'POST',
                    body: formData
                });
                if(response.ok){
                    const data = await response.json()
                    console.log('Status:', data.status)
                    console.log('conditions on details screen data:', data);
                    if (data.status == "error"){
                        Alert.alert('Oops!', String(data.error), [
                            {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
                        return;
                    }
                    else{
                        console.log('data.conditions after fetching conditions:' , data.conditions)
                        
                        if (data.conditions[0] == null){
                            console.log('no conditions')
                        }else{
                            setHuntConditions(data.conditions)
                            console.log('conditions exist for location:', huntLocations[i].name, "Your filter function does:", data.conditions.filter((element) => element.requiredlocationid != null).map((element) => {return{originalLocation: huntLocations[i].locationid, requiredlocationid: element.requiredlocationid};}))
                            reqlocids.concat(data.conditions.filter((element) => element.requiredlocationid != null).map((element) => {return{originalLocation: huntLocations[i].locationid, requiredlocationid: element.requiredlocationid};}));
                            setRequiredLocationIDS(reqlocids); 
                        }
                        
                    }
                }
                else{
                    console.log("Error fetching data, status code: " + response.status)
                    Alert.alert('Oops! Something went wrong with "getConditions.php" from the API. Please try again, or come back another time.', String(response.status), [
                        {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
                }

            }
            
    })()},[huntLocations]);

    // useEffect(()=>{(async () => {
    //     let templocations = {};
    //     console.log('Fetching Hunt Location... (useEffect1)')
    //     let formData = new FormData();
    //     formData.append('token', token[0]);
    //     formData.append('huntid', Hunt.huntid);
    //     const result = await fetch('https://cpsc345sh.jayshaffstall.com/getHuntLocations.php', {
    //         method: 'POST',
    //         body: formData
    //     });
    //     if(result.ok){
    //         const data = await result.json()
    //         console.log('Status:', data.status)
    //         console.log('data:', data);
    //         if (data.status == "error"){
    //             Alert.alert('Oops!', String(data.error), [
    //                 {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
    //             return;
    //         }
    //         else{
    //             console.log('data.locations:' , data.locations)
    //             setHuntLocation(data.locations[0]);
    //             templocations = data.locations[0];
    //             if(templocations == null){
    //             }
    //         }   
    //     }
    //     else{
    //         console.log("Error fetching data, status code: " + result.status)
    //         Alert.alert('Oops! Something went wrong with "getHuntLocations.php" API. Please try again, or come back another time.', String(result.status), [
    //             {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
            
    //     }
    //     console.log('Fetching Hunt conditions... (useEffect1)', templocations)
    //     let form = new FormData();
    //     if (templocations == null){
    //         setCondplaceholder("None, please update the location first!")
    //         return;
    //     }

    //     form.append('locationid', templocations.locationid);
    //     form.append('token', token[0])
    //     const response = await fetch('https://cpsc345sh.jayshaffstall.com/getConditions.php', {
    //         method: 'POST',
    //         body: form
    //     });
    //     if(response.ok){
    //         const data = await response.json()
    //         console.log('Status:', data.status)
    //         console.log('UE1 CONDITIONS data:', data);
    //         if (data.status == "error"){
    //             Alert.alert('Oops!', String(data.error), [
    //                 {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
    //             return;
    //         }
    //         else{
    //             console.log('data.conditions:' , data.conditions)
    //             setHuntConditions(data.conditions[0]);
    //             if(data.conditions[0]!= null){
    //                 console.log('conditions not null ')
    //                 if (data.conditions[0].requiredlocationid != null){ 
    //                     console.log('requiredlocationid not null:', data.conditions[0].requiredlocationid)
    //                     setRequiredlocationid(data.conditions[0].requiredlocationid)
    //                 }
    //             }      
    //             if(huntConditions == null){
    //                 setCondplaceholder("None, tap here to update conditions!");
    //             }
    //         }   
    //     }
    //     else{
    //         console.log("Error fetching data, status code: " + result.status)
    //         Alert.alert('Oops! Something went wrong with "getConditions.php" from the API. Please try again, or come back another time.', String(result.status), [
    //             {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
    //     }
    // })()

    // },[isFocused, updateCheck]);

    useEffect(()=>{(async()=>{
        console.log('UseEffect2')
        let formData = new FormData();
            formData.append("token", token[0]);

            const result = await fetch('https://cpsc345sh.jayshaffstall.com/getMyHunts.php',{
                method: 'POST',
                body: formData
                })
            if (result.ok){
                const data = await result.json()
                console.log("general data:", data);
                
                setHunt(data.hunts.find(obj => obj.huntid === Hunt.huntid));
                setNewName('');
                setNewLocation('');
            }
            else{
                console.log("Error fetching data, status code: " + result.status)
                Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
                    {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
            }
    })()}, [updateCheck])

    

    const updateConfirmation = () =>
        Alert.alert('ARE YOU SURE?', 'You are changing this hunt\'s details.', [
            {text: 'Confirm', onPress:() => updateHunt()},
            {text: 'Cancel', onPress:()=>{console.log('Cancel Pressed')}, style: 'cancel'}
    ]);
    const updateHunt = async () =>{
        console.log('Updating Hunt...')
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
            const data = await result.json()
            console.log('Status:', data.status)
            console.log('update data:', data);
            if (data.status == "error"){
                Alert.alert('Oops!', String(data.error), [
                    {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
                return;
            }
            else{
                SetUpdateCheck(!updateCheck);
            }   
        }
        else{
            console.log("Error fetching data, status code: " + result.status)
            Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
                {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
            return;
        }
    }
    const deleteConfirmation = () =>
        Alert.alert('ARE YOU SURE?', 'If you delete this Hunt, it will not be recoverable.', [
            {text: 'Confirm', onPress:() => deleteHunt()},
            {text: 'Cancel', onPress:()=>{console.log('Cancel Pressed')}, style: 'cancel'}
    ]);

    const deleteHunt = async () =>{
        console.log('Deleting Hunt...')
        let formData = new FormData();
        formData.append('token', token[0]);
        formData.append('huntid', Hunt.huntid);
        const result = await fetch('https://cpsc345sh.jayshaffstall.com/deleteHunt.php', {
            method: 'POST',
            body: formData
        });
        if(result.ok){
            const data = await result.json()
            console.log('Status:', data.status)
            console.log('delete data:', data);
            if (data.status == "error"){
                Alert.alert('Oops!', String(data.error), [
                    {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
                return;
            }
            else{
                navigation.navigate('Hunts');
            }   
        }
        else{
            console.log("Error fetching data, status code: " + result.status)
            Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
                {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
            return;
        }
    }

    const addLocation = async () =>{
        console.log('Adding Location...')
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
            console.log('Status:', data.status)
            console.log('add location data:', data);
            if (data.status == "error"){
                Alert.alert('Oops!', String(data.error), [
                    {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
                return;
            }
            else{
                setLocationPosition(data.locationid)
            }   
        }
        else{
            console.log("Error fetching data, status code: " + result.status)
            Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
                {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
            return;
        }
    }

    const setLocationPosition = async (value) =>{
        console.log('Updating Location position...')
        let formData = new FormData();
        formData.append('token', token[0]);
        formData.append('locationid', value);
        
            // get users location
            // console.log("user.latitude/long:", userLocation.latitude, userLocation.longitude)
            console.log("long, lat when first setting pos:",userLocation.longitude, userLocation.latitude)
            formData.append('latitude', userLocation.latitude);
            formData.append('longitude', userLocation.longitude);
            setRegion({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05
            })
        
        const result = await fetch('https://cpsc345sh.jayshaffstall.com/updateHuntLocationPosition.php', {
            method: 'POST',
            body: formData
        });
        if(result.ok){
            const data = await result.json()
            console.log('Status:', data.status)
            console.log('location position update data:', data);
            if (data.status == "error"){
                Alert.alert('Oops!', String(data.error), [
                    {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
                return;
            }
            else{
                console.log('success');
                SetUpdateCheck(!updateCheck);
            }   
        }
        else{
            console.log("Error fetching data, status code: " + result.status)
            Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
                {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
            return;
        }
    }

    useEffect(() => {
        navigation.setOptions({
          title: 'Details',
          headerRight: () => (
            <Button
              onPress={() => {
                console.log('User Logged out!')
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
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container} keyboardVerticalOffset={150}>
            <Text style={{fontSize: 25, fontWeight: '400', textAlign:'center'}}>
                Hunt: <Text style={{fontSize: 25, fontWeight: '200'}}>{Hunt.name}</Text>
            </Text>
            <MapView 
                style={{ height: '40%', width: '80%' }}
                initialRegion={userLocation}
                >
            {displayMarkers(huntLocations, removeDuplicates(requiredLocationIDS, 'originalLocation', 'requiredlocationid'))}
            </MapView>
            <Text style={{fontSize: 25, fontWeight: '400', textAlign:'center'}}>
                    Privacy: <Text style={{fontSize: 25, fontWeight: '200'}}>{Hunt.active == true?  "Active (Public)": "Not Active (Private)"}</Text>
            </Text>
            
            <AntDesign.Button backgroundColor='#FF0000' name='delete' onPress={deleteConfirmation}>Delete this Hunt?</AntDesign.Button>
            <Text style={{fontSize:20, fontWeight:'300', marginTop: 20}}>Want to update this hunt's details?</Text>
            <TextInput value={newName} onChangeText={text => setNewName(text)} style={{width: 300, height: 30, backgroundColor: '#D3D3D3'}} placeholderTextColor='#000000' maxLength={255} textAlign='center' placeholder='Enter a new Hunt name:' />
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
            <Button title="Update this Hunt" onPress={updateConfirmation} disabled={newName == '' && activeValue == ''}/>
            <Text style={{fontSize:20, fontWeight:'300'}}>
            Add new locations to this Hunt here (Defaults to your current Position):
            </Text>
            <TextInput value={newLocation} onChangeText={text => setNewLocation(text)} style={{width: 300, height: 30, backgroundColor: '#D3D3D3'}} placeholderTextColor='#000000' maxLength={255} textAlign='center' placeholder='Enter a Location name:' />
            <Button title="Add the location" onPress={addLocation} disabled={newLocation == ''}/>
        </KeyboardAvoidingView>
    )
}