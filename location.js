import { View, Text, TextInput, Button, Alert, KeyboardAvoidingView, TouchableOpacity } from "react-native"
import { useEffect, useState, useRef } from "react"
import { useDispatch, useSelector } from "react-redux";
import { styles } from "./styles.js";
import AntDesign from '@expo/vector-icons/AntDesign';
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import { removeToken } from "./slices.js";


export default function LocationPage({navigation, route}){
    const dispatch = useDispatch();
    const token = useSelector(state => state.token.tokens);
    
    const [Hunt, setHunt] = useState(route.params.hunt);
    const [huntLocations, setHuntLocations] = useState(route.params.huntLocations);
    const [locationIndex] = useState(route.params.locationIndex);
    
    const [requiredLocationIDS, setRequiredLocationIDS] = useState(route.params.requiredLocationIDS);
    const [locationIsRequired, setLocationIsRequired] = useState(false);
    const [parentLocationIDS, setParentLocationIDS] = useState([]);

    const [newLatitude, setNewLatitude] = useState('');
    const [newLongitude, setNewLongitude] = useState('')

    const [newLocation, setNewLocation] = useState('')

    const [newName, setNewName] = useState('');
    const [newClue, setNewClue] = useState('');
    const [newDescription, setNewDescription] = useState('');

    const [updateCheck, SetUpdateCheck] = useState(false);
    // const regionRef = useRef();
    // regionRef.current = region;
    const [region, setRegion] = useState({
            latitude: route.params.huntLocations[route.params.locationIndex].latitude,
            longitude: route.params.huntLocations[route.params.locationIndex].longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05})


    useEffect(()=>{(async()=>{
        console.log('updating locations array locations screen', requiredLocationIDS)
        let tempParents = []
        for (let i = 0; i < requiredLocationIDS.length; i++){
            console.log('element loop after updating locations array:',requiredLocationIDS, requiredLocationIDS[i].requiredlocationid, huntLocations[locationIndex].locationid)
            if (parseInt(requiredLocationIDS[i].requiredlocationid) == parseInt(huntLocations[locationIndex].locationid)){
                console.log('this location is required')
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
                })
            if (result.ok){
                const data = await result.json()
                console.log("locations to be:", data.locations);
                console.log('previous locations: ', huntLocations)
                
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
        formData.append('locationid', huntLocations[locationIndex].locationid);
        
            formData.append('latitude', parseFloat(newLatitude));
            formData.append('longitude', parseFloat(newLongitude));
            setRegion({
                latitude: parseFloat(newLatitude),
                longitude: parseFloat(newLongitude),
                latitudeDelta: 0.05,
                longitudeDelta: 0.05
            })
            console.log("new region:", region)
        
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
                setNewLatitude('')
                setNewLongitude('')
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
        // need 2 add the index.

        console.log('Updating Location...')
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
            const data = await result.json()
            console.log('Status:', data.status)
            console.log('location Update data:', data);
            if (data.status == "error"){
                Alert.alert('Oops!', String(data.error), [
                    {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
                return;
            }
            else{
                console.log('update success')
                // do something to refresh page (set view 0 maybe?)
                SetUpdateCheck(!updateCheck);
                setNewName('');
                setNewClue('');
                setNewDescription('')
            }   
        }
        else{
            console.log("Error fetching data, status code: " + result.status)
            Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
                {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
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
                {text: 'Cancel', onPress:()=>{console.log('Cancel Pressed')}, style: 'cancel'}])
        }
    };

    const deleteLocation = async () =>{
        if (parseInt(huntLocations[locationIndex].locationid) == parseInt(requiredLocationIDS.requiredlocationid)){
            
        }
        console.log('Deleting Location...')
        let formData = new FormData();
        formData.append('token', token[0]);
        //need index.
        formData.append('locationid', huntLocations[locationIndex].locationid);

        //Need to edit this:
        // {This will return an error if there is another location that
        //     has a condition depending on this location. The other location's condition must be deleted first
        //     to avoid breaking the overall hunt.}
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
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container} keyboardVerticalOffset={150}>
            <MapView 
                style={{ height: '25%', width: '50%'}}
                initialRegion={region}
                maxZoomLevel={14}
                minZoomLevel={14}
                zoomEnabled={false}
                rotateEnabled={false}
                scrollEnabled={false}
                region={region}
                >
                <Marker
                key={locationIndex}
                coordinate={region}
                />
            </MapView>
                <Text style={{fontSize: 20, fontWeight: '400', textAlign:'center'}}>
                    Location Name: <Text style={{fontSize: 20, fontWeight: '200'}}>{huntLocations[locationIndex].name}{'\n'}</Text>Description: <Text style={{fontSize: 20, fontWeight: '200'}}>{huntLocations[locationIndex].description == ''? 'None' : huntLocations[locationIndex].description}{"\n"}</Text>Clue: <Text style={{fontSize: 20, fontWeight: '200'}}>{huntLocations[locationIndex].clue == ''? 'None' : huntLocations[locationIndex].clue}</Text>
                </Text>
                <TouchableOpacity
                        onPress={ () => {{navigation.navigate('Conditions', {hunt: Hunt, location: huntLocations[locationIndex], huntLocations: huntLocations, parentLocationIDS: parentLocationIDS.filter((value, index, self) => self.indexOf(value) === index)}); setParentLocationIDS(parentLocationIDS.filter((value, index, self) => self.indexOf(value) === index));console.log('condit presed', parentLocationIDS)}}}> 
                <Text style={{fontSize: 20, fontWeight: '400', textAlign:'center'}}>
                    Conditions: <Text style={{fontSize: 20, fontWeight: '200'}}>Tap here to see the conditions of this location.</Text>
                </Text>
            </TouchableOpacity>
                <AntDesign.Button name='delete' backgroundColor={'#FF0000'} onPress={deleteConfirmation}>Delete this Location?</AntDesign.Button>
                        
                    <Text style={{fontSize: 20, fontWeight: '400', textAlign:'center'}}>
                        Update the coordinates of your Hunt's position Here (cannot be 0, 0):
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
                    <Button title='Update the position' onPress={setLocationPosition} disabled={((newLatitude != '')? !(parseFloat(newLatitude) >= -90 && parseFloat(newLatitude) <= 90) : newLatitude =='')|| ((newLongitude != '')?  !(parseFloat(newLongitude) >= -180 && parseFloat(newLongitude) <= 180) : newLongitude =='')||(newLatitude == parseFloat(0) && newLongitude == parseFloat(0))}/>

                <Text style={{fontSize: 20, fontWeight: '400', textAlign:'center', marginTop: 10}}>
                    {huntLocations[locationIndex].description == '' & huntLocations[locationIndex].clue == ''? "Please enter a description and Clue for this Location" : "Update the location here:"}
                </Text>
                <TextInput value={newName} onChangeText={text => setNewName(text)} maxlength={255} style={{width: 300, height: 30, backgroundColor: '#D3D3D3', marginBottom: 5}} placeholderTextColor='#000000' maxLength={255} textAlign='center' placeholder='Enter a new location name (optional):'/>
                <TextInput value={newDescription} onChangeText={text => setNewDescription(text)} style={{width: 300, height: 30, backgroundColor: '#D3D3D3', marginBottom: 5}} placeholderTextColor='#000000' maxLength={255} textAlign='center' placeholder='Update the location description:'/>
                <TextInput value={newClue} onChangeText={text => setNewClue(text)} style={{width: 300, height: 30, backgroundColor: '#D3D3D3', marginBottom: 5}} placeholderTextColor='#000000' maxLength={255} textAlign='center' placeholder='Update the location clue:'/>
                <Button title='Update Location Information' onPress={updateConfirmation} disabled={newName == '' && newDescription == '' && newClue == '' || (newDescription == '' || newClue == '') && (huntLocations[locationIndex].description == '' && huntLocations[locationIndex].clue == '')}/>
            
            

            {/** need index for when this screen is switched to Above here is screen 0 (view == 0) below is anything needed for view == 1*/}
            </KeyboardAvoidingView>
            
        
    )}
    // old stuff: