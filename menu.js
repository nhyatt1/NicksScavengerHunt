import { useEffect } from 'react';
import { View, Text, Button, Image } from 'react-native';
import { useDispatch } from 'react-redux';

import { removeToken } from './slices.js';
import { styles } from './styles.js';

import AntDesign from '@expo/vector-icons/AntDesign';

export default function MenuPage({navigation}){
  const dispatch = useDispatch();
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

  return(
    <View style={styles.container}>
        <Text style={{fontWeight: 'bold', textAlign:'center', fontSize:30, marginBottom:20}}>
          Welcome to Nick's Scavenger Hunt!
        </Text>
        <Image style={{resizeMode: 'contain', width: 200, height: 200, marginBottom: 15, alignContent:"center"}} source={require('./assets/magnifyingglass.png')}/>
        <Text style={{fontWeight:'600', fontSize: 25, textAlign:'center', marginBottom: 15 ,marginTop:15}}>
            Press this button if you want to play available hunts:
        </Text>
        <AntDesign.Button name='playcircleo' onPress={()=>navigation.navigate('Find Hunts')}>Play Scavenger Hunts</AntDesign.Button>
        <Text style={{fontWeight:'600', fontSize: 25, textAlign:'center', marginBottom: 15, marginTop:15}}>
            Press this button if you want to view and edit your hunt(s):
        </Text>
        <AntDesign.Button name='book' onPress={()=>navigation.navigate('Hunts')}>View Your Scavenger Hunts</AntDesign.Button>

    </View>
)

}