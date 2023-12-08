import { useEffect, useState} from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, Alert, Image, TextInput } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { removeToken } from './slices.js';
import { styles } from './styles.js';
import { useIsFocused } from '@react-navigation/native';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function FindHunts({navigation, route}){
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token.tokens);
  const isFocused = useIsFocused();
  const [activeHunts, setActiveHunts] = useState([]);
  const [huntsPlaying, setHuntsPlaying] = useState([]);
  const [huntsCompleted, setHuntsCompleted] = useState([]);
  const [view, setView] = useState(0);
  const [filter, setFilter] =useState('');

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
      formData.append("filter", filter)

      const result = await fetch('https://cpsc345sh.jayshaffstall.com/findHunts.php',{
        method: 'POST',
        body: formData
        })
      if (result.ok){
        const data = await result.json()
        setActiveHunts(data.hunts);
        let tempCompleted = [];
        for (let i = 0; i < data.hunts.length; i++){
          if (data.hunts[i].completed ==100){
            tempCompleted.push(data.hunts[i])
          }
        }
        setHuntsCompleted(tempCompleted)
      }
      else{
        Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
            {text: 'OK'}]);
      }    
    }
  )()}, [isFocused, filter]);

  useEffect(() => {
    (async () => {
      let formData = new FormData();
      formData.append("token", token[0]);

      const result = await fetch('https://cpsc345sh.jayshaffstall.com/findActiveHunts.php',{
        method: 'POST',
        body: formData
        })

      if (result.ok){
        const data = await result.json()
        setHuntsPlaying(data.hunts);
      }
      else{
        Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
            {text: 'OK'}]);
      }
    })()
  }, [isFocused]);
    
return(
  <View style={styles.container}>
    {view == 0?
    <>
    <Text style={{fontWeight:'600', fontSize: 25, marginBottom:20}}>
      Available Hunts:
    </Text>
    <TextInput value={filter} onChangeText={text => setFilter(text)} style={{width: 300, height: 30, backgroundColor: '#D3D3D3'}} placeholderTextColor='#000000' maxLength={255} textAlign='center' placeholder='Search here:' />
    <View style={{height:400, width: 350, alignContent: 'center'}}>
      <FlatList
        style={{alignContent: 'center'}}
        data = {activeHunts}
        renderItem ={({item}) => (
          <TouchableOpacity
            onPress={() => {navigation.navigate('Play Hunts', {Hunt: item});}}> 
            <View>
              <Text style={{fontSize: 20, marginTop: 10, marginBottom: 10,fontWeight:'200', textAlign:'center'}}>
                <Text style={{fontSize: 20, fontWeight:'400'}}>Hunt:</Text> {item.name}
              </Text>
            </View>
          </TouchableOpacity>   
        )}
        keyExtractor={(item, index) => index}
      />
    </View>
    <View style={{marginBottom:20, marginTop:20}}>
      <AntDesign.Button name='book' onPress={() =>{setView(1);}}>
        See Hunts You're Playing
      </AntDesign.Button>
    </View>
    <View> 
      <AntDesign.Button name='book' onPress={() =>{setView(2);}}>
        See Hunts You've Completed
      </AntDesign.Button>
    </View>
    </>
    :
    view == 1?
    <>
    <Text style={{fontWeight:'600', fontSize: 25}}>
      Hunts You're Playing:
    </Text>
    <View style={{height:400, width: 350, alignContent: 'center'}}>
      <FlatList
        style={{alignContent: 'center'}}
        data = {huntsPlaying}
        renderItem ={({item}) => (
        item.completed == 100?
        <></>
        :
        <TouchableOpacity
        onPress={() => {navigation.navigate('Play Hunts', {Hunt: item});}}> 
          <View>
            <Text style={{fontSize: 20, marginTop: 10, marginBottom: 10, fontWeight:'200', textAlign:'center'}}>
              <Text style={{fontSize: 20, fontWeight:'400'}}>Hunt:</Text> {item.name}
            </Text>
          </View>
        </TouchableOpacity>   
        )}
        keyExtractor={(item, index) => index}
      />
    </View>
    <View style={{marginBottom:20, marginTop:20}}>
      <AntDesign.Button name='book' onPress={() =>{setView(0);}}>
        See All Hunts
      </AntDesign.Button>
    </View>
    <View> 
      <AntDesign.Button name='book' onPress={() =>{setView(2);}}>
        See Hunts You've Completed
      </AntDesign.Button>
    </View>
    </>
    :
    <>
    <Text style={{fontWeight:'600', fontSize: 25}}>
       Hunts You've Completed:
    </Text>
    {huntsCompleted.length > 0? 
    <View>
      <Image style={{resizeMode: 'contain', width: 100, height: 100, marginBottom: 15}} source={require('./assets/greatjob.png')}/>
    </View>
    :
    <View>
      <Text style={{fontSize: 20, marginTop: 10, marginBottom: 10, textAlign:'center'}}>No Hunts completed yet. Play some!</Text>
    </View>}

    <View style={{height:300, width: 350, alignContent: 'center'}}>
      <FlatList
        style={{alignContent: 'center'}}
        data = {huntsCompleted}
        renderItem ={({item}) => (
        <TouchableOpacity
          onPress={() => {navigation.navigate('Play Hunts', {Hunt: item});}}> 
          <View>
            <Text style={{fontSize: 20, marginTop: 10, marginBottom: 10, fontWeight:'200', textAlign:'center'}}>
              <AntDesign name="staro" size={25}/> <Text style={{fontWeight:400}}>Hunt:</Text> {item.name} <AntDesign name="staro" size={25}/> 
            </Text>
          </View>
        </TouchableOpacity>   
        )}
        keyExtractor={(item, index) => index}
      />
    </View>
    <View style={{marginBottom:20, marginTop:20}}>
      <AntDesign.Button name='book' onPress={() =>{setView(0);}}>
      See All Hunts
      </AntDesign.Button>
    </View>
    <View> 
      <AntDesign.Button name='book' onPress={() =>{setView(1);}}>
      See Hunts You're Playing
      </AntDesign.Button>
    </View>
    </>
    }
  </View>
)}