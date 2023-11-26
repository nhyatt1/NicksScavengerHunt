import { View, Text, TextInput, Button, Alert, KeyboardAvoidingView } from "react-native"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { styles } from "./styles.js";

export default function HuntDetails({navigation, route}){
    const dispatch = useDispatch();
    const token = useSelector(state => state.token.tokens);
    const Hunt = route.params.hunt;
    const [newName, setNewName] = useState('');


    const updateConfirmation = () =>
        Alert.alert('ARE YOU SURE?', 'The name of this hunt will be changed for everyone.', [
            {text: 'Confirm', onPress:() => updateHunt()},
            {text: 'Cancel', onPress:()=>{console.log('Cancel Pressed')}, style: 'cancel'}
    ]);
    const updateHunt = async () =>{
        console.log('Updating Hunt...')
        let formData = new FormData();
        formData.append('token', token[0]);
        formData.append('huntid', Hunt.huntid);
        formData.append('name', newName)
        const result = await fetch('https://cpsc345sh.jayshaffstall.com/updateHunt.php', {
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
            console.log('data:', data);
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

    useEffect(() => {
        navigation.setOptions({
          title: 'Details',
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
    
    return(
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <Text style={{fontSize: 20, fontWeight: '400', textAlign:'center', marginBottom: 20}}>
                Hunt Name: <Text style={{fontSize: 20, fontWeight: '200'}}>{Hunt.name}{"\n"}</Text>Hunt ID: <Text style={{fontSize: 20, fontWeight: '200'}}>{Hunt.huntid}</Text>
            </Text>
            <Button title="Delete this Hunt" onPress={deleteConfirmation}/>
            <Text style={{fontSize:20, fontWeight:'400', marginBottom: 20}}>Want to update this Hunt?</Text>
            <TextInput onChangeText={text => setNewName(text)} style={{width: 300, height: 30, backgroundColor: '#D3D3D3', marginBottom: 20}} placeholderTextColor='#000000' maxLength={255} textAlign='center' placeholder='Enter a new name:' />
            <Button title="Update this Hunt" onPress={updateConfirmation} disabled={newName == ''}/>
        </KeyboardAvoidingView>
        
    )
}