import { useEffect, useState} from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, Alert, TextInput, KeyboardAvoidingView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { removeToken } from './slices.js';
import { styles } from './styles.js';
import { useIsFocused } from '@react-navigation/native';

export default function HuntsPage({navigation}){

    const dispatch = useDispatch();
    const token = useSelector((state) => state.token.tokens);
    const [newHunt, setNewHunt] = useState('')
    const [myHunts, setMyHunts] = useState([])
    const [buttonPressed, setButtonPressed] = useState(false);
    const [locationsArr, setLocationsArr] = useState([]);
    const [conditionsArr, setConditionsArr] = useState([]);
    const isFocused = useIsFocused();
    //!(locationsArr.find(obj => String(obj.locationid) == String(requiredlocationid))) need to implement

    useEffect(() => {
        if (myHunts.length == 0){
            return;
        }
        (async () => {
        console.log('locations useEffect')
        console.log('locationsArr', locationsArr)
        let tempLocArr = [];
        let i = 0;
        let z = myHunts.length;

        myHunts.forEach(async (element) =>{
            let newForm = new FormData();
            newForm.append('token', token);
            newForm.append('huntid', element.huntid);

            const response = await fetch('https://cpsc345sh.jayshaffstall.com/getHuntLocations.php', {
                method: 'POST',
                body: newForm
            });
            if (response.ok){
                const data = await response.json()
                if (data.status == "error"){
                    Alert.alert('Oops!', String(data.error), [
                        {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
                    return;
                }else{
                    console.log('current element name', element.name)
                    console.log('data.locations:' , data.locations)
                    if(data.locations[0] != null){
                        tempLocArr.push(data.locations[0])
                        console.log("temp loc arr", i, tempLocArr)
                        if (i == z - 1){
                            console.log('i == z-1')
                            setLocationsArr(tempLocArr);
                        }
                        
                        // if(String(data.locations[0].locationid) == String(requiredlocationid)){
                        //     console.log('this events id is the same as requiredlocationid:', String(data.locations[0].locationid) == String(requiredlocationid))

                        // }
                    }
                }
            }
            else{
                console.log("Error fetching data, status code: " + response.status)
                Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(response.status), [
                    {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
            }i++
        })})()
    }, [myHunts]);
        
    useEffect(() => {
        (async () => {
        let tempCondArr = [];
        let i = 0;
  
        for (i; i< locationsArr.length; i++){
            console.log('secondForEach: locationsArr', locationsArr, locationsArr[i], locationsArr[i].locationid)
            
            let formData = new FormData();
            formData.append('token', token);
            formData.append('locationid', locationsArr[i].locationid);

            const result = await fetch('https://cpsc345sh.jayshaffstall.com/getConditions.php', {
                method: 'POST',
                body: formData
            });
            if (result.ok){
                const data = await result.json();
                if (data.status == "error"){
                    Alert.alert('Oops!', String(data.error), [
                        {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
                    return;
                }else{
                    console.log('current element name', locationsArr[i].name)
                    console.log('data.conditions:' , data.conditions)
                    if(data.conditions[0] != null){
                        if (data.conditions[0].requiredlocationid == null){
                            console.log("temp loc arr after condition is a time interval", i, tempCondArr)
                        }else{
                            tempCondArr.push(data.conditions[0].requiredlocationid)
                            console.log("temp loc arr", i, tempCondArr)
                            setConditionsArr(tempCondArr);
                        }
                        
                        // if(String(data.locations[0].locationid) == String(requiredlocationid)){
                        //     console.log('this events id is the same as requiredlocationid:', String(data.locations[0].locationid) == String(requiredlocationid))

                        // }
                    }
                }
            }
            else{
                console.log("Error fetching data, status code: " + result.status)
                Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
                    {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
            }
        }
        console.log("tempCondArr length:", tempCondArr.length)
        if (tempCondArr.length == 0){
            console.log('length == 0')
            setConditionsArr([])
        }
    })()
    }, [locationsArr, isFocused]);



    useEffect(() => {
        navigation.setOptions({
          title: 'Hunts',
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
        <KeyboardAvoidingView behavior='position' style={styles.container} contentContainerStyle={{alignItems: 'center'}}>
            <Text style={{fontWeight:'bold', fontSize: 25, marginTop: 20}}>
                Your Scavenger Hunts:
            </Text>
            <Text style={{fontWeight:'200', fontSize: 20}}>
                Scroll to see more
            </Text>
            <View style={{height:200, width: 250, alignContent: 'center'}}>
                <FlatList
                    style={{marginTop: 10, alignContent: 'center'}}
                    data = {myHunts}
                    renderItem ={({item}) => (
                    <TouchableOpacity
                        onPress={ () => {setButtonPressed(!buttonPressed); {navigation.navigate('Details', {hunt: item, locationIsRequired: conditionsArr}); console.log('Hunt Pressed', item), console.log('conditions Arr on press:', conditionsArr)}} }> 
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