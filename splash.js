
import { Text, Image, View, Button } from "react-native"
import { useSelector } from "react-redux";
import { useEffect } from "react";

import { styles } from "./styles.js";

export default function SplashPage({navigation}) {
    const token = useSelector((state) => state.token.tokens)

    //Needs to wait and check that user login is valid, if YES, send to ScavengerHunts screen, if NO, send to AuthenticationPage
    useEffect(() => {
        (async () => {
            let formData = new FormData();
            formData.append("token", token[0]);
            const result = await fetch('https://cpsc345sh.jayshaffstall.com/verifyToken.php',{
                method: 'POST',
                body: formData
                });
            if (result.ok){
                const data = await result.json();
                if(data.status == "error"){
                    navigation.replace('Authentication')
                }
                else{
                    navigation.replace('Menu')
                }
            }
            else{
                Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
                    {text: 'OK'}]);
            }
        })()
    });

    return(
        <View style={styles.container}>
            <Text style={{fontWeight: 'bold', textAlign:'center', fontSize:30}}>
                Nick's Scavenger Hunt!
            </Text>
            <Image style={{resizeMode: 'contain', width: 300, height: 300, marginBottom: 15, alignContent:"center"}} source={require('./assets/magnifyingglass.png')}/>
            <Text style={{ textAlign:'center', fontSize:15}}>
                Loading Content...
            </Text>
            <Button title="Authentication Screen" onPress={()=>{navigation.replace('Authentication')}}/>
        </View>
    )
}