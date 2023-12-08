import { View, Text, Button, Alert, KeyboardAvoidingView, TouchableOpacity, FlatList } from "react-native"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { styles } from "./styles.js";
import AntDesign from '@expo/vector-icons/AntDesign';
import { removeToken } from "./slices.js";
import { useIsFocused } from "@react-navigation/native"
import RNDateTimePicker from "@react-native-community/datetimepicker";

export default function ConditionsPage({navigation, route}){  
    const dispatch = useDispatch();
    const token = useSelector(state => state.token.tokens);
    const [Hunt] = useState(route.params.hunt);
    const [myHunts, setMyHunts] = useState([]);
    // const [locationsArr, setLocationsArr] = useState([])
    const [huntLocation] = useState(route.params.location);
    const [huntLocations] = useState(route.params.huntLocations)
    const [parentLocationIDS] = useState(route.params.parentLocationIDS)
    const isFocused = useIsFocused();
    //conditions from getconditions should be taken as data.conditions
    const [huntConditions, setHuntConditions] = useState([]);
    const [updateCheck, SetUpdateCheck] = useState(false);

    const [spinStart, setSpinStart] = useState(new Date());
    const [spinEnd, setSpinEnd] = useState(new Date());
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [selectedCondition, setSelectedCondition] = useState(-1)
    const [selectedConditionID, setSelectedConditionID] = useState(-1)

    const[periodCondition, setPeriodCondition] = useState(false);
    const[periodIndex, setPeriodIndex] = useState(0);

    const [view, setView] = useState(0);
    const [updateScreen, setUpdateScreen] = useState(false);
    const [timePicker, setTimePicker] = useState(false);
    const [huntCheck, setHuntCheck] = useState(false);

    
    const disableTime =() =>{
        for (let i = 0; i < huntConditions.length; i++){
            if (huntConditions[i].requiredlocationid == null){
                return true;
            }
        }
        return false;
        }


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
        setSelectedCondition(-1);
        setPeriodCondition(false);

            console.log('Fetching Hunt conditions... (useEffect1)')
            console.log('Hunt:', Hunt)
            console.log('huntLocation:', huntLocation);
            console.log('current conditions:', huntConditions)
            let formData = new FormData();
            formData.append('token', token[0]);
            formData.append('locationid', huntLocation.locationid);
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
                    console.log('data.conditions on cond screen:' , data.conditions)
                    setHuntConditions(data.conditions);
                    if (data.conditions[0] != null){
                        let i = 0;
                    for (let condition of data.conditions){
                        if (condition.requiredlocationid == null){
                            setPeriodCondition(true);
                            setPeriodIndex(i)
                        }
                        i++;
                    }
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
            // setLocationsArr([]);
            let tempLA = [];
            console.log('load these hunts:', loadHunts);
            console.log('fetching locations of those hunts')
    })()
    }, [huntCheck]);


    const handleLocationPress = async (name, value) =>{
        Alert.alert('ARE YOU SURE?', "You are choosing the location \'" + name + "' as the required location", [
            {text: 'Confirm', onPress:async() => {updateScreen == true? updateCondition(value) : addCondition(value)}},
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
        console.log('update entered for condition:', selectedCondition)
        let formData = new FormData();
        formData.append('token', token);
        formData.append('conditionid', selectedConditionID);
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

                setUpdateScreen(false);
                setSelectedCondition(-1);
                setSelectedConditionID(-1);
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
    Alert.alert('ARE YOU SURE?', 'If you delete this Condition, (' + selectedCondition + '), you will have to set it again.', [
        {text: 'Confirm', onPress:async() => {deleteCondition()}},
        {text: 'Cancel', onPress:()=>{console.log('Cancel Pressed')}, style: 'cancel'}
    ]);
    const deleteCondition = async () =>{
        console.log('Deleting Hunt...');
        let formData = new FormData();
        formData.append('token', token[0]);
        formData.append('conditionid', selectedConditionID);
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
                setStartTime('');
                setEndTime('');
                SetUpdateCheck(!updateCheck);

                setHuntCheck(!huntCheck);
                setUpdateScreen(false);
                setSelectedCondition(-1);
                setSelectedConditionID(-1);

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
            <Text style={{fontSize: 25, fontWeight: '400', textAlign:'center', marginBottom:10}}>
                Location Name: <Text style={{fontSize: 25, fontWeight: '200'}}>{huntLocation.name}</Text>
            </Text>
            <Text style={{fontSize: 25, fontWeight: '400', textAlign:'center', marginBottom: 10}}>
                Conditions:
            </Text>
            <View style={{height:275, width: 250, alignContent: 'center'}}>
            <FlatList
                    style={{marginTop: 10, alignContent: 'center'}}
                    data = {huntConditions}
                    renderItem ={({item, index}) => (
                    <TouchableOpacity
                        onPress={ () => {console.log('condition pressed', index + 1, item.conditionid, huntConditions[index]);setSelectedCondition(index);setSelectedConditionID(item.conditionid);setUpdateScreen(true);}}> 
                        <View>
                            <Text style={{fontSize: 20, marginTop: 10, marginBottom: 10, textAlign:'center'}}>
                                <Text style={{fontWeight:'bold'}}>{index}:</Text> {item.requiredlocationid == null? "Start: " + displayDate(item.starttime) +"\nEnd: " + displayDate(item.endtime):"Required location: " + (huntLocations.find((element) => element.locationid == item.requiredlocationid))? (huntLocations.find((element) => element.locationid == item.requiredlocationid)).name: ""}
                            </Text>
                        </View>
                    </TouchableOpacity>   
                )}
                keyExtractor={(item, index) => index}
                />
            </View>
            
            
            {huntConditions.length > 0? 
            <Text style={{fontSize: 25, fontWeight: 'bold', textAlign:'center', marginBottom: 10}}>
                {selectedCondition == -1? "Select one of your conditions to update or delete it. Add more conditions below:":<TouchableOpacity onPress={()=>{setUpdateScreen(false);setSelectedCondition(-1);setSelectedConditionID(-1);}}><Text style={{fontSize: 25, fontWeight: 'bold', textAlign:'center', marginBottom: 10}}>Select one of the options below to update this condition ({selectedCondition}) with. (Tap this to deselect)</Text></TouchableOpacity>}
            </Text>:<Text style={{fontSize: 25, fontWeight: 'bold', textAlign:'center', marginBottom: 10}}>
                Select one of the options below to add a condition of that type.
            </Text>}
            
            
        {disableTime() == true?
        <>
        <TouchableOpacity onPress={()=>{setView(1)}}>
            <Text style={{fontSize: 25, fontWeight: '400', textAlign:'center',marginBottom:10}}>
                Option 1:{"\n"}Require user to have previously visited a separate location 
            </Text>
        </TouchableOpacity>
        {periodCondition == false?
        <>
        <TouchableOpacity onPress={()=>{setTimePicker(true);setView(1);console.log('viewing timepicker')}}>
            <Text style={{fontSize: 25, fontWeight: '400', textAlign:'center',marginBottom:10}}>
                Option 2: {"\n"}Set a time Period of visibility that the location is available
            </Text>
        </TouchableOpacity>
        </>
        :
        
        <>
        {selectedCondition == periodIndex? 
        <TouchableOpacity onPress={()=>{setTimePicker(true);setView(1);console.log('viewing timepicker')}}>
            <Text style={{fontSize: 25, fontWeight: '400', textAlign:'center',marginBottom:10}}>
                Option 2: {"\n"}Set a time Period of visibility that the location is available
            </Text>
        </TouchableOpacity>
        :
        <Text style={{fontSize: 25, fontWeight: '400', textAlign:'center',marginBottom:10}}>
                Option 2 DISABLED:{"\n"}You can only have one start and end time.
        </Text>

    }
        </>
        }
        </>
        :
        <>
        <TouchableOpacity onPress={()=>{setView(1)}}>
            <Text style={{fontSize: 25, fontWeight: '400', textAlign:'center',marginBottom:10}}>
                Option 1:{"\n"}Require user to have previously visited a separate location 
            </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>{setTimePicker(true);setView(1);console.log('viewing timepicker')}}>
            <Text style={{fontSize: 25, fontWeight: '400', textAlign:'center',marginBottom:10}}>
                Option 2: {"\n"}Set a time Period of visibility that the location is available
            </Text>
        </TouchableOpacity>
        </>

            }
            
            <AntDesign.Button backgroundColor={updateScreen == false? '#FFFFFF':'#FF0000'} disabled={updateScreen == false} name='delete' onPress={deleteConfirmation}>
                Delete this Condition?
            </AntDesign.Button>
            
            </>
            :
            <>
            {timePicker == true?
            <>
                <AntDesign.Button name='back' onPress={()=>{setView(0);setStartTime('');setEndTime('');setSpinStart(new Date());setSpinEnd(new Date());setTimePicker(false);}}>Go Back</AntDesign.Button>
                <Text style={{fontSize: 25, fontWeight: 'bold', textAlign:'center', marginBottom: 10, marginTop:20}}>
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
                <AntDesign.Button name='check' color={startTime ==''|| endTime ==''?'#808080' :'#ffffff'} 
                disabled={startTime ==''|| endTime ==''|| updateScreen == true? false:disableTime()} backgroundColor={startTime ==''|| endTime ==''? '#FF0000':'#00FF00'} 
                onPress={async() => {setTimePicker(false); 
                if(updateScreen == true){
                    console.log('updatescreen true')
                    updateCondition('')
                }else{
                    console.log('updatescreen false')
                    addCondition('');
                }}}>Confirm Times</AntDesign.Button>
            </>
            :
            <>
            <AntDesign.Button name='back' onPress={()=>{setHuntCheck(!huntCheck);setView(0);}}>Back to Conditions</AntDesign.Button>
            {huntLocations.length > 1 ?
            <>
            <Text style={{fontSize: 25, fontWeight: '200', textAlign:'center', marginTop:20}}>
                    Here is a scrollable list of your other available locations:
            </Text>
            <View style={{height:300, width: 300, alignContent: 'center'}}>
                <FlatList
                    style={{marginTop: 10, alignContent: 'center'}}
                    data = {huntLocations}
                    renderItem ={({item, index}) => (
                        <>
                        {parseFloat(item.locationid) == parseFloat(huntLocation.locationid) || (huntConditions.find((element)=>element.requiredlocationid == parseFloat(item.locationid))) || parentLocationIDS.find(element => parseFloat(element) == parseFloat(item.locationid)) ?
                        <>
                        </>
                        :
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
                <Text style={{fontSize: 25, fontWeight: 'bold', textAlign:'center', marginTop:20}}>Unavailable locations:{"\n"}<Text style={{fontSize: 25, fontWeight: '200', textAlign:'center'}}>Locations with requiring the current location, or this location's current required locations.</Text></Text>
            
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