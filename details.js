import { View, Text, TextInput, Button, Alert, KeyboardAvoidingView, TouchableOpacity } from "react-native"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { styles } from "./styles.js";
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';
import { removeToken } from "./slices.js";
import { useIsFocused } from "@react-navigation/native";

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
    const [huntLocation, setHuntLocation] = useState();
    const [huntConditions, setHuntConditions] = useState(null);
    const [newLocation, setNewLocation] = useState('')
    const [locplaceholder, setLocplaceholder] = useState('Loading...')
    const [condplaceholder, setCondplaceholder] = useState('Loading...')
    const [updateCheck, SetUpdateCheck] = useState(false);
    const isFocused = useIsFocused();

    useEffect(()=>{(async () => {
        let templocations = {};
        console.log('Fetching Hunt Location... (useEffect1)')
        let formData = new FormData();
        formData.append('token', token[0]);
        formData.append('huntid', Hunt.huntid);
        const result = await fetch('https://cpsc345sh.jayshaffstall.com/getHuntLocations.php', {
            method: 'POST',
            body: formData
        });
        if(result.ok){
            const data = await result.json()
            console.log('Status:', data.status)
            console.log('data:', data);
            if (data.status == "error"){
                Alert.alert('Oops!', String(data.error), [
                    {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
                return;
            }
            else{
                console.log('data.locations:' , data.locations)
                setHuntLocation(data.locations[0]);
                templocations = data.locations[0];
                if(huntLocation == null){
                    setLocplaceholder("None, add a location below!");
                }
            }   
        }
        else{
            console.log("Error fetching data, status code: " + result.status)
            Alert.alert('Oops! Something went wrong with "getHuntLocations.php" API. Please try again, or come back another time.', String(result.status), [
                {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
            
        }
        console.log('Fetching Hunt conditions... (useEffect1)', templocations)
        let form = new FormData();
        if (templocations == null){
            setCondplaceholder("None, please update the location first!")
            return;
        }
        form.append('locationid', templocations.locationid);
        form.append('token', token[0])
        const response = await fetch('https://cpsc345sh.jayshaffstall.com/getConditions.php', {
            method: 'POST',
            body: form
        });
        if(response.ok){
            const data = await response.json()
            console.log('Status:', data.status)
            console.log('data:', data);
            if (data.status == "error"){
                Alert.alert('Oops!', String(data.error), [
                    {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
                return;
            }
            else{
                console.log('data.conditions:' , data.conditions)
                setHuntConditions(data.conditions[0]);
                if(huntConditions == null){
                    setCondplaceholder("None, tap here to update conditions!");
                }
            }   
        }
        else{
            console.log("Error fetching data, status code: " + result.status)
            Alert.alert('Oops! Something went wrong with "getConditions.php" from the API. Please try again, or come back another time.', String(result.status), [
                {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
            
        }
    })()

    },[isFocused, updateCheck]);

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
            formData.append('name', Hunt.name)
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
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Hunts' }],
                  })
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
        console.log('Updating Hunt...')
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
        <KeyboardAvoidingView behavior='position' style={styles.container} contentContainerStyle={{ alignItems: 'center' }}>
            <Text style={{fontSize: 25, fontWeight: '400', textAlign:'center'}}>
                Name: <Text style={{fontSize: 25, fontWeight: '200'}}>{Hunt.name}</Text>
            </Text>
            <TouchableOpacity
                        disabled={huntLocation == null} onPress={ () => {{navigation.navigate('Location', {hunt: Hunt, location: huntLocation}); console.log('Location Pressed')}} }> 
                <Text style={{fontSize: 25, fontWeight: '400', textAlign:'center'}}>
                    Location: <Text style={{fontSize: 25, fontWeight: '200'}}>{huntLocation == null?  locplaceholder: huntLocation.name + ". Tap to see more details"}</Text>
                </Text>
            </TouchableOpacity>
            <Text style={{fontSize: 25, fontWeight: '400', textAlign:'center'}}>
                    Privacy: <Text style={{fontSize: 25, fontWeight: '200'}}>{Hunt.active == true?  "Active (Public)": "Not Active (Private)"}</Text>
            </Text>
            <TouchableOpacity
                        disabled={condplaceholder == 'Loading...'} onPress={ () => {{navigation.navigate('Conditions', {hunt: Hunt, location: huntLocation, conditions: huntConditions}); console.log('Conditions Pressed')}} }> 
                <Text style={{fontSize: 25, fontWeight: '400', textAlign:'center'}}>
                    Conditions: <Text style={{fontSize: 25, fontWeight: '200'}}>{huntConditions == null?  condplaceholder: huntConditions.starttime == null && huntConditions.endtime == null? "Required Location": "Period of Visibility"}</Text>
                </Text>
            </TouchableOpacity>
            <AntDesign.Button backgroundColor='#FF0000' name='delete' onPress={deleteConfirmation}>Delete this Hunt?</AntDesign.Button>
            <Text style={{fontSize:20, fontWeight:'300', marginTop: 20}}>Want to update this hunt's details?</Text>
            <TextInput value={newName} onChangeText={text => setNewName(text)} style={{width: 300, height: 30, backgroundColor: '#D3D3D3', marginBottom: 20}} placeholderTextColor='#000000' maxLength={255} textAlign='center' placeholder='Enter a new Hunt name:' />
            <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={dropdownData}
                search
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
            {huntLocation == null?
            <>
            <Text style={{fontSize:20, fontWeight:'300', marginTop:20}}>Want to add a location?</Text>
            <TextInput value={newLocation} onChangeText={text => setNewLocation(text)} style={{width: 300, height: 30, backgroundColor: '#D3D3D3', marginBottom: 10}} placeholderTextColor='#000000' maxLength={255} textAlign='center' placeholder='Enter a new Location name:' />
            <Button title="Add the location" onPress={addLocation} disabled={newLocation == ''}/>
            </>
            :
            <></>
            }
        </KeyboardAvoidingView>
    )
}