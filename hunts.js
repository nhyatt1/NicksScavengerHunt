import { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, Alert, TextInput, KeyboardAvoidingView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';

import { removeToken } from './slices.js';
import { styles } from './styles.js';

import AntDesign from '@expo/vector-icons/AntDesign';

export default function HuntsPage({navigation}){

    const dispatch = useDispatch();
    const token = useSelector((state) => state.token.tokens);
    const [newHunt, setNewHunt] = useState('')
    const [myHunts, setMyHunts] = useState([])
    const [buttonPressed, setButtonPressed] = useState(false);
    const isFocused = useIsFocused();

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
                if (data.status == "error"){
                    Alert.alert('Oops!', String(data.error), [
                        {text: 'OK'}]);
                    return;
                }
                else{
                    setMyHunts(data.hunts);
                }
            }
            else{
                Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
                    {text: 'OK'}]);
            }
        })()
    }, [buttonPressed, isFocused]);

    const addHunt = async () => {
        let formData = new FormData();
        formData.append('name', newHunt);
        formData.append('token', token[0]);
        const result = await fetch('https://cpsc345sh.jayshaffstall.com/addHunt.php', {
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
                setButtonPressed(!buttonPressed);
            }   
        }
        else{
            Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
                {text: 'OK'}]);
            return;
        }
    }

    return(
        <KeyboardAvoidingView behavior='position' style={styles.container} keyboardVerticalOffset={100}>
            <View style={styles.container}>
            <Text style={{fontWeight:'600', fontSize: 25, marginTop: 20}}>
                Your Scavenger Hunts:
            </Text>
            <Text style={{fontWeight:'200', fontSize: 20, textAlign: 'center'}}>
                Scroll to see more, tap to see more details.
            </Text>
            <View style={{height:350, width: 250, alignContent: 'center'}}>
                <FlatList
                    style={{marginTop: 10, alignContent: 'center'}}
                    data = {myHunts}
                    renderItem ={({item}) => (
                    <TouchableOpacity
                        onPress={ () => {setButtonPressed(!buttonPressed); {navigation.navigate('Details', {hunt: item});}} }> 
                        <View>
                            <Text style={{fontSize: 20, marginTop: 10, fontWeight:'200',marginBottom: 10, textAlign:'center'}}>
                            <Text style={{fontWeight:'400'}}>Hunt:</Text> {item.name}
                            </Text>
                        </View>
                    </TouchableOpacity>   
                )}
                keyExtractor={(item, index) => index}
                />
            </View>
            <Text style={{fontWeight:'600', fontSize: 25, textAlign:'center', marginBottom: 15}}>
                Add More Scavenger Hunts Here:
            </Text>
            <TextInput onChangeText={text => setNewHunt(text)}style={{width: 300, height: 30, backgroundColor: '#D3D3D3', marginBottom: 15}} placeholderTextColor='#000000' maxLength={255} textAlign='center' placeholder='Choose a name for your new Hunt:' />
            <AntDesign.Button onPress={addHunt} disabled={newHunt == ''} name='plussquareo' backgroundColor={newHunt == ''? 'grey':'#007AFF'}>Add Hunt</AntDesign.Button>  
            </View>
        </KeyboardAvoidingView>
    )
}