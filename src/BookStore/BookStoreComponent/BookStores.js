import React, { useState} from 'react';
import axios from 'axios';
import {
    View, 
    Text, 
    TextInput, 
    useWindowDimensions, 
    FlatList, 
    Image, 
    Pressable, 
    ScrollView, 
    StyleSheet,
    RefreshControl
} from 'react-native';
import Modal from 'react-native-modal';
import DetailBook from './DetailBook';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import PartPurchaseView from './PartPurchaseView';
import { responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { HS_API_END_POINT } from '../../Shared/env';
import { connect } from 'react-redux';
import { getBook } from '../../Store/Actions';
import Toast from 'react-native-toast-message';

let parseString = require('react-native-xml2js').parseString;

const styles = StyleSheet.create({
    imageStyle: {
        marginHorizontal: 10,
        height: '100%',
        borderWidth: 1,
        borderColor: '#C2C2C2',
    },
    catergoryViewStyle: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    catergoryTitleStyle: {
        fontSize: responsiveScreenFontSize(1.5),
        fontWeight: '600',
        marginHorizontal: 30,
        marginTop: 25,
        marginBottom: 15
    },
    searchBarViewStyle: {
        width: '100%', 
        height: '6%', 
        alignItems: 'center', 
        marginTop: 20,
    },
    searchBarView2Style: {
        width: '90%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        display:'flex',
        flexDirection: 'row',
        borderWidth:1,
        borderColor: '#DADADA',
        borderRadius: 15,
        backgroundColor: '#E9E9E9',

    
    }
})

function BookStores({navigation, handleBookObj, bookObj, user_info}) {
    const [detailBookVisible, setDetailBookVisible] = useState(false);
    const [partBookPurchaseVisible, setPartBookPurchaseVisible] = useState(false);
    const [selectedBook, setSelectedBook] = useState({});
    const [selectedCategoryBooks, setSelectedCategoryBooks] = useState([]);
    const [selectedBookId, setSelectedBookId] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    const gotoPartPurchaseView = (currentbook) => {
        setSelectedBook(currentbook);
        setDetailBookVisible(false);
        setTimeout(function(){setPartBookPurchaseVisible(true)}, 600);
    }

    const {width, height} = useWindowDimensions();

    const onRefresh = () => {
        console.log(user_info.userType);
        setRefreshing(true);
        axios.get(`${HS_API_END_POINT}/book-purchase/book-list`)
                .then((res)=> {      
                    console.log(res.data.data);
                    handleBookObj("allBook",res.data.data);
                    handleBookObj("workBook", res.data.data.filter(item => item.category === '문제집'))
                    handleBookObj("majorBook", res.data.data.filter(item => item.category === '전공도서'))
                    handleBookObj("otherBook", res.data.data.filter(item => item.category === '기타'))
                    setRefreshing(false);
                })
                .catch((err)=> {
                    console.log(err);
                    setRefreshing(false);
            })
    }

    const [books, setBooks] = useState([
        {
            id: 0,
            name: '',
        
        },
        {
            id: 1,
            name: '',
        
        },

        {
            id: 2,
            name: '',
        
        },
        {
            id: 3,
            name: '',
        },
        {
            id: 4,
            name: '',
        
        },
        {
            id: 5,
            name: '',
        
        },

        {
            id: 6,
            name: '',
        
        },
        {
            id: 7,
            name: '',
        },

    
    ]);

    // horizontal flatlist 라서 width
    const BookStoreBookListRender = (item, index) => {
        const base64Image = 'data:image/png;base64,' + item.bookCoverResource;
        return (
            <View>
                <Pressable onPress={
                    () => {
                        setSelectedBook(item);
                        console.log(item.id);
                        setSelectedBookId(index);

                        if(item.category === "문제집")
                            setSelectedCategoryBooks(bookObj.workBook);       
                        else if(item.category === "전공도서")
                            setSelectedCategoryBooks(bookObj.majorBook);
                        else  
                            setSelectedCategoryBooks(bookObj.otherBook);
                        
                        if(item.category)
                            setDetailBookVisible(true);
                    }
                }
                style={{
                    height: '90%',     
                    width: width > height ? responsiveScreenWidth(16) : responsiveScreenHeight(16), 
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                
                    <Image 
                        resizeMode='cover'
                        source={{
                            uri: base64Image
                        }}
                        style={[
                            {
                                width: '90%'
                            },
                            styles.imageStyle
                        ]}
                    />
                </Pressable>
                <Text 
                    numberOfLines={1} 
                    style={{
                        fontSize: responsiveScreenFontSize(0.9),
                        marginTop: 5,
                        textAlign: 'center',
                        height: '10%', 
                        width: width > height ? responsiveScreenWidth(16) : responsiveScreenHeight(16), 
            
                    }}>{item.name}</Text>
            </View>
    
        );
    }

    React.useEffect(()=> {
            axios.get(`${HS_API_END_POINT}/book-purchase/book-list`)
                .then((res)=> {      
                    handleBookObj("allBook",res.data.data);
                    handleBookObj("workBook", res.data.data.filter(item => item.category === '문제집'))
                    handleBookObj("majorBook", res.data.data.filter(item => item.category === '전공도서'))
                    handleBookObj("otherBook", res.data.data.filter(item => item.category === '기타'))
                })
                .catch((err)=> {
                    console.log(err);
            })
    },[]);
    

    const handleKeyDown = (e) => {
        console.log(e.nativeEvent.text)
        console.log('enter');

        axios.get("https://openapi.naver.com/v1/search/book_adv.xml?d_isbn=9791162401712", {
            headers: {
                'X-Naver-Client-Id': '_Xy7aHXVRPYygCjxFI5y',
                'X-Naver-Client-Secret': '2Loxa7VDeL'
            }
        }

      
        ).then((res)=> {
            //console.log(res.data);
            parseString(res.data, function(err, result) {
               // console.log(result);
                console.log(JSON.parse(JSON.stringify(result)).rss.channel[0].item[0].author);
            })
        });
    }

    return (
        <View style={{
            width: '100%',
            height: '100%'
        }}>
        <ScrollView 
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                style={{
                backgroundColor: 'white',
                width: '100%',
            }}>

            <View style={styles.catergoryViewStyle }>
                <View style={styles.searchBarViewStyle}> 

                    <View style={styles.searchBarView2Style}>
                        <TextInput
                            onSubmitEditing={handleKeyDown}
                            placeholder="검색..."
                            style={{
                                width: '90%',
                                height: '100%',
                            }}>
                        </TextInput>   
                        <MaterialCommunityIcons name="magnify" size={20} />
                    </View>
                </View>
                <Text style={styles.catergoryTitleStyle}>
                    문제집
                </Text>
                <View style={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: '100%',
                    height: width > height ? responsiveScreenHeight(30) : responsiveScreenWidth(30),
                }}>    
                
                      <FlatList
                        horizontal
                        data={bookObj.workBook.length > 0 ? bookObj.workBook : books}
                        renderItem={({item,index})=> BookStoreBookListRender(item, index)}
                        keyExtractor={(item,index)=> item.id.toString()} />
                     
                    
                </View>

                <View style={{
                    width: '100%',
                    borderBottomWidth: 1,
                    marginTop: 50,
                    marginBottom: 20,
                    borderBottomColor: '#EAEAEA'
                }}/>

                <Pressable style={{
                    marginHorizontal: 25,
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'row'
                }}>
                    <Text style={{
                        fontSize: responsiveScreenFontSize(0.8)
                    }}> 
                        모두 보기
                    </Text>
                    <MaterialCommunityIcons name="chevron-right" size={27} />
                    
                </Pressable>

            </View>
            <View style={styles.catergoryViewStyle }>
                <Text style={[
                    styles.catergoryTitleStyle,
                    {
                        marginTop: 50
                    },
                 
                ]}>
                    전공 서적
                </Text>
                <View style={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: '100%',
                    height: width > height ? responsiveScreenHeight(28) : responsiveScreenWidth(28),
                   
                }}>

                      <FlatList
                        horizontal
                        data={bookObj.majorBook.length > 0 ? bookObj.majorBook : books}
                        renderItem={({item,index})=> BookStoreBookListRender(item, index)}
                        keyExtractor={(item,index)=> item.id.toString()}
                    /> 
                </View>

                <View style={{
                    width: '100%',
                    borderBottomWidth: 1,
                    marginTop: 50,
                    marginBottom: 20,
                    borderBottomColor: '#EAEAEA'
                }}/>

                <Pressable style={{
                    marginHorizontal: 25,
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'row'
                }}>
                    <Text style={{
                        fontSize: responsiveScreenFontSize(0.8)
                    }}> 
                        모두 보기
                    </Text>
                    <MaterialCommunityIcons name="chevron-right" size={27} />
                    
                </Pressable>



            </View>
            <View style={styles.catergoryViewStyle }>
                <Text style={[
                    styles.catergoryTitleStyle,
                    {
                        marginTop: 50
                    },
                 
                ]}>
                    기타
                </Text>
                <View style={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: '100%',
                    height: width > height ? responsiveScreenHeight(28) : responsiveScreenWidth(28),
                   
                }}>
                    <FlatList
                        horizontal
                        data={bookObj.otherBook.length > 0 ? bookObj.otherBook : books}
                        renderItem={({item,index})=> BookStoreBookListRender(item, index)}
                        keyExtractor={(item,index)=> item.id.toString()}
                    />
                </View>

                <View style={{
                    width: '100%',
                    borderBottomWidth: 1,
                    marginTop: 50,
                    marginBottom: 20,
                    borderBottomColor: '#EAEAEA'
                }}/>

                <Pressable style={{
                    marginHorizontal: 25,
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'row'
                }}>
                    <Text style={{
                        fontSize: responsiveScreenFontSize(0.8)
                    }}> 
                        모두 보기
                    </Text>
                    <MaterialCommunityIcons name="chevron-right" size={27} />
                    
                </Pressable>
            </View>

    
            <Modal 
                isVisible={detailBookVisible}
                useNativeDriver={true}
                style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
                onBackdropPress={()=> setDetailBookVisible(false)}
                hideModalContentWhileAnimating={true} 
                onSwipeComplete={()=>setDetailBookVisible(false)}
                animationIn= "zoomInDown"
                animationOut="zoomOutUp">
                   
                <TouchableOpacity 
                        onPress={() => setDetailBookVisible(false)} style={{margin: 5}}>
                        <Icon name="times-circle" size={30} color="white" />
                </TouchableOpacity>
                <DetailBook gotoSecond={gotoPartPurchaseView} 
                            book={selectedBook} 
                            selectedBookObj={selectedCategoryBooks}
                            selectedBookId={selectedBookId}/>
                

            </Modal>

            <Modal 
                isVisible={partBookPurchaseVisible}
                useNativeDriver={true}
                style={{ 
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
                onBackdropPress={()=> setPartBookPurchaseVisible(false)}
                hideModalContentWhileAnimating={true} 
                onSwipeComplete={()=>setDetailBookVisible(false)}>
               
                <TouchableOpacity 
                        onPress={() => setPartBookPurchaseVisible(false)} style={{margin: 5}}>
                        <Icon name="times-circle" size={30} color="white" />
                </TouchableOpacity>

                <PartPurchaseView  selectedBook={selectedBook}/>

      
            </Modal>
        
        </ScrollView>

        {user_info.userType === "ROLE_SELLER" &&
            <Pressable 
                style={({pressed}) => [
                {
                    backgroundColor: pressed ? '#121212' : 'black',
                }, 
                {
                    width: 70,
                    height: 70,
                    borderRadius: 50,
                    justifyContent: 'center',
                    alignItems:'center',
                    position: 'absolute',
                    bottom: 20,
                    right: 20
                }]}
                onPress={()=> {
                    navigation.push('BookRegister');
                }}>

            
                <Text style={{
                    color: 'white',
                    fontSize: responsiveScreenFontSize(2),
                    textAlign: 'center',
                }}>+</Text>
            </Pressable>
        }

        </View>
  
    );


}


const mapStateToProps = (state) => ({
    bookObj: state.getBooks.bookObj,
    user_info : state.userReducer.userObj
});

const mapDispatchToProps = (dispatch) => ({
    handleBookObj: (key, value) => dispatch(getBook(key, value))
});

export default connect(mapStateToProps, mapDispatchToProps)(BookStores);