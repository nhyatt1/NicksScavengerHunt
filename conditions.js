import { View, Text, TextInput, Button, Alert, KeyboardAvoidingView, TouchableOpacity, FlatList } from "react-native"
import { useEffect, useState, useRef } from "react"
import { useDispatch, useSelector } from "react-redux";
import { styles } from "./styles.js";
import AntDesign from '@expo/vector-icons/AntDesign';
import { removeToken } from "./slices.js";
import { useIsFocused } from "@react-navigation/native"
import DateTimePicker from '@react-native-community/datetimepicker';
import RNDateTimePicker from "@react-native-community/datetimepicker";

export default function ConditionsPage({navigation, route}){  
    const dispatch = useDispatch();
    const token = useSelector(state => state.token.tokens);
    const [Hunt, setHunt] = useState(route.params.hunt);
    const [myHunts, setMyHunts] = useState([]);
    const [locationsArr, setLocationsArr] = useState([])
    const [huntLocation, setHuntLocation] = useState(route.params.location);
    const isFocused = useIsFocused();
    //conditions from getconditions should be taken as data.conditions[0]
    const [huntConditions, setHuntConditions] = useState(route.params.conditions);
    const [updateCheck, SetUpdateCheck] = useState(false);
    const [newTime, SetNewTime] = useState();
    const [spinStart, setSpinStart] = useState(new Date());
    const [spinEnd, setSpinEnd] = useState(new Date());
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [requiredlocationid, setRequiredlocationid] = useState('');
    const [reqlocName, setReqLocName] = useState('loading...');
    const [view, setView] = useState(0);
    const [updateView, setUpdateView] = useState(0);
    const [timePicker, setTimePicker] = useState(false);
    const [huntCheck, setHuntCheck] = useState(false);
    

    const displayDate = (string) =>{
        const arr = string.split(':');
        const tempHours = parseInt(arr[0]);
        const tempMinutes = parseInt(arr[1]);
        const now = new Date();
        const startUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(),
        tempHours, tempMinutes, 0, 0)
        const startLocal = new Date(startUTC)
        let localHours = startLocal.getHours()
        let localMinutes = startLocal.getMinutes()
        if (localHours < 10){
            localHours = '0' + localHours;
        }
        if (localMinutes < 10){
            localMinutes = '0' + localMinutes;
        }

        return(localHours + ':' + localMinutes +':00');
    }

    useEffect(() => {
        navigation.setOptions({
          title: 'Conditions',
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

      useEffect(()=>{(async () => {
        console.log('Fetching Hunt conditions... (useEffect1)')
        console.log('Hunt:', Hunt)
        console.log('huntLocation:', huntLocation)
        console.log('current conditions:', huntConditions)
        let formData = new FormData();
        formData.append('locationid', huntLocation.locationid);
        formData.append('token', token[0])
        const response = await fetch('https://cpsc345sh.jayshaffstall.com/getConditions.php', {
            method: 'POST',
            body: formData
        });
        if(response.ok){
            const data = await response.json()
            console.log('Status:', data.status)
            console.log('conditions data:', data);
            if (data.status == "error"){
                Alert.alert('Oops!', String(data.error), [
                    {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
                return;
            }
            else{
                console.log('data.conditions:' , data.conditions)
                setHuntConditions(data.conditions[0]);
                if (data.conditions[0] == null){
                    setView(0);
                }

            }   
        }
        else{
            console.log("Error fetching data, status code: " + response.status)
            Alert.alert('Oops! Something went wrong with "getConditions.php" from the API. Please try again, or come back another time.', String(response.status), [
                {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
            
        }
    })()},[isFocused, updateCheck]);

    useEffect(() => {
        (async () => {
            let loadHunts;
            let formData = new FormData();
            formData.append("token", token[0]);
            const result = await fetch('https://cpsc345sh.jayshaffstall.com/getMyHunts.php',{
                method: 'POST',
                body: formData
                })
            if (result.ok){
                const data = await result.json()
                console.log("geMyHunts data:", data);
                setMyHunts(data.hunts);
                loadHunts = data.hunts;
                console.log('amount of hunts:', data.hunts.length);
            }
            else{
                console.log("Error fetching data, status code: " + result.status)
                Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
                    {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
                   
            }
            console.log('my hunts', myHunts);
            setLocationsArr([]);
            let tempLA = [];
            console.log('load these hunts:', loadHunts);
            console.log('fetching locations of those hunts')
    })()
    }, [huntCheck]);

    useEffect(() => {
            console.log('conditions useEffect')
            console.log('locationsArr', locationsArr)
            let tempLocArr = [];
            let i = 0;
            myHunts.forEach(async (element) =>{
                if (String(element.huntid) != String(Hunt.huntid)){
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
                            if(String(data.locations[0].locationid) == String(requiredlocationid)){
                                console.log('this events id is the same as requiredlocationid:', String(data.locations[0].locationid) == String(requiredlocationid))
                                setReqLocName(String(data.locations[0].name))
                            }
                        }
                    }
                }
                else{
                    console.log("Error fetching data, status code: " + response.status)
                    Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(response.status), [
                        {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
                    
                }i++
            }
            })
            setLocationsArr(tempLocArr);

    }, [huntConditions, myHunts]);

    const handleLocationPress = async (name, value) =>{
        Alert.alert('ARE YOU SURE?', "You are choosing the location \'" + name + "' as the required location", [
            {text: 'Confirm', onPress:async() => {huntConditions == null? addCondition(value) : updateCondition(value);}},
            {text: 'Cancel', onPress:()=>{console.log('cancelled')}, style: 'cancel'}]);
    }

    const addCondition = async(value)=>{
        console.log('addcondition')
        let formData = new FormData();
        formData.append('token', token);
        formData.append('locationid', huntLocation.locationid);
        if(value == ''){
            console.log('reqloq is empty, adding times')
            formData.append('starttime', startTime);
            formData.append('endtime', endTime);
        }else{
            console.log('no times, adding reqloc', value)
            formData.append('requiredlocationid', value)
        }
            
        const result = await fetch('https://cpsc345sh.jayshaffstall.com/addCondition.php', {
            method: 'POST',
            body: formData
        });
        if(result.ok){
            const data = await result.json()
            console.log('Status:', data.status)
            console.log('added condition data:', data);
            if (data.status == "error"){
                Alert.alert('Oops!', String(data.error), [
                    {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
                return;
            }
            else{
                setStartTime('');
                setEndTime('');
                setRequiredlocationid(value);
                SetUpdateCheck(!updateCheck);
                setView(0);
            }   
        }
        else{
            console.log("Error fetching data, status code: " + result.status)
            Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
                {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
            return;
        }
    }
    const updateCondition = async(value)=>{
        console.log('update entered')
        let formData = new FormData();
        formData.append('token', token);
        formData.append('conditionid', huntConditions.conditionid);
        if(value == ''){
            console.log('reqloq is empty, adding times')
            formData.append('starttime', startTime);
            formData.append('endtime', endTime);
        }else{
            console.log('no times, adding reqloc', value)
            formData.append('requiredlocationid', value)
        }

        
        const result = await fetch('https://cpsc345sh.jayshaffstall.com/updateCondition.php', {
            method: 'POST',
            body: formData
        });
        if(result.ok){
            const data = await result.json()
            console.log('Status:', data.status)
            console.log('update data:', data);
            if (data.status == "error"){
                Alert.alert('Oops!', String(data.error), [
                    {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
                return;
            }
            else{
                setStartTime('');
                setEndTime('');
                SetUpdateCheck(!updateCheck);
                setView(0);
                setRequiredlocationid(value);
            }   
        }
        else{
            console.log("Error fetching data, status code: " + result.status)
            Alert.alert('Oops! Something went wrong with our database. Please try again, or come back another time.', String(result.status), [
                {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
            return;
        }
    }

    const deleteConfirmation = () =>
    Alert.alert('ARE YOU SURE?', 'If you delete this Condition, you will have to set it again.', [
        {text: 'Confirm', onPress:async() => {deleteCondition()}},
        {text: 'Cancel', onPress:()=>{console.log('Cancel Pressed')}, style: 'cancel'}
    ]);
    const deleteCondition = async () =>{
        console.log('Deleting Hunt...');
        let formData = new FormData();
        formData.append('token', token[0]);
        formData.append('conditionid', huntConditions.conditionid);
        const result = await fetch('https://cpsc345sh.jayshaffstall.com/deleteCondition.php', {
            method: 'POST',
            body: formData
        });
        if(result.ok){
            const data = await result.json()
            console.log('Status:', data.status)
            console.log('delete data:', data);
            if (data.status == "error"){
                Alert.alert('Oops!', String(data.error), [
                    {text: 'OK', onPress:()=>{console.log('OK Pressed');}}]);
                return;
            }
            else{
                setRequiredlocationid('');
                setStartTime('');
                setEndTime('');
                SetUpdateCheck(!updateCheck);
                //
                setHuntCheck(!huntCheck);
                //updates hunt array (not rlly necesary/????)
                setView(0);
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
            {view == 0? 
            <>
            <Text style={{fontSize: 25, fontWeight: '400', textAlign:'center', marginBottom: 10}}>
                Current Hunt: <Text style={{fontSize: 25, fontWeight: '200'}}>{Hunt.name}</Text>
            </Text>
            <Text style={{fontSize: 25, fontWeight: '400', textAlign:'center', marginBottom: 10}}>
                Condition type: <Text style={{fontSize: 25, fontWeight: '200'}}>{huntConditions == null?  "None, press ONE of the options below (editable later):": huntConditions.starttime == null && huntConditions.endtime == null? "Required Location": "Period of Visibility"}</Text>
            </Text>
            {huntConditions == null?
            <></>
            :
            huntConditions.starttime == null && huntConditions.endtime == null?
                <Text style={{fontSize: 25, fontWeight: '400', textAlign:'center', marginBottom: 10}}>
                    Required Location Name: <Text style={{fontSize: 25, fontWeight: '200'}}>{reqlocName}</Text>{'\n'}Required Location ID: <Text style={{fontSize: 25, fontWeight: '200'}}>{requiredlocationid}</Text>
                </Text>
                :
                <Text style={{fontSize: 25, fontWeight: '400', textAlign:'center', marginBottom: 10}}>
                    Start Time: <Text style={{fontSize: 25, fontWeight: '200'}}>{huntConditions == null? "":displayDate(huntConditions.starttime) +"\n" +"(" +huntConditions.starttime+ "UTC)" }</Text>{"\n"}End Time: <Text style={{fontSize: 25, fontWeight: '200'}}>: {huntConditions == null? "":displayDate(huntConditions.endtime) +"\n" +"(" +huntConditions.endtime + "UTC)" }</Text>
                </Text>
            }
            
            
            
            {huntConditions == null?
            <>
                
            </>
            :
            <>
            <Text style={{fontSize: 25, fontWeight: 'bold', textAlign:'center', marginBottom: 10}}>
                Want to update your condition? Select one of the options below
            </Text>
            </>
            }
            <TouchableOpacity onPress={()=>{setView(1);}}>
                <Text style={{fontSize: 25, fontWeight: '400', textAlign:'center',marginBottom:10}}>
                    Option 1:{"\n"} Require user to have previously visited a separate location 
                </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>{setTimePicker(true);setView(1);console.log('nickypoo', startTime, endTime)}}>
                <Text style={{fontSize: 25, fontWeight: '400', textAlign:'center',marginBottom:10}}>
                    Option 2: {"\n"} Set a time Period of visibility that the location is available
                </Text>
            </TouchableOpacity>
            
            
            {huntConditions == null? 
            <>
            </>
            :
            <>
            <AntDesign.Button backgroundColor='#FF0000' disabled={huntConditions == null} name='delete' onPress={deleteConfirmation}>
                Delete this Condition?
            </AntDesign.Button>
            </>}
            </>
            :
            <>
            {timePicker == true?
            <>
                <AntDesign.Button name='back' onPress={()=>{setView(0);setStartTime('');setEndTime('');setSpinStart(new Date());setSpinEnd(new Date());setTimePicker(false);}}>Go Back</AntDesign.Button>
                <Text style={{fontSize: 25, fontWeight: 'bold', textAlign:'center', marginBottom: 10}}>
                    Time Condition
                </Text>
                <Text style={{fontSize: 25, fontWeight: '400', textAlign:'center', marginBottom: 10}}>
                    Pick a time that this location becomes visible:{startTime==''? "(Move the picker!)": ""}
                </Text>
                <RNDateTimePicker value={spinStart} mode="time" display="spinner" onChange={(event, date) => {
                    setSpinStart(date);
                    let hours = '0';
                    let minutes = '0';
                    if (date.getUTCHours() < 10){
                        hours += date.getUTCHours();
                    }else{
                        hours = String(date.getUTCHours());
                    }
                    if (date.getUTCMinutes() < 10){
                        minutes += date.getUTCMinutes();
                    }else{
                        minutes = String(date.getUTCMinutes());
                    }
                    console.log('Start Time UTC:', hours + ':' + minutes + ':00');setStartTime(hours + ':' + minutes + ':00')}}/>
                <Text style={{fontSize: 25, fontWeight: '400', textAlign:'center', marginBottom: 10}}>
                    Pick a time that this location stops being visible:{endTime==''? "(Move the picker!)": ""}
                </Text>
                <RNDateTimePicker value={spinEnd} mode="time" display="spinner" onChange={(event, date) => {
                    setSpinEnd(date);
                    let hours = '0';
                    let minutes = '0';
                    if (date.getUTCHours() < 10){
                        hours += date.getUTCHours();
                    }else{
                        hours = String(date.getUTCHours());
                    }
                    if (date.getUTCMinutes() < 10){
                        minutes += date.getUTCMinutes();
                    }else{
                        minutes = String(date.getUTCMinutes());
                    }
                    console.log('End Time UTC:', hours + ':' + minutes + ':00');setEndTime(hours + ':' + minutes + ':00')}}/>
                <AntDesign.Button name='check' color={startTime ==''|| endTime ==''?'#808080' :'#ffffff'} disabled={startTime ==''|| endTime ==''} backgroundColor={startTime ==''|| endTime ==''? '#FF0000':'#00FF00'} onPress={async() => {setTimePicker(false);huntConditions==null? addCondition(''):updateCondition('')}}>Confirm Times</AntDesign.Button>
            </>
            :
            <>
            <AntDesign.Button name='back' onPress={()=>{setHuntCheck(!huntCheck);setView(0);}}>Go Back</AntDesign.Button>
            {locationsArr.length > 0 ?
            <>
            <Text style={{fontSize: 25, fontWeight: '200', textAlign:'center'}}>
                    Here is a scrollable list of all of your other locations: 
            </Text>
            <View style={{height:300, width: 250, alignContent: 'center'}}>
                <FlatList
                    style={{marginTop: 10, alignContent: 'center'}}
                    data = {locationsArr}
                    renderItem ={({item}) => (
                        <>
                        {String(item.locationid) == String(requiredlocationid)? <></>:
                        <TouchableOpacity
                        onPress={ () => { {handleLocationPress(item.name, item.locationid); console.log('Location Pressed', item.locationid)}} }> 
                        <View>
                            <Text style={{fontSize: 20, marginTop: 10, marginBottom: 10, textAlign:'center'}}>
                                Location: {item.name}
                            </Text>
                        </View>
                        </TouchableOpacity>  
                        } 
                        </>  
                    )}
                    keyExtractor={(item, index) => index}
                />
            </View>
            <Text style={{fontSize: 25, fontWeight: '200', textAlign:'center'}}>
                Tap on the location you want to make your current location's prerequisite condition
            </Text>
            </>
            :
            <>
            <Text style={{fontSize: 25, fontWeight: '200', textAlign:'center'}}>
                Uh oh! Looks like you don't have any other locations. Please add more locations to use this feature!
            </Text>
            </>}
            </>}
            </>}
            
        </KeyboardAvoidingView>
    )
}