import { View, Text, TextInput, Button, Alert, KeyboardAvoidingView, TouchableOpacity, ScrollView } from "react-native";

import { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';

import AntDesign from '@expo/vector-icons/AntDesign';
import { styles } from "./styles.js";
import { removeToken } from "./slices.js";

export default function LocationPage({navigation, route}){
    const dispatch = useDispatch();
    const token = useSelector(state => state.token.tokens);
    
    const [Hunt] = useState(route.params.hunt);
    const [huntLocations, setHuntLocations] = useState(route.params.huntLocations);
    const [locationIndex] = useState(route.params.locationIndex);
    
    const [requiredLocationIDS] = useState(route.params.requiredLocationIDS);
    const [locationIsRequired, setLocationIsRequired] = useState(false);
    const [parentLocationIDS, setParentLocationIDS] = useState([]);

    const [newLatitude, setNewLatitude] = useState('');
    const [newLongitude, setNewLongitude] = useState('')

    const [newName, setNewName] = useState('');
    const [newClue, setNewClue] = useState('');
    const [newDescription, setNewDescription] = useState('');

    const [updateCheck, SetUpdateCheck] = useState(false);

    const [region, setRegion] = useState({
        latitude: route.params.huntLocations[route.params.locationIndex].latitude,
        longitude: route.params.huntLocations[route.params.locationIndex].longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05
    });

    useEffect(()=>{(async()=>{
        let tempParents = []
        for (let i = 0; i < requiredLocationIDS.length; i++){
            if (parseInt(requiredLocationIDS[i].requiredlocationid) == parseInt(huntLocations[locationIndex].locationid)){
                setLocationIsRequired(true);
                tempParents.push(requiredLocationIDS[i].originalLocation);
                setParentLocationIDS(tempParents);
            }
        }
        let formData = new FormData();
            formData.append("token", token[0]);
            formData.append("huntid", Hunt.huntid)
            const result = await fetch('https://cpsc345sh.jayshaffstall.com/getHuntLocations.php',{
                method: 'POST',
                body: formData
            });
            if (result.ok){
                const data = await result.json();
                if (data.status == "error"){
                    Alert.alert('Oops!', String(data.error), [
                        {text: 'OK'}]);
                    return;
                }
                else{
                    setHuntLocations(data.locations);
                }
            }
            else{
                Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
                    {text: 'OK'}]);
            }
    })()}, [updateCheck])
    
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

    const setLocationPosition = async () =>{
        let formData = new FormData();
        formData.append('token', token[0]);
        formData.append('locationid', huntLocations[locationIndex].locationid);
        
            formData.append('latitude', parseFloat(newLatitude));
            formData.append('longitude', parseFloat(newLongitude));
            setRegion({
                latitude: parseFloat(newLatitude),
                longitude: parseFloat(newLongitude),
                latitudeDelta: 0.05,
                longitudeDelta: 0.05
            })
        
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
                setNewLatitude('')
                setNewLongitude('')
            }   
        }
        else{
            Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
                {text: 'OK'}]);
            return;
        }
    }

    const updateConfirmation = () =>
        Alert.alert('ARE YOU SURE?', "You are changing this location's details.", [
            {text: 'Confirm', onPress:() => updateLocation()},
            {text: 'Cancel', style: 'cancel'}
    ]);
    const updateLocation = async () =>{
        let formData = new FormData();
        formData.append('token', token[0]);
        formData.append('locationid', huntLocations[locationIndex].locationid);
        if (newName == ''){
            formData.append('name', huntLocations[locationIndex].name)
        }else{
            formData.append('name', newName);
        }
        if(newDescription ==''){
            formData.append('description', huntLocations[locationIndex].description)
        }else{
            formData.append('description', newDescription)
        }
        if(newClue == ''){
            formData.append('clue', huntLocations[locationIndex].clue)
        }else{
            formData.append('clue', newClue)
        }
        const result = await fetch('https://cpsc345sh.jayshaffstall.com/updateHuntLocation.php', {
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
                setNewName('');
                setNewClue('');
                setNewDescription('')
            }   
        }
        else{
            Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
                {text: 'OK'}]);
            return;
        }
    }
    const deleteConfirmation = () =>{
        if (locationIsRequired == true){
            Alert.alert('UH OH!', 'This location is a condition of a separate location with ID: '+ parentLocationIDS[0] + ' and Name: ' + (huntLocations.find(element => element.locationid == parentLocationIDS[0])).name + '. Please delete this condition first!', [
                {text: 'OK'}])
        }else{
            Alert.alert('ARE YOU SURE?', 'If you delete this Location, it will not be recoverable.', [
                {text: 'Confirm', onPress:() => deleteLocation()},
                {text: 'Cancel', style: 'cancel'}])
        }
    };

    const deleteLocation = async () =>{
        if (parseInt(huntLocations[locationIndex].locationid) == parseInt(requiredLocationIDS.requiredlocationid)){
            
        }
        let formData = new FormData();
        formData.append('token', token[0]);
        formData.append('locationid', huntLocations[locationIndex].locationid);

        const result = await fetch('https://cpsc345sh.jayshaffstall.com/deleteHuntLocation.php', {
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
                navigation.navigate('Details', {hunt: Hunt})
            }   
        }
        else{
            Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
                {text: 'OK'}]);
            return;
        }
    }
    
    return(
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container} keyboardVerticalOffset={150}>
            <ScrollView>
            <View style={{ width: 250, height: 200, alignSelf:'center', alignContent:'center', justifyContent: 'center', marginTop: 10}}>
            <MapView 
                style={{ height: '100%', width: '100%', alignSelf:'center'}}
                initialRegion={region}
                maxZoomLevel={14}
                minZoomLevel={14}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
                scrollEnabled={false}
                region={region}
                >
                <Marker
                key={locationIndex}
                coordinate={region}
                />
            </MapView>
            </View>
            <View style={styles.container}>
            <Text style={{fontSize: 25, fontWeight: '400', textAlign:'center'}}>
                Location Name: <Text style={{fontSize: 25, fontWeight: '200'}}>{huntLocations[locationIndex].name}{'\n'}</Text>Description: <Text style={{fontSize: 25, fontWeight: '200'}}>{huntLocations[locationIndex].description == ''? 'None' : huntLocations[locationIndex].description}{"\n"}</Text>Clue: <Text style={{fontSize: 25, fontWeight: '200'}}>{huntLocations[locationIndex].clue == ''? 'None' : huntLocations[locationIndex].clue}</Text>
            </Text>
            <TouchableOpacity
                        onPress={ () => {{navigation.navigate('Conditions', {hunt: Hunt, location: huntLocations[locationIndex], huntLocations: huntLocations, parentLocationIDS: parentLocationIDS.filter((value, index, self) => self.indexOf(value) === index)}); setParentLocationIDS(parentLocationIDS.filter((value, index, self) => self.indexOf(value) === index)); setNewClue(''); setNewDescription(''); setNewName(''); setNewLongitude(''); setNewLatitude('');}}}> 
                <Text style={{fontSize: 25, fontWeight: '600', textAlign:'center',marginTop:30, marginBottom:30}}>
                    Tap here to see the conditions of this location.
                </Text>
            </TouchableOpacity>
            <AntDesign.Button name='delete' backgroundColor={'#FF0000'} onPress={deleteConfirmation}>Delete this Location?</AntDesign.Button>
            </View>

            <View style={styles.container}>
            <Text style={{fontSize: 25, fontWeight: '600', textAlign:'center', marginBottom:20}}>
                        Update the coordinates of your Hunt's position here:
            </Text>
            <Text style={{fontSize: 25, fontWeight: '200', textAlign:'center', marginBottom:20}}>(New location cannot be 0, 0; you will not see the marker on the map)</Text>
            
                       
                        <View style={{flexDirection:'row'}}>
                        <AntDesign.Button name='minussquareo' color='black' backgroundColor='white'
                        onPress={()=>{if(newLatitude.charAt(0) === '-'){
                                setNewLatitude(newLatitude.substring(1))
                            }else{
                                setNewLatitude('-' + newLatitude)
                            }
                        }}/>
                            <TextInput value={newLatitude} keyboardType='decimal-pad' onChangeText={text => setNewLatitude(text)} maxlength={255} style={{width: 250, height: 30, backgroundColor: '#D3D3D3', marginBottom: 10}} placeholderTextColor='#000000' textAlign='center' placeholder='Enter a new Latitude:'/>
                        </View>
                        <View style={{flexDirection:'row'}}>
                        <AntDesign.Button name='minussquareo' color='black' backgroundColor='white'
                        onPress={()=>{if(newLongitude.charAt(0) === '-'){
                            setNewLongitude(newLongitude.substring(1))
                            }else{
                                setNewLongitude('-' + newLongitude)
                            }
                        }}/>
                            <TextInput value={newLongitude} keyboardType='decimal-pad' onChangeText={text => setNewLongitude(text)} maxlength={255} style={{width: 250, height: 30, backgroundColor: '#D3D3D3', marginBottom: 20}} placeholderTextColor='#000000' textAlign='center' placeholder='Enter a new Longitude:'/>
                        </View>
                    <AntDesign.Button name='upload' onPress={setLocationPosition} disabled={((newLatitude != '')? !(parseFloat(newLatitude) >= -90 && parseFloat(newLatitude) <= 90) : newLatitude =='')|| ((newLongitude != '')?  !(parseFloat(newLongitude) >= -180 && parseFloat(newLongitude) <= 180) : newLongitude =='')||(newLatitude == parseFloat(0) && newLongitude == parseFloat(0))} backgroundColor={(((newLatitude != '')? !(parseFloat(newLatitude) >= -90 && parseFloat(newLatitude) <= 90) : newLatitude =='')|| ((newLongitude != '')?  !(parseFloat(newLongitude) >= -180 && parseFloat(newLongitude) <= 180) : newLongitude =='')||(newLatitude == parseFloat(0) && newLongitude == parseFloat(0)))? 'grey':'#077AFF'}>Update the position</AntDesign.Button>
                </View>
            <View style={styles.container}>
                <Text style={{fontSize: 25, fontWeight: '600', textAlign:'center', marginTop: 20, marginBottom:20}}>
                    {huntLocations[locationIndex].description == '' & huntLocations[locationIndex].clue == ''? "Please enter a description and Clue for this Location" : "Update the location here:"}
                </Text>
                <TextInput value={newName} onChangeText={text => setNewName(text)} maxlength={255} style={{width: 300, height: 30, backgroundColor: '#D3D3D3', marginBottom: 10}} placeholderTextColor='#000000' maxLength={255} textAlign='center' placeholder='Enter a new location name (optional):'/>
                <TextInput value={newDescription} onChangeText={text => setNewDescription(text)} maxlength={255} style={{width: 300, height: 30, backgroundColor: '#D3D3D3', marginBottom: 10}} placeholderTextColor='#000000' maxLength={255} textAlign='center' placeholder='Update the location description:'/>
                <TextInput value={newClue} onChangeText={text => setNewClue(text)} maxlength={255} style={{width: 300, height: 30, backgroundColor: '#D3D3D3', marginBottom: 20}} placeholderTextColor='#000000' maxLength={255} textAlign='center' placeholder='Update the location clue:'/>
                <AntDesign.Button name='upload' onPress={updateConfirmation} disabled={(newName == '' && newDescription == '' && newClue == '' || (newDescription == '' || newClue == '') && (huntLocations[locationIndex].description == '' && huntLocations[locationIndex].clue == ''))} backgroundColor={(newName == '' && newDescription == '' && newClue == '' || (newDescription == '' || newClue == '') && (huntLocations[locationIndex].description == '' && huntLocations[locationIndex].clue == ''))? 'grey':'#077AFF'}>Update Location Information</AntDesign.Button>
            </View>
        </ScrollView>
        </KeyboardAvoidingView>
    )}
