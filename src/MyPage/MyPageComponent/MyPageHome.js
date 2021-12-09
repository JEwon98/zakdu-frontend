import React, {useState} from 'react';
import { createStackNavigator, createAppContainer } from "react-navigation";
import {StyleSheet, ScrollView, TouchableOpacity, Button, View, Text,Image } from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { responsiveFontSize } from 'react-native-responsive-dimensions';
import { connect } from 'react-redux';
import { setJwt } from '../../Store/Actions';



function MyPageHome({navigation,user_info,user_email}) {
    const [username,setUsername] = useState("");
    const [point,setPoint] = useState("");

    // AsyncStorage.getItem('user_information', (err, result) => {
    //     const UserInfo = JSON.parse(result);
    //     console.log("mypage UserInfo : ",UserInfo);
    //     setUsername(UserInfo.user_name);    
    //     setPoint(UserInfo.user_point);    
    // });
    console.log("user_name: ",user_info)
    const logOut = () => {
        AsyncStorage.setItem('user_jwt',null);
        navigation.replace('Auth');
    }
    

    const originname='';
    return (
        <View style={styles.mainView} >
            <TouchableOpacity 
                style={styles.profiles}
                onPress={() => navigation.navigate('Profiles',{originname:username})} 
            >
                <Image 
                style={{width:'50%',height:'50%',resizeMode:'contain',margin:10}}
                source={require('../../Assets/images/profileImg.png')} />
                <Text
                    style={styles.mainText}
                >
                    {user_info.username}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={{
                    ...styles.innerView, 
                    alignItems:'center', 
                    flexDirection:'row', 
                    justifyContent:'center',
                }}
            >
                <Text style={{...styles.text, flex:1}}>잔여 포인트</Text>
                <Text style={{...styles.text, flex:1, textAlign:'right', paddingRight:20}}>{user_info.point} P</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.innerView}
                onPress={() => navigation.navigate('PersonalInfo',{originname:username})}
            >
                <Text style={styles.text}>개인정보 설정</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.innerView}
                onPress={() => navigation.navigate('PurchaseHistory')}
            >
                <Text style={styles.text}>구매 내역</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.innerView}
                onPress={logOut}
            >
                <Text style={styles.text}>로그 아웃</Text>
            </TouchableOpacity>
            
            
            

        </View>
    );
}

const styles = StyleSheet.create({
    mainView: {
        flex:1,
        alignItems: 'center',
        //justifyContent: 'center'
    },
    profiles: {
        flex:4,
        width:'100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainText: {
        fontSize:responsiveFontSize(1.5)
    },
    innerView: {
        flex:1,
        width:'100%',
        borderTopWidth: 1,
        borderTopColor: 'black',
        justifyContent: 'center',
        alignItems:'flex-start'
    },
    text: {
        marginLeft:20,
        fontSize:20
    }
})
const mapDispatchToProps = (dispatch) => ({
    handleJwtResult: (value)=>  dispatch(setJwt(value)),
    handleUserInfo: (value) => dispatch(setUserInfo(value)),
});

const mapStateToProps = (state) => ({
    user_info : state.userReducer.userObj,
    user_email : state.userReducer.userObj.user_email,
});
export default connect(mapStateToProps, mapDispatchToProps)(MyPageHome);