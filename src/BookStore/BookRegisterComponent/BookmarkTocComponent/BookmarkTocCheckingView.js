
import React, {useState} from 'react';
import {View, Text,useWindowDimensions, Pressable, TextInput, StyleSheet} from 'react-native';
import {responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth} from 'react-native-responsive-dimensions';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import HeaderBackButton from '../../../Common/CommonComponent/HeaderBackButton';
import BasisButtonComponent from '../BasisButtonComponent';
import { registerBook } from '../../../Store/Actions';
import {connect} from 'react-redux';
import DraggableFlatList from 'react-native-draggable-flatlist';


export const tocCheckingStyles = StyleSheet.create({
    buttonStyle: {
        shadowOffset: {
            width: 3,
            height: 2
        },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        shadowColor: 'gray',
        width: '30%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    buttonTextStyle: {
        color: 'black',
        fontSize: responsiveScreenFontSize(0.9), 
        fontWeight: '600' 
    },
    pageInput: {
        textAlign: 'center',
        backgroundColor: '#CDCDCD',
        borderRadius: 10,
        color: 'white',
        width: '40%',   
        marginRight: 20,
        fontSize: responsiveScreenFontSize(1),
    }
})


function BookmarkTocCheckingView({navigation, handleTocResult, handleMarkExist ,bookTocResult}) {

    const {width ,height} = useWindowDimensions();
    const [editable, setEditable] = useState(false);
    const [test, setTest] = useState(Math.random());
    const [pageEditable, setPageEditable] = useState(false);

    React.useLayoutEffect(() => {     
        navigation.setOptions({       
            headerStyle: {
                backgroundColor: 'white',
            },
            headerLeft: ()=> {
                return(
                    <HeaderBackButton navigation={navigation}/>
                );
            },
        });   
    }, [navigation]);

    React.useEffect(()=> {
        handleMarkExist(true);
    }, [])

    const HierarchyDataRender = (items, drag, isActive, index) => {
        const onPlusPress = () => {
            if(items.childs) {
                items.childs = [...items.childs, {
                    id: Math.random(),
                    text: '',
                    startPage: 0,
                    endPage: 0,
                    childs: null
                }]
            } else {
                items.childs = [{
                    id: Math.random(),
                    text: '',
                    startPage: 0,
                    endPage: 0,
                    childs: null,
                }]
            }
            setTest(Math.random());
         }

         const onMinusPress = (index) => {
            console.log(items.text);

            if(items.parent){
                console.log('부모:' + items.parent.text);
                let childList = items.childs;
                items.parent.childs.splice(index, 1);

                if(childList) {
                    childList.map(
                        c => c.parent = items.parent
                    );
                   items.parent.childs = items.parent.childs.slice(0, index)
                                                            .concat(childList)
                                                            .concat(items.parent.childs.slice(index));
                }
                     
            } else {
                bookTocResult.splice(index, 1); 
                let childList = items.childs;
                if(childList) {
                    childList.map(
                        c => c.parent = null
                    );
                    
                   bookTocResult = bookTocResult.slice(0, index)
                                                            .concat(childList)
                                                            .concat(bookTocResult.slice(index));

                    handleTocResult(bookTocResult);
                }
            }
            setTest(Math.random());
         }

        return(
        
            <View 
                style={[
                    {
                        borderWidth: isActive ? 2 : 0,
                        borderRadius: isActive ? 15 : 0,
                        borderColor: isActive ? 'red': null
                    },
                    {
                    width: '90%',
                    marginHorizontal: 20, 
                    marginVertical: 10
                     }
            ]}  
                key={index}>    
                        <View style={[
                            {
                                paddingVertical: 10,
                                width: '100%',
                                display:'flex', 
                                flexDirection: 'row',
                                borderBottomWidth: 1,
                                borderColor: 'gray',
                                alignItems: 'center'
                            }
                        ]}>  
                                <MaterialCommunityIcons name="circle-medium" size={24}/>

                             
                                <View style={{
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                         
                      
                                }}>
                                <TextInput 
                                            editable={editable}
                                            onChangeText={(text)=>{
                                                items.text = text;
                                                console.log(text);
                                                setTest(Math.random());
                                            }}
                                            value={items.text}
                                            style={{
                                            width: '70%',
                                                
                                            fontSize: responsiveScreenFontSize(1),      
                                        }}>
                                </TextInput>
                                
                                {pageEditable && editable?
                                <View style={{
                                    width: '30%',
                                    display: 'flex',
                                    flexDirection: 'row'
                                }}>
                                    <TextInput
                                            editable={editable}
                                            value={items.startPage.toString()}
                                            onChangeText={(text)=>{

                                                if(text == "") {
                                                    items.startPage = 0;
                                                }else {
                                                    items.startPage = parseInt(text);
                                                    console.log(text);
                                                }
                                                setTest(Math.random());
                                            }}
                                            style={tocCheckingStyles.pageInput}
                                    /> 
                              

                                    <TextInput
                                            editable={editable}
                                            value={items.endPage.toString()}
                                            onChangeText={(text)=>{
                                                if(text == "") {
                                                    items.endPage = 0;
                                                }else {
                                                    items.endPage = parseInt(text);
                                                    console.log(text);
                                                }
                                                setTest(Math.random());
                                            }}
                                            style={tocCheckingStyles.pageInput}
                                    />
         
                                    
                                </View>: null }
         
                            
                                {editable && !pageEditable ?
                                <View style={{
                                    height: '100%',
                                    width: '30%',
                                    display: 'flex',
                                    flexDirection: 'row',           
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                   
                                    <MaterialCommunityIcons name="plus-circle-outline" size={24} 
                                        onPress={()=> onPlusPress(index)}
                                        color={isActive ? 'red': 'gray'}
                                        style={{marginHorizontal: 10}}
                                    />
                                    
                                    <MaterialCommunityIcons name="backspace-outline" size={22} 
                                        color={isActive ? 'red': 'gray'} 
                                        onPress={()=> onMinusPress(index)}
                                        style={{marginHorizontal: 10}}
                                    />
                                                                     
                                    <MaterialCommunityIcons name="menu" size={22} 
                                        onLongPress={drag}
                                        style={{marginHorizontal: 10}}
                                        color={isActive ? 'red': 'gray'}
                                    />
                                   
                                </View> : null}
                                </View> 

                         
                                
                        </View>
        
                        {items.childs ? 
                            <View style={{
                                        width: '100%',
                                        display: 'flex',
                                        flexDirection: 'row',                                    
                            }}>
                                <DraggableFlatList
                                    scrollEnabled={false}
                                    data={items.childs}
                                    onDragEnd={({ data }) => {
                                        items.childs = data;
                                        setTest(Math.random());
                        
                                    }}
                                    keyExtractor={(item, index) => index.toString()}
                                    listKey={(item, index)=> 'D' + index.toString()}
                                    renderItem={({ item, drag, isActive, index }) => {
                                      
                                        if(!item.parent) {
                                            item.parent = items;
                                        }

                                        return (
                                        <View style={{
                                            width: '100%',
                                            display: 'flex',
                                            flexDirection: 'row',
                                        }}>
                                    
                                        {HierarchyDataRender(item, drag, isActive, index)}
                                      
                                        </View>);
                                    }}
                                />  
                         

                            </View>
                            :
                            null
                        }  
             
            </View>

        );
    }


    return (
        <View style={{width: '100%', height: '100%', alignItems: 'center', backgroundColor: 'white'}}>

                <View style={{ 
                    width: width > height ? '50%' : '70%',
                    height: width > height ? '100%' : '100%',
                    alignItems: 'center',

                     }}>   
                     <View style={{  
                         marginTop: '3%', 
                         width: '100%', 
                         height: width > height ? '11%': '9%'
                       
                    }}>
                        
                        <Text style={{ fontSize: responsiveScreenFontSize(1.5), fontWeight: '600'}}>
                            내장된 목차를 찾았어요.  
                        </Text>

                      
                        <Text 
                            style={{
                                marginTop : 10,
                                fontSize: responsiveScreenFontSize(1.2),
                                fontWeight: '400'
                            }}>
                            목차를 기반으로 도서를 자동 분할 합니다.
                        </Text>

                    </View>
                    <View style={{
                        width: '100%',
                        height: '72%',
                        borderColor: editable ? 'red' : 'black',
                        borderWidth: 1,
                        borderRadius: 15,
                    }}>
                    
                        <DraggableFlatList
                            data={bookTocResult}
                            onDragEnd={({ data }) => {
                                handleTocResult(data);
                            }}
                            
                            keyExtractor={(item, index) => index.toString()}
                            listKey={(item, index)=> 'D' + index.toString()}
                            renderItem={({ item, drag, isActive, index }) => (
                                <View style={{
                                    width: '90%',
                                    display: 'flex',
                                    flexDirection: 'row',
                        
                                }}>
                            
                                {HierarchyDataRender(item, drag, isActive, index)}
                                
                                </View>
                            )}
                        />

                        
                    </View>
                    <View style={{
                        height: '12%', 
                        width: '100%', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        display: 'flex',
                        flexDirection: 'row',
                    }}>
                        {editable ?
                        <View style={{
                            width: '100%',
                            height: '100%',
                            justifyContent: 'center',
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                              <BasisButtonComponent 
                                setEditable={setPageEditable} 
                                editable={pageEditable} 
                                context={"페이지 편집"} 
                                bColor='red' 
                                bFocusColor='#2A3AC4'
                            />
                            <BasisButtonComponent 
                                setEditable={setEditable} 
                                editable={editable} 
                                context={"저장"} 
                                bColor='red' 
                                bFocusColor='#2A3AC4'
                            />
                        </View>
                        
                        :
                    
                        <View style={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'row'
                        }}>
                            <BasisButtonComponent setEditable={setEditable} editable={editable} context={"편집할래요."}/>
                            <Pressable 
                                 onPress={()=> {
                                     navigation.push('DiffCheck')
                                }}
                                style={({pressed})=>[
                                        tocCheckingStyles.buttonStyle,
                                        {
                                            backgroundColor: pressed ? '#E8E8E8': '#F7F7F7',
                                            height: width > height ? responsiveScreenHeight(6) : responsiveScreenWidth(6),
                                            marginHorizontal: width > height ? responsiveScreenWidth(1) : responsiveScreenHeight(1),
                                
                                        }
                            ]}>
                        
                                <Text style={tocCheckingStyles.buttonTextStyle}>
                                        등록하기
                                </Text>
                            </Pressable>
                            <Pressable 
                                 onPress={()=> navigation.push('GetBookTitle')}
                                style={({pressed})=>[
                                        tocCheckingStyles.buttonStyle,
                                        {
                                            backgroundColor: pressed ? '#E8E8E8': '#F7F7F7',
                                            height: width > height ? responsiveScreenHeight(6) : responsiveScreenWidth(6),
                                            marginHorizontal: width > height ? responsiveScreenWidth(1) : responsiveScreenHeight(1),
                                        }
                            ]}>
                        
                            <Text style={tocCheckingStyles.buttonTextStyle}>
                                    너무 이상해요.
                            </Text>
                        </Pressable>
                         </View>
                        }

                    </View>
                </View>  
        </View>
    );


}

const mapDispatchToProps = (dispatch) => ({
    handleTocResult: (value)=>  dispatch(registerBook("bookTocResult", value)),
    handleMarkExist: (value)=> dispatch(registerBook("bookMarkExist", value))
});

const mapStateToProps = (state) => ({
    bookTocResult : state.registerBooks.bookRegisterObj.bookTocResult
});


export default connect(mapStateToProps, mapDispatchToProps)(BookmarkTocCheckingView);