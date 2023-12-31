import { useState } from "react";
import { useDispatch } from "react-redux";
import { Text, View, TextInput, Button, Alert, KeyboardAvoidingView} from "react-native"

import { addToken } from "./slices.js";
import { styles } from "./styles.js";

export default function AuthenticationPage({navigation}){
    const [loginVisible, setLoginVisible] = useState(false);
    const [userID, setUserID] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [userConfirm, setUserConfirm] = useState('');
    const dispatch = useDispatch();



    const registerUser = async () => {

        if (userPassword != userConfirm){
            Alert.alert('Oops!', 'Your passwords do not match.', [
                {text: 'OK'}]);
            return;
        }

        let formData = new FormData();
        formData.append('userid', userID);
        formData.append('password', userPassword);
        const result = await fetch('https://cpsc345sh.jayshaffstall.com/register.php', {
            method: 'POST',
            body: formData
        });
        if (result.ok){
            const data = await result.json();
            if (data.status == "error"){
                Alert.alert('Oops!', String(data.error), [
                    {text: 'OK'}]);
                return;
            }else{
                dispatch(addToken(String(data.token)));
                navigation.replace('Menu');
            }
            
        }
        else{
            Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
                {text: 'OK'}]);
            return;
        }
    }  

    const loginUser = async () => {
        let formData = new FormData();
        formData.append('userid', userID);
        formData.append('password', userPassword);
        const result = await fetch('https://cpsc345sh.jayshaffstall.com/login.php', {
            method: 'POST',
            body: formData
        });
        if (result.ok){
            const data = await result.json();
            if (data.status == "error"){
                Alert.alert('Oops!', String(data.error), [
                    {text: 'OK'}]);
                return;
            }
            else{
                dispatch(addToken(data.token));
                navigation.replace('Menu')
            }
            
        }
        else{
            Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
                {text: 'OK'}]);
            return;
        }
    }

    return(
        <KeyboardAvoidingView style={styles.container}>
            {!loginVisible ? 
            <> 
            <View style={styles.container}>
                <Text style={{fontWeight: '300', fontSize: 25, textAlign: 'center'}}>
                    Please create an account for Nick's Scavenger Hunt
                </Text>
                <Text style={{fontWeight: '200', fontSize: 15, textAlign: 'center'}}>
                    Select a username less than 255 characters, and a password longer than 12 characters.
                </Text>
                <View style={{flexDirection: "row", alignItems: 'center', justifyContent: 'center', margin: 10}}>
                    <Text>Username: </Text>
                    <TextInput value={userID} placeholderTextColor='#000000' maxLength={255} onChangeText={text => setUserID(text)} placeholder= 'Enter a username' style={{width: 200, height:30, backgroundColor: '#D3D3D3'}}/>
                </View>
                <View style={{flexDirection: "row", alignItems: 'center', justifyContent: 'center', margin: 10}}>
                    <Text>Password: </Text>
                    <TextInput value={userPassword} placeholderTextColor='#000000' textContentType='oneTimeCode' autoComplete='password' secureTextEntry={true} onChangeText={text => setUserPassword(text)} placeholder= 'Enter a password' style={{width: 200, height:30, backgroundColor: '#D3D3D3'}}/>
                </View>
                <View style={{flexDirection: "row", alignItems: 'center', justifyContent: 'center', margin: 10}}>
                    <Text>Confirm password: </Text>
                    <TextInput value={userConfirm} textContentType='oneTimeCode' placeholderTextColor='#000000' autoComplete='password' secureTextEntry={true} onChangeText={text => setUserConfirm(text)} placeholder= 'Re-enter password' style={{width: 200, height:30, backgroundColor: '#D3D3D3'}}/>
                </View>
                
                <Button title="Register" onPress={registerUser} disabled={userID == '' || userID.length > 255 ||  userConfirm.length < 12 || userPassword.length < 12|| userPassword == ''}/>
            </View>   
            <View style={styles.container}>
                <Text style={{fontWeight: 'bold', fontSize: 25, textAlign: 'center'}}>
                    Already have an account?
                </Text> 
                <Button title="Login Here" onPress={()=>{setLoginVisible(!loginVisible);setUserConfirm('');setUserPassword('');setUserID('')}}/>
            </View>
            </>
            : 
            <>
            <View style={styles.container}>
                <Text style={{fontWeight: '300', fontSize: 25, textAlign: 'center'}}>
                    Please login with your username and password.
                </Text>
                <View style={{flexDirection: "row", alignItems: 'center', justifyContent: 'center', margin: 10}}>
                    <Text>Username: </Text>
                    <TextInput value={userID} onChangeText={text => setUserID(text)} placeholderTextColor='#000000' placeholder= 'Enter your username' style={{width: 200, height:30, backgroundColor: '#D3D3D3'}}/>
                </View>
                <View style={{flexDirection: "row", alignItems: 'center', justifyContent: 'center', margin: 10}}>
                    <Text>Password: </Text>
                    <TextInput value={userPassword} textContentType='none' autoComplete='off' placeholderTextColor='#000000' onChangeText={text => setUserPassword(text)} secureTextEntry={true} placeholder= 'Enter your password' style={{width: 200, height:30, backgroundColor: '#D3D3D3'}}/>
                </View>
                <Button title="Login" onPress={loginUser} disabled={userID == '' || userID.length > 255 || userPassword.length < 12|| userPassword == ''}/>
            </View>
            <View style={styles.container}>
                <Text style={{fontWeight: 'bold', fontSize: 25, textAlign: 'center'}}>
                    Need to make an account?    
                </Text> 
                <Button title="Register Here" onPress={()=>{setLoginVisible(!loginVisible);setUserID('');setUserPassword('')}}/>
            </View> 
            </>}
        </KeyboardAvoidingView>
    )
}