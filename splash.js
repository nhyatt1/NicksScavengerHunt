
import { Text, Image, View, Button } from "react-native"
import { styles } from "./styles.js";
import { useSelector, useDispatch } from "react-redux";
import { removeToken } from "./slices.js";
import { useEffect } from "react";

export default function SplashPage({navigation}) {
    const dispatch = useDispatch();
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
                const data = await result.json()
                console.log(data);
                if(data.status == "error"){
                    navigation.replace('Authentication')
                }
                else{
                    navigation.replace('Hunts')
                }
            }
            else{
                console.log("Error fetching data, status code: " + result.status)
                Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
                    {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
                   
            }
                // .then(response => {
                // console.log(response);

                // }).catch(err => {
                //     console.log(err)
                // });console.log(data);
    })()

    });
    
    return(
        <View style={styles.container}>
            <Text style={{fontWeight: 'bold', textAlign:'center', fontSize:30}}>
                Nick's Scavenger Hunt!
            </Text>
            <Image style={{resizeMode: 'center', width: 300, height: 300, marginBottom: 15, alignContent:"center"}} source={require('./assets/magnifyingglass.png')}/>
            <Text style={{ textAlign:'center', fontSize:15}}>
                Loading Content...
            </Text>
            <Button title="Authentication Screen" onPress={()=>{navigation.replace('Authentication')}}/>
        </View>
        

    )
}