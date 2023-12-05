import { useEffect, useState} from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, Alert, TextInput, KeyboardAvoidingView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { removeToken } from './slices.js';
import { styles } from './styles.js';
import { useIsFocused } from '@react-navigation/native';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function MenuPage({navigation}){
    const dispatch = useDispatch();
    useEffect(() => {
        navigation.setOptions({
          title: 'Menu',
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
    <View style={styles.container}>
        <Text style={{fontWeight:'bold', fontSize: 25, textAlign:'center', marginBottom: 15}}>
            Press this button if you want to view and edit your hunt(s):
        </Text>
        <AntDesign.Button name='book' onPress={()=>navigation.navigate('Hunts')}>View Your Scavenger Hunts</AntDesign.Button>

    </View>
)

}