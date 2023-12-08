import { useEffect, useState} from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, Alert, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';

import { removeToken } from './slices.js';
import { styles } from './styles.js';

import AntDesign from '@expo/vector-icons/AntDesign';

export default function PlayHunts({navigation, route}){
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token.tokens);
  const [Hunt, setHunt] = useState(route.params.Hunt);
  const isFocused = useIsFocused();
  const [huntLocations, setHuntLocations] = useState([]);
  const [huntIsActive, setHuntIsActive] = useState(false);
  const [updateCheck, setUpdateCheck] = useState(false);

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
      formData.append("huntid", Hunt.huntid);
      const result = await fetch('https://cpsc345sh.jayshaffstall.com/findActiveHunts.php',{
        method: 'POST',
        body: formData
      });
      if (result.ok){
        const data = await result.json()
        if (data.status == "error"){
          Alert.alert('Oops!', String(data.error), [{text: 'OK'}]);
          return;
        }else{
          if(data.hunts.find(element => String(element.huntid) == String(Hunt.huntid))){
            setHunt(data.hunts.find(element => String(element.huntid) == String(Hunt.huntid)));
            setHuntIsActive(true);
          }else{
            setHuntIsActive(false);
            findCurrentHunt();
          }
        }
      }else{
        Alert.alert('Oops! Something went wrong with our API. Please try again, or come back another time.', String(result.status), [
          {text: 'OK'}]);
      }
    })()
  }, [updateCheck, isFocused]);

  useEffect(() => {
    (async () => {
      if(huntIsActive == true){
        let formData = new FormData();
        formData.append("token", token[0]);
        formData.append("huntid", Hunt.huntid);
        const result = await fetch('https://cpsc345sh.jayshaffstall.com/getAvailableLocations.php',{
          method: 'POST',
          body: formData
        });
        if (result.ok){
          const data = await result.json()
          if (data.status == "error"){
            Alert.alert('Oops!', String(data.error), [
                {text: 'OK'}]);
            return;
          }else{
          setHuntLocations(data.locations)
          }
        }else{
          Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
            {text: 'OK'}]);
        }
      }else{
        return;
      }
    })()
  }, [huntIsActive, isFocused]);

  const findCurrentHunt = async () =>{
    let formData = new FormData();
    formData.append("token", token[0]);
    const result = await fetch('https://cpsc345sh.jayshaffstall.com/findHunts.php',{
      method: 'POST',
      body: formData
    });
    if (result.ok){
      const data = await result.json()
      if (data.status == "error"){
        Alert.alert('Oops!', String(data.error), [
            {text: 'OK'}]);
        return;
      }else{
        if(data.hunts.find(element => String(element.huntid) == String(Hunt.huntid))){
          setHunt(data.hunts.find(element => String(element.huntid) == String(Hunt.huntid)));
        }
      }
    }else{
      Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
        {text: 'OK'}]);
    }
  }

  const startHunt = async() =>{
    let formData = new FormData();
    formData.append("token", token[0]);
    formData.append("huntid", Hunt.huntid);
    const result = await fetch('https://cpsc345sh.jayshaffstall.com/startHunt.php',{
      method: 'POST',
      body: formData
      })
    if (result.ok){
      const data = await result.json()
      if (data.status == "error"){
        Alert.alert('Oops!', String(data.error), [
            {text: 'OK'}]);
        return;
      }else{
        setUpdateCheck(!updateCheck);
      }
    }
    else{
      Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
          {text: 'OK'}]);
    }   
  }

  const abandonConfirmation = () =>
  Alert.alert('ARE YOU SURE?', Hunt.completed == 100? 'If you reset this Hunt, you will lose ALL progress.':'If you abandon this Hunt, you will lose ALL progress.' , [
      {text: 'Confirm', onPress:() => abandonHunt()},
      {text: 'Cancel', style: 'cancel'}
  ]);

  const abandonHunt = async() =>{
    let formData = new FormData();
    formData.append("token", token[0]);
    formData.append("huntid", Hunt.huntid);
    const result = await fetch('https://cpsc345sh.jayshaffstall.com/abandonHunt.php',{
      method: 'POST',
      body: formData
      })
    if (result.ok){
      const data = await result.json()
      if (data.status == "error"){
        Alert.alert('Oops!', String(data.error), [
          {text: 'OK'}]);
        return;
      }else{
        setUpdateCheck(!updateCheck);
        setHuntLocations([])
      }
    }
    else{
      Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
          {text: 'OK'}]);
    } 
  }

return(
  <View style={styles.container}>
    <Text style={{fontSize: 25, fontWeight: '400', textAlign:'center'}}>
        Hunt: <Text style={{fontSize: 25, fontWeight: '200'}}>{Hunt.name}</Text>
    </Text>
    {Hunt.completed == null? 
    <AntDesign.Button onPress={startHunt} name='playcircleo' backgroundColor='green'>Start This Hunt?</AntDesign.Button>
    :
    <>
    <Text style={{fontSize: 25, fontWeight: '400', textAlign:'center', marginBottom:10}}>
      Completion: <Text style={{fontSize: 25, fontWeight: '200'}}>{Hunt.completed}%</Text>
    </Text>
    {Hunt.completed == 100?
    <>
    <View>
    <Image style={{resizeMode: 'center', width: 200, height: 200, marginBottom: 15}} 
    source={require('./assets/greatjob.png')}/>
    </View>
    <AntDesign.Button onPress={abandonConfirmation} name='sync' backgroundColor='red'>Reset This Hunt?</AntDesign.Button>
    </>
    :
    <AntDesign.Button onPress={abandonConfirmation} name='poweroff' backgroundColor='red'>Abandon This Hunt?</AntDesign.Button>}
    </>}
    <Text style={{fontSize: 25, fontWeight: '200', textAlign:'center', marginTop:10}}>
      {huntIsActive == true? "Tap on one of the available locations to see more details.": "Start the hunt to see available locations!"} 
    </Text>
    <View style={{height:250, width: 250, alignContent: 'center'}}>
      <FlatList
          style={{alignContent: 'center'}}
          data = {huntLocations}
          renderItem ={({item}) => (
          <TouchableOpacity
              onPress={() => {navigation.navigate('Location Clue', {Hunt: Hunt, location: item});}}> 
              <View>
                  <Text style={{fontSize: 20, marginTop: 10, marginBottom: 10, fontWeight:'200',textAlign:'center'}}>
                  <Text style={{fontSize: 20, fontWeight:'400'}}>Location:</Text> {item.name} {item.completed == true?<AntDesign size={20} color='green' name='checkcircleo'/>:""}
                  </Text>
              </View>
          </TouchableOpacity>   
        )}
        keyExtractor={(item, index) => index}
      />
    </View>
  </View>
)}