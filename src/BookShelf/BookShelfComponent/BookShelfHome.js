
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {
    View, 
    Text, 
    Image, 
    StyleSheet, 
    SafeAreaView, 
    FlatList,Pressable, 
    useWindowDimensions,
    TouchableOpacity,
    TouchableWithoutFeedback

} from 'react-native';
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions';
import * as RNFS from 'react-native-fs'
import axios from 'axios';
import { HS_API_END_POINT } from '../../Shared/env';
import { setJwt,setUserInfo } from '../Store/Actions';
import { connect } from 'react-redux';


  
const BookShelfHome = ({navigation,user_info}) => {
    const {width, height} = useWindowDimensions();
    const [selectedId, setSelectedId] = useState(null);
    const [bookData, setBookData] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [removeButtonVisible, setRemoveButtonVisible] = useState(false);
    const numColumns = 4;

    const Item = ({ item, onPress, width, height,}) => (
      <View style={{
            alignItems: 'center',
            height: width > height ? responsiveScreenHeight(37) : responsiveScreenHeight(25),
            flex: 0.25
        }}>  
          <Pressable onPress={onPress} style=
              {({pressed}) => [
                styles.pressItemStyle, 
                {
                  padding: pressed ? 10 : 20,
                  width: width > height ? '75%' : '90%',     
                }
              ]}
              onLongPress={() => setRemoveButtonVisible(!removeButtonVisible)}
              >
                {
                  removeButtonVisible && <TouchableOpacity
                    style={styles.removeButton}
                    onPress={async () => {
                      setBookData(bookData.filter(data => data.id !== item.id));
                      const key = "pdf_" + item.id;
                      const storageItem = JSON.parse(await AsyncStorage.getItem(key));
                      console.log(storageItem);
                      const filePath = RNFS.DocumentDirectoryPath + "/pdf/" + storageItem.fileName;
                      const decFilePath = RNFS.TemporaryDirectoryPath + "pdf/" + storageItem.fileName + "_dec";
                      const coverFilePath = RNFS.DocumentDirectoryPath + "/pdfCover" + storageItem.coverFileName;
                      RNFS.exists(filePath).then((res) => {
                        res && RNFS.unlink(filePath);
                      });
                      RNFS.exists(decFilePath).then((res) => {
                        res && RNFS.unlink(decFilePath);
                      });
                      RNFS.exists(coverFilePath).then((res) => {
                        res && RNFS.unlink(decFilePath);
                      });
                      AsyncStorage.removeItem(key);
                      console.log(AsyncStorage.getAllKeys());
                    }}>
                      <Text style={{
                        fontSize: responsiveScreenFontSize(0.8),
                        fontWeight: '600',
                        color: 'white',
                        position: 'absolute',
                        alignSelf: 'center',
                        justifyContent: 'center',
                      }}>X</Text>
                  </TouchableOpacity>
                }
                <Image 
                  resizeMode="cover" 
                  source={item.image}
                  style={styles.image} />
                  
            </Pressable>
            <Text numberOfLines={1} style={[styles.title]}>{item.title}</Text>
        </View>
    );

    const renderItem = ({ item }) => {
      console.log(item);
      return (
        <Item
          item={item}
          width={width}
          height={height}
          onPress={() => {
            setSelectedId(item.id);
            navigation.push('ReadingBook', {
              book_id: item.id
            });
          }}

        />
      );
    };

    const refreshItems = async () => {
        setRefreshing(true);
        removeButtonVisible && setRemoveButtonVisible(false);
        var existKeys = bookData.map(data => "pdf_" + data.id);
        var existKeySet = new Set(existKeys);
        axios.get(HS_API_END_POINT+"/book-purchase/info/book-list/"+ user_info.id)
        .then(function(result){
          console.log(result._requestId);
        });
        var keys = await AsyncStorage.getAllKeys()
        console.log(keys.filter(key => key.includes("pdf_")));
        keys = keys.filter(key => !existKeySet.has(key) && key.includes("pdf_"));
        
        addData(keys);
        setRefreshing(false);
    }

    const addData = (keys) => {
        const pdfBookCoverPath = RNFS.DocumentDirectoryPath + "/pdfCover/"

        keys.forEach(async (key) => {
            const dataStr = await AsyncStorage.getItem(key);
            const item = JSON.parse(dataStr);
            console.log(key);
            console.log(item);
            if(item === null) return;
            const data = {
                id: item.book_id,
                image: {uri: pdfBookCoverPath + item.coverFileName},
                title: item.title
            }
            setBookData(bookData => [...bookData, data])
        });
    } 

    useEffect(() => {
        refreshItems();
        console.log(bookData);
    }, [])
  
    return (
      <SafeAreaView style={styles.container}>

          
        <TouchableWithoutFeedback onPress={() => removeButtonVisible && setRemoveButtonVisible(false)}>
          <View style={{alignItems: 'center', width: '100%', marginTop: '3%'}}>
            <Text style={{
              textAlign: 'left',
              width: '90%',
              marginBottom: '1%',
              fontSize: responsiveScreenFontSize(1.5),
              fontWeight: '600',
              
            }}>보관함 </Text>
            <View style={{width: '90%', borderBottomWidth: 1, borderBottomColor: 'gray'}}/>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={() => removeButtonVisible && setRemoveButtonVisible(false)}>
          <FlatList
            data={bookData}
            renderItem={renderItem}
            refreshing={refreshing}
            onRefresh={refreshItems}
            keyExtractor={(item) => item.id}
            extraData={selectedId}
            numColumns={numColumns}
            />
        </TouchableWithoutFeedback>

      </SafeAreaView>
    );
  };

  const mapStateToProps = (state) => ({
    user_info : state.userReducer.userObj
  });
  const styles = StyleSheet.create({
    bookBox: {
        margin:'5%',
        alignItems:'center',
        justifyContent: 'center'
    },
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: 30,
    },
    pressItemStyle: { 
        height: '90%',
        alignItems:'center',
        shadowColor: 'gray',
        shadowOffset: {
          width: 3,
          height: 2
        },
        shadowOpacity: 0.5,
        shadowRadius: 30
    },
    image: {
      width: '100%',
      height: '100%',
      borderWidth:1,
      borderColor: '#C2C2C2',
      borderRadius: 5

    },
    title: {
        width: '100%',
        textAlign: 'center',
        height: '10%',
        overflow: 'hidden',
        fontSize: responsiveScreenFontSize(0.9)
    },
    removeButton: {
      width: 30,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 10,
      borderRadius: 100,
      backgroundColor: 'red',
      position: 'absolute',
      alignSelf: 'flex-end',
      marginTop: 5,
      zIndex: 10
    }

})

