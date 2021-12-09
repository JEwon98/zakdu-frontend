import React, {useState, useEffect} from 'react';
import {ActivityIndicator, View, StyleSheet, Image} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector,useDispatch } from 'react-redux';
import LottieView from 'lottie-react-native';
import { Dimensions,Text } from 'react-native';
import axios from 'axios';
import { HS_API_END_POINT } from '../Shared/env';
import { setJwt,setUserInfo } from '../Store/Actions';
import { connect } from 'react-redux';
const screenWidth = Dimensions.get('screen').width;
const screenHeight = Dimensions.get('screen').height;
const bigOne = screenWidth > screenHeight ? screenWidth:screenHeight;
const smallOne = screenWidth < screenHeight ? screenWidth:screenHeight;

const SplashScreen = ({navigation,handleUserInfo,user_info}) => {
  //State for ActivityIndicator animation
  const [animating, setAnimating] = useState(true);

  useEffect(() => {
    setTimeout(async () => {
      setAnimating(false);
      //Check if user_id is set or not
      //If not then send for Authentication
      //else send to Home Screen
      //AsyncStorage.clear();
      
      AsyncStorage.getItem('user_jwt', async (err,result) =>{
        console.log("error",err);
        console.log("result",result);
        if(result == null){
          navigation.replace('Auth');
        } else{
            console.log("result",result);
            await axios.get(`${HS_API_END_POINT}/user/my-info`,{
              headers: {
                'Authorization' : "Bearer " + result
              }
            }).then(function(value){
              console.log("result.data  ",value.data.username);
              handleUserInfo(value.data);
              navigation.replace('BottomNav');
            })
            .catch(function(error){
              navigation.replace('Auth');
            });
              //console.log("res: ",res);
        }
        //navigation.replace(value === null ? 'Auth' : 'BottomNav');
      }
      );
    }, 1000);
  }, []);

  return (
    <View style={styles.container}>
      {/* <Image
        source={require('../src/viva-logo-with-txt.png')}
        style={{width: screenWidth*0.5, resizeMode: 'contain', margin: 30}}
      /> */}
      <LottieView style={{flex:3}} source={require('../Assets/json/9844-loading-40-paperplane.json')} autoPlay loop />
      <View style={{height:screenHeight*0.4,alignSelf:'flex-end'}}>
        <Text style={{ textAlign:'center', fontSize:bigOne*0.03, fontWeight:'bold'}}>Flying to ZakDu ...</Text>
      </View>
    </View>
  );
};
const mapDispatchToProps = (dispatch) => ({
  handleJwtResult: (value)=>  dispatch(setJwt(value)),
  handleUserInfo: (value) => dispatch(setUserInfo(value)),
});

const mapStateToProps = (state) => ({
  user_info : state.userReducer.userObj
});

export default connect(mapStateToProps, mapDispatchToProps)(SplashScreen);

const styles = StyleSheet.create({
  container: {
      flexDirection:'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  activityIndicator: {
    alignItems: 'center',
    height: 80,
  },
});