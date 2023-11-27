import { View, Text, TextInput, Button, Alert, KeyboardAvoidingView, TouchableOpacity, ScrollView } from "react-native"
import { useEffect, useState, useRef } from "react"
import { useDispatch, useSelector } from "react-redux";
import { styles } from "./styles.js";
import AntDesign from '@expo/vector-icons/AntDesign';
import { removeToken } from "./slices.js";
export default function LocationPage({navigation, route}){
    const dispatch = useDispatch();
    const token = useSelector(state => state.token.tokens);
    return(
        <KeyboardAvoidingView>
            <Text>Conditions Screen:</Text>
        </KeyboardAvoidingView>
    )
}