export default connect(mapStateToProps)(BookShelfHome);

// {"config": {"adapter": [Function xhrAdapter], "data": undefined, "headers": {"Accept": "application/json, text/plain, */*"}, 
// "maxBodyLength": -1, "maxContentLength": -1, "method": "get", "timeout": 0, "transformRequest": [[Function transformRequest]], "transformResponse": [[Function transformResponse]], 
// "transitional": {"clarifyTimeoutError": false, "forcedJSONParsing": true, "silentJSONParsing": true}, 
// "url": "http://localhost:8080/book-purchase/info/book-list/1", "validateStatus": [Function validateStatus], "xsrfCookieName": "XSRF-TOKEN", "xsrfHeaderName": "X-XSRF-TOKEN"}, 
//"data": {"data": [[Object], [Object]], "message": "success", "statusEnum": "OK"}, 
//"headers": {"cache-control": "no-cache, no-store, max-age=0, must-revalidate", "connection": "keep-alive", "content-type": "application/json", "date": "Thu, 09 Dec 2021 12:50:44 GMT", "expires": "0", "keep-alive": "t
//imeout=60", "pragma": "no-cache", "transfer-encoding": "Identity", "x-content-type-options": "nosniff", "x-frame-options": "DENY", "x-xss-protection": "1; mode=block"}, "request": {"DONE": 4, "HEADERS_RECEIVED": 2, "LOADING": 3, "OPENED": 1, "UNSENT": 0, "_aborted": false, "_cachedResponse": undefined, "_hasError": false, "_headers": {"accept": "application/json, text/plain, */*"}, "_incrementalEvents": false, "_lowerCaseResponseHeaders": 
// {"cache-control": "no-cache, no-store, max-age=0, must-revalidate", "connection":
//  "keep-alive", "content-type": "application/json", "date": "Thu, 09 Dec 2021 12:50:44 GMT", "expires"
// : "0", "keep-alive": "timeout=60", "pragma": "no-cache", "transfer-encoding": "Identity", 
// "x-content-type-options": "nosniff", "x-frame-options": "DENY", "x-xss-protection": "1; mode=block"}, 
// "_method": "GET", 
// "_perfKey": "network_XMLHttpRequest_http://localhost:8080/book-purchase/info/book-list/1", "_performanceLogger": 
// {"_closed": false, "_extras": [Object], "_pointExtras": [Object], "_points": [Object], "_timespans": [Object]}, "_requestId": null,
// "_response": "{\"statusEnum\":\"OK\",\"message\":\"success\",\"data\":[{\"id\":1,\"name\":\"The Three Kingdoms 만화 삼국지 세트 (한 번은 꼭 읽어야 할 동양 최고의 고전)\"