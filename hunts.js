import { useEffect, useState} from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, Alert, TextInput, KeyboardAvoidingView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { removeToken } from './slices.js';
import { styles } from './styles.js';

export default function HuntsPage({navigation}){
    const dispatch = useDispatch();
    const token = useSelector((state) => state.token.tokens)
    const [newHunt, setNewHunt] = useState('')
    const [myHunts, setMyHunts] = useState([])
    const [buttonPressed, setButtonPressed] = useState(false);

    useEffect(() => {
        navigation.setOptions({
          title: 'Hunts',
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

      useEffect(() => {
        (async () => {
            let formData = new FormData();
            formData.append("token", token[0]);

            const result = await fetch('https://cpsc345sh.jayshaffstall.com/getMyHunts.php',{
                method: 'POST',
                body: formData
                })
            if (result.ok){
                const data = await result.json()
                console.log("general data:", data);
                setMyHunts(data.hunts);
                console.log('amount of hunts:', data.hunts.length);
                console.log('hunt info on hunts retrieved:', data.hunts);
            }
            else{
                console.log("Error fetching data, status code: " + result.status)
                Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
                    {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
                   
            }
                
    })()
    }, [buttonPressed]);

    const addHunt = async () => {
        let formData = new FormData();
        formData.append('name', newHunt);
        formData.append('token', token[0])

        const result = await fetch('https://cpsc345sh.jayshaffstall.com/addHunt.php', {
            method: 'POST',
            body: formData
        });
        if (result.ok){
            const data = await result.json()
            
            console.log('Status:', data.status)
            console.log(data);
            if (data.status == "error"){
                Alert.alert('Oops!', String(data.error), [
                    {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
                return;
            }
            else{
                setButtonPressed(!buttonPressed);
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
        <KeyboardAvoidingView style={styles.container}>
            <Text style={{fontWeight:'bold', fontSize: 25, marginTop: 20}}>
                Your Scavenger Hunts:
            </Text>
            <Text style={{fontWeight:'200', fontSize: 20}}>
                Scroll to see more
            </Text>
            <View style={{height:250, width: 250, alignContent: 'center'}}>
            <FlatList
                style={{marginTop: 10, alignContent: 'center'}}
                data = {myHunts}
                renderItem ={({item}) => (
                    <TouchableOpacity
                        onPress={ () => {setButtonPressed(!buttonPressed); {navigation.navigate('Details', {hunt: item}); console.log('Hunt Pressed', item)}} }> 
                        <View>
                            <Text style={{fontSize: 20, marginTop: 10, marginBottom: 10, textAlign:'center'}}>
                                Hunt: {item.name}
                            </Text>
                        </View>
                    </TouchableOpacity>   
                )}
                keyExtractor={(item, index) => index}
                />
            </View>
            <Text style={{fontWeight:'bold', fontSize: 25, textAlign:'center', marginBottom: 15}}>
                Add More Scavenger Hunts Here:
            </Text>
            <TextInput onChangeText={text => setNewHunt(text)}style={{width: 300, height: 30, backgroundColor: '#D3D3D3', marginBottom: 15}} placeholderTextColor='#000000' maxLength={255} textAlign='center' placeholder='Choose a name for your new Hunt:' />
            <Button title='Add Hunt' onPress={addHunt} disabled={newHunt == ''}/>
            <Button title='Check for updates' onPress={()=>{setButtonPressed(!buttonPressed)}}/>
        </KeyboardAvoidingView>
    )
}