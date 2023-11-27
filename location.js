import { View, Text, TextInput, Button, Alert, KeyboardAvoidingView, TouchableOpacity, ScrollView } from "react-native"
import { useEffect, useState, useRef } from "react"
import { useDispatch, useSelector } from "react-redux";
import { styles } from "./styles.js";
import AntDesign from '@expo/vector-icons/AntDesign';
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import { removeToken } from "./slices.js";
import * as Location from 'expo-location'


export default function LocationPage({navigation, route}){
    const dispatch = useDispatch();
    const token = useSelector(state => state.token.tokens);
    
    const [Hunt, setHunt] = useState(route.params.hunt);
    const [huntLocation, setHuntLocation] = useState(route.params.location);
    const [locationGranted, setLocationGranted] = useState(false)

    const [newLatitude, setNewLatitude] = useState('');
    const [newLongitude, setNewLongitude] = useState('')

    const [newName, setNewName] = useState('');
    const [newClue, setNewClue] = useState('');
    const [newDescription, setNewDescription] = useState('');

    const [updateCheck, SetUpdateCheck] = useState(false);
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
            
            await Location.watchPositionAsync({
                accuracy: Location.Accuracy.Highest,
                distanceInterval: 3,
            }, watchLocation);
        })();}, []);
        
    const watchLocation = (location) => {
        
            setUserLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05
            });
        
    }
    
    useEffect(()=>{(async()=>{
        console.log('UseEffect2', region)
        let formData = new FormData();
            formData.append("token", token[0]);
            formData.append("huntid", Hunt.huntid)
            const result = await fetch('https://cpsc345sh.jayshaffstall.com/getHuntLocations.php',{
                method: 'POST',
                body: formData
                })
            if (result.ok){
                const data = await result.json()
                console.log("general data:", data.locations);
                console.log('Loc obj: ', huntLocation)
                if (!(data.locations[0].latitude == null && data.locations[0].longitude == null)){
                    console.log('hello2')
                    setRegion({
                        latitude: data.locations[0].latitude,
                        longitude: data.locations[0].longitude,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    })
                }
                
                setHuntLocation(data.locations[0]);
                setNewClue('');
                setNewDescription('');
                setNewName('');
                setNewLongitude('');
                setNewLatitude('');
            }
            else{
                console.log("Error fetching data, status code: " + result.status)
                Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
                    {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
            }
    })()}, [updateCheck])
    
    useEffect(() => {
        navigation.setOptions({
          title: 'Location Details',
          headerRight: () => (
            <Button
              onPress={() => {
                console.log('User Logged out!')
                dispatch(removeToken());
                console.log('values in token array:', token)
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

    const setLocationPosition = async () =>{
        console.log('Updating Location position...')
        let formData = new FormData();
        formData.append('token', token[0]);
        formData.append('locationid', huntLocation.locationid);
        if (locationGranted==false){
            Alert.alert('Location Not Granted.', "You will not be able to use the location features of this Scavenger Hunt App until you enable them in your settings and refresh the App.", [
                {text: 'OK'}
            ]);
            return;
        }
        if(newLongitude != '' && newLatitude != ''){
            formData.append('latitude', parseFloat(newLatitude));
            formData.append('longitude', parseFloat(newLongitude));
            setRegion({
                latitude: parseFloat(newLatitude),
                longitude: parseFloat(newLongitude),
                latitudeDelta: 0.05,
                longitudeDelta: 0.05
            })
            console.log("new region:", region)
        }else{
            // get users location
            // console.log("user.latitude/long:", userLocation.latitude, userLocation.longitude)

            formData.append('latitude', userLocation.latitude);
            formData.append('longitude', userLocation.longitude);
            setRegion({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05
            })
        }
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

    const updateConfirmation = () =>
        Alert.alert('ARE YOU SURE?', "You are changing this location's details.", [
            {text: 'Confirm', onPress:() => updateLocation()},
            {text: 'Cancel', onPress:()=>{console.log('Cancel Pressed')}, style: 'cancel'}
    ]);
    const updateLocation = async () =>{
        console.log('Updating Location...')
        let formData = new FormData();
        formData.append('token', token[0]);
        formData.append('locationid', huntLocation.locationid);
        if (newName == ''){
            formData.append('name', huntLocation.name)
        }else{
            formData.append('name', newName);
        }
        if(newDescription ==''){
            formData.append('description', huntLocation.description)
        }else{
            formData.append('description', newDescription)
        }
        if(newClue == ''){
            formData.append('clue', huntLocation.clue)
        }else{
            formData.append('clue', newClue)
        }
        const result = await fetch('https://cpsc345sh.jayshaffstall.com/updateHuntLocation.php', {
            method: 'POST',
            body: formData
        });
        if(result.ok){
            const data = await result.json()
            console.log('Status:', data.status)
            console.log('location Update data:', data);
            if (data.status == "error"){
                Alert.alert('Oops!', String(data.error), [
                    {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
                return;
            }
            else{
                console.log('success')
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
        Alert.alert('ARE YOU SURE?', 'If you delete this Location, it will not be recoverable.', [
            {text: 'Confirm', onPress:() => deleteLocation()},
            {text: 'Cancel', onPress:()=>{console.log('Cancel Pressed')}, style: 'cancel'}
    ]);

    const deleteLocation = async () =>{
        console.log('Deleting Location...')
        let formData = new FormData();
        formData.append('token', token[0]);
        formData.append('locationid', huntLocation.locationid);
        const result = await fetch('https://cpsc345sh.jayshaffstall.com/deleteHuntLocation.php', {
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
                navigation.navigate('Details', {hunt: Hunt})
            }   
        }
        else{
            console.log("Error fetching data, status code: " + result.status)
            Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
                {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
            return;
        }
    }

    
    return(
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'position' : 'position'} style={styles.container} >
            <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
                <Text style={{fontSize: 25, fontWeight: '300', textAlign:'center'}}>
                    Location Name: <Text style={{fontSize: 25, fontWeight: '200'}}>{huntLocation.name}{'\n'}</Text>Description: <Text style={{fontSize: 25, fontWeight: '200'}}>{huntLocation.description == ''? 'None' : huntLocation.description}{"\n"}</Text>Clue: <Text style={{fontSize: 25, fontWeight: '200'}}>{huntLocation.clue == ''? 'None' : huntLocation.clue}</Text>
                </Text>
                <AntDesign.Button name='delete' backgroundColor={'#FF0000'} onPress={deleteConfirmation}>Delete this Location?</AntDesign.Button>
                <MapView style={{width: '100%', height: '30%', marginBottom: 10, marginTop: 10}} 
                    initialRegion={userLocation}
                    region = {region}>
                        <Marker
                        key='currentLocation'
                        identifier={'currentlocation'}
                        onPress={()=>console.log(region)}
                        coordinate={region}
                        title='Location Position'
                        description="This is the Hunt's current Position."
                        />
                </MapView>
                {huntLocation.latitude == null && huntLocation.longitude == null ? 
                    <>
                    <TouchableOpacity onPress={setLocationPosition}>
                        <Text style={{fontSize: 25, fontWeight: '300', textAlign:'center'}}>
                            Press this text to set your current position as this hunt's position. (Can be changed later)
                        </Text>
                    </TouchableOpacity>
                    </>
                :
                    <>
                    <Text style={{fontSize: 25, fontWeight: '300', textAlign:'center'}}>
                        Update the coordinates of your Hunt's position Here:
                    </Text>
                       
                        <View style={{flexDirection:'row'}}>
                        <AntDesign.Button name='minussquareo' color='black' backgroundColor='white'
                        onPress={()=>{if(newLatitude.charAt(0) === '-'){
                                setNewLatitude(newLatitude.substring(1))
                            }else{
                                setNewLatitude('-' + newLatitude)
                            }
                        }}/>
                            <TextInput value={newLatitude} keyboardType='decimal-pad' onChangeText={text => setNewLatitude(text)} maxlength={255} style={{width: 250, height: 30, backgroundColor: '#D3D3D3', marginBottom: 5}} placeholderTextColor='#000000' textAlign='center' placeholder='Enter a new Latitude:'/>
                        </View>
                        <View style={{flexDirection:'row'}}>
                        <AntDesign.Button name='minussquareo' color='black' backgroundColor='white'
                        onPress={()=>{if(newLongitude.charAt(0) === '-'){
                            setNewLongitude(newLongitude.substring(1))
                            }else{
                                setNewLongitude('-' + newLongitude)
                            }
                        }}/>
                            <TextInput value={newLongitude} keyboardType='decimal-pad' onChangeText={text => setNewLongitude(text)} maxlength={255} style={{width: 250, height: 30, backgroundColor: '#D3D3D3', marginBottom: 5}} placeholderTextColor='#000000' textAlign='center' placeholder='Enter a new Longitude:'/>
                        </View>
                    <Button title='Update the position' onPress={setLocationPosition} disabled={((newLatitude != '')? !(parseFloat(newLatitude) >= -90 && parseFloat(newLatitude) <= 90) : newLatitude =='')|| ((newLongitude != '')?  !(parseFloat(newLongitude) >= -180 && parseFloat(newLongitude) <= 180) : newLongitude =='')}/>
                    </>
                }
                <Text style={{fontSize: 25, fontWeight: '300', textAlign:'center', marginTop: 20}}>
                    {huntLocation.description == '' & huntLocation.clue == ''? "Please enter a description and Clue for this Location" : "Update the location here:"}
                </Text>
                <TextInput value={newName} onChangeText={text => setNewName(text)} maxlength={255} style={{width: 300, height: 30, backgroundColor: '#D3D3D3', marginBottom: 5}} placeholderTextColor='#000000' maxLength={255} textAlign='center' placeholder='Enter a new location name (optional):'/>
                <TextInput value={newDescription} onChangeText={text => setNewDescription(text)} style={{width: 300, height: 30, backgroundColor: '#D3D3D3', marginBottom: 5}} placeholderTextColor='#000000' maxLength={255} textAlign='center' placeholder='Update the location description:'/>
                <TextInput value={newClue} onChangeText={text => setNewClue(text)} style={{width: 300, height: 30, backgroundColor: '#D3D3D3', marginBottom: 5}} placeholderTextColor='#000000' maxLength={255} textAlign='center' placeholder='Update the location clue:'/>
                <Button title='Update Location Information' onPress={updateConfirmation} disabled={newName == '' && newDescription == '' && newClue == '' || (newDescription == '' || newClue == '') && (huntLocation.description == '' && huntLocation.clue == '')}/>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}