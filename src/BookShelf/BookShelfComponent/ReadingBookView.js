import React, {useRef, useState, useEffect} from 'react';
import { View, useWindowDimensions, StyleSheet, Pressable, TextInput, Button, Image} from 'react-native';
import Pdf from 'react-native-pdf';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Modal from  'react-native-modal';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import PageJumpSelectView from './PageJumpSelectView'
import * as RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {decryptPages, decryptEpub} from '../decrypt/decrypter';


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',  
    },
    pdf: {
        flex:1,
        width: '100%',
        height: '100%'
    },
    HeaderBackIconStyle: {
        marginHorizontal: 12
    }
});

const getPageMap = (pages, realStartPage, totalPage) => {
    let idx = 0;
    let pageMap = {};

    for (let i = realStartPage - 1; i < totalPage; i++) {
        var currentPage = pages[idx];
        if(currentPage == i && pageMap[i - realStartPage + 1] == idx + realStartPage) {
            idx++;
        }
        pageMap[i - realStartPage + 2] = idx + realStartPage;
        if (currentPage == i) {
            idx++;
        }
    }
    console.log(pageMap);
    return pageMap;
}

function ReadingBookView({route, navigation}) {
    const {height, width} = useWindowDimensions();
    const [pageModalVisible, setPageModalVisible] = useState(false);
    const pdfRef = useRef(null);

    const [source, setSource] = useState({ uri: "" });
    const [pageMap, setPageMap] = useState({});
    const [fileExist, setFileExist] = useState(false);

    useEffect(() => {
        // 보관함에 책 눌렀을 때 책 정보에서 받아와야 함
        const {book_id} = route.params
        const storageKey = "pdf_" + book_id;
        console.log(storageKey)

        AsyncStorage.getItem(storageKey).then(async (item) => {
            if(item != null) {
                var itemData = JSON.parse(item);
                console.log(itemData);
                console.log(RNFS.DocumentDirectoryPath + "/pdf/" + itemData.fileName);
                setPageMap(getPageMap(itemData.keys.map(key => key.pageNum), itemData.realStartPage, itemData.totalPage));
                decryptPages(RNFS.DocumentDirectoryPath + "/pdf/" + itemData.fileName, itemData.keys, itemData.realStartPage)
                    .then(() => {
                        console.log(RNFS.TemporaryDirectoryPath + "pdf/" + itemData.fileName + "_dec");
                        setSource({uri: RNFS.TemporaryDirectoryPath + "pdf/" + itemData.fileName + "_dec"});
                    });
            }
        }).catch(e => {
            // 파일이 없는 경우 처리 필요
            console.log("파일이 존재하지 않습니다.");
            console.log(e);
            navigation.goBack();
        });
    }, []);

    React.useLayoutEffect(() => {     
        navigation.setOptions({       
            headerLeft: ()=> {
                return(
                    <View style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}> 
                        <Pressable style={styles.HeaderBackIconStyle} onPress={()=> {
                            navigation.goBack()
                        }}>
                            <MaterialCommunityIcons name="chevron-left" size={38} />
                        </Pressable>

                        <Pressable style={styles.HeaderBackIconStyle} onPress={()=> setPageModalVisible(true)}>
                            <MaterialCommunityIcons name="dock-window" size={27} />
                        </Pressable>

                        <View style={{
                            alignItems:'center',
                            marginHorizontal: 12,
                            display: 'flex',
                            flexDirection: 'row',
                        }}>
                            <TextInput
                                placeholder="이동할 페이지를 입력하세요."
                                style={{
                                    borderWidth: 1,
                                    borderRadius: 10,
                                    height: '30%',
                                    width: '50%',
                                    marginRight: 10,
                                    padding: 5,
                                    
                                    shadowColor: "#000",
                                    shadowOffset: {
                                      width: 1,
                                      height: 2,
                                    },
                                    shadowOpacity: 0.4,
                                    shadowRadius: 1,
                                    
                                    
                                   
                                }}

                                onSubmitEditing={(e)=> {
                                    if(!isNaN(e.nativeEvent.text) && Number.isInteger(parseInt(e.nativeEvent.text))) {
                                        console.log(pageMap);
                                        console.log(pageMap[parseInt(e.nativeEvent.text)]);
                                        const page = pageMap[parseInt(e.nativeEvent.text)];
                                        if(page !== undefined) {
                                            pdfRef.current.setPage(parseInt(pageMap[parseInt(e.nativeEvent.text)]));
                                        }
                                    }else {
                                        console.log('숫자가아님')
                                    }
                                }}
                                keyboardType="numeric">
                                
                            </TextInput>  
                        </View>
                    </View>
                )
            },
            headerRight: ({})=> {
                return(
                    <View>
                        <Pressable style={styles.HeaderBackIconStyle}>
                            <MaterialCommunityIcons name="format-list-bulleted" size={27} />
                        </Pressable>
                    </View>
                )
            }
        });   
    }, [navigation, pageMap]);

    return (
        <View style={{
            width: '100%',
            height: '100%'
        }}>
     
            <View style={styles.container}>
               
                <Pdf
                    ref={pdfRef}
                    source={source}
                    onLoadComplete={(numberOfPages,filePath, Dimension, TableOfContent)=>{
                        console.log("Number of Pages: "+numberOfPages);
                        console.log("Path: :"+filePath);
                        console.log("Width & Height: "+JSON.stringify(Dimension));
                        console.log("Table of Content is an Object: "+TableOfContent);
                    }}
                    onPageChanged={(page,numberOfPages) => {
                        console.log(`Current page: ${page}`);
                    }}
                    onError={(error) => {
                        console.log(error);
                    }}
                    onPressLink={(uri) => {
                        console.log(`Link pressed: ${uri}`);
                    }}
                    style={styles.pdf}
                    horizontal={width > height ? true : false}
                    enablePaging={true}/>

            </View>

            <Modal 
                isVisible={pageModalVisible}
                useNativeDriver={true}
                style={{ 
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
                onBackdropPress={()=> setPageModalVisible(false)}>
               
                <Pressable
                        onPress={() => setPageModalVisible(false)} style={{margin: 5}}>
                        <Icon name="times-circle" size={30} color="white" />
                </Pressable>

                <PageJumpSelectView pdfRef={pdfRef} pdfSource={source} setModalVisible={setPageModalVisible}/>
      
            </Modal>
        </View>
    );
}

export default ReadingBookView;