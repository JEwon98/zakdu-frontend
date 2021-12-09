import React, {useState} from 'react';
import {View, Text, useWindowDimensions, StyleSheet, Image, Pressable, FlatList, ScrollView, Alert} from 'react-native';
import { responsiveFontSize, responsiveScreenFontSize, responsiveScreenHeight, responsiveScreenWidth } from 'react-native-responsive-dimensions';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconFeather from 'react-native-vector-icons/Feather';
import CheckBox from '@react-native-community/checkbox';
import { ImageModal } from '../../Common/CommonComponent/ImageModal';
import axios from 'axios';
import { HS_API_END_POINT } from '../../Shared/env';
import Toast from 'react-native-toast-message';
import { connect } from 'react-redux';
import {downloadPdfBook, downloadPdfKeys} from './Download/BookDownload'
import AsyncStorage from '@react-native-async-storage/async-storage';

const styles = StyleSheet.create({
    PartPurchaseViewStyle: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 15,
        display: 'flex',
        flexDirection: 'row'
    },

    PartPurchaseLeftView: {
        width: '40%',
        height: '100%',
        alignItems: 'center',
        padding: 20
    },

    PartPurchaseRightView: {
        width: '60%',
        height: '100%',
        padding: 20,
    },

    BookTitleTextStyle: {
        fontSize: responsiveScreenFontSize(1.2),
        marginTop: '10%',
        width: '85%',
        textAlign: 'center',
        fontWeight: '500'
    },


    TocFieldViewStyle : {
        display: 'flex',
        flexDirection: 'row',
        alignContent: 'space-between',
        marginVertical: 10,
        alignItems: 'center'
    },


    PriceInfoLayout: {
        backgroundColor: '#D1D1D1', 
        height: '20%', 
        borderTopWidth: 1,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        justifyContent: 'center',

    },

    PriceSecondLayout :{
        display: 'flex',
        flexDirection: 'column',
        paddingHorizontal: 15,
        justifyContent: 'center',
        height: '50%',
        width: '100%'
    }

})


const unTick = (data) => {

    data.tick = false;
    parent(data.parent);
    if(data.childs){
        data.childs.map(
            (item)=> {
                unTick(item);
            }
        )
      
    }
        
}

const parent = (data) => {
    if(data && data.childs) {
        const countNotCheckedItem = data.childs.filter(child => !child.tick);

        if(countNotCheckedItem.length === 0){
            data.tick = true;
        }else {
            data.tick = false;
        }
        parent(data.parent);
    }
}

const onTick = (data) => {
    data.tick = true;
    parent(data.parent);
    if(data.childs){
        data.childs.map(
            (item) => {
                onTick(item);
            }
        )
        
    }
}


const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
    if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
            return;
        }
        seen.add(value);
    }
    return value;
    };
};


const downloadBook = (item) => {
    Toast.show({type: 'downloadToast', text1: "다운로드중입니다..", autoHide: false});
    downloadPdfBook(item).then(() => {
        downloadPdfKeys(item.id).then(res => {
            Toast.show({type: 'downloadToast', text1: "다운로드가 완료되었습니다."})
        });
    })
}

function PartPurchaseView({selectedBook, pdfPurchaseInfo, userInfo}) {
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const {width, height} = useWindowDimensions();
    const [text, setText] = useState("");
    const [pagesToBuy,setPagesToBuy] = useState({});
    const [pageArr, setPageArr] = useState([]);
    const [byToc, setByToc] = useState(true);
    const [price ,setPrice] = useState(0);
    const [bookTocData, setBookTocData] = useState([]);

    const base64Image = 'data:image/png;base64,' + selectedBook.bookCoverResource;

    const toastConfig = {
            
        purchaseSuccessToast: ({ text1, props }) => (
            <View style={{
                width: width * 0.81,
                height: 48,
                alignItems: 'center'
            }}>
                <View style={{   
                    width: '50%', 
                    height: '100%', 
                    backgroundColor: '#242528', 
                    borderRadius: 8, 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    display: 'flex',
                    flexDirection: 'row'
                }}>
                    
                    <Text style={{
                        fontSize: 16, 
                        fontWeight: '400', 
                        borderColor: 'white',
                        color: 'white'
                    }}>{text1}</Text>
            
                    <Text 
                        onPress={()=> downloadBook(selectedBook)}
                        style={{
                                fontSize: 16, 
                                fontWeight: '600', 
                                borderColor: '#C2CAFC',
                                color: '#A4B0FB'
                        }}>다운로드</Text>
            
                </View>
            </View>

        ),

        downloadToast: ({ text1, props }) => (
            <View style={{
                width: width * 0.81,
                height: 48,
                alignItems: 'center'
            }}>
                
                <View style={{   
                    width: '50%', 
                    height: '100%', 
                    backgroundColor: '#242528', 
                    borderRadius: 8, 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    display: 'flex',
                    flexDirection: 'row'
                }}>
                    {/* <LottieView source={require('../../Assets/json/bookdownload.json')} autoPlay loop /> */}
                    <Text style={{
                        fontSize: 16, 
                        fontWeight: '400', 
                        borderColor: 'white',
                        color: 'white'
                    }}>{text1}</Text>
                </View>
            </View>

        )
    };

    const priceCheck = () => {
        console.log('구매한 페이지: '+ pageArr.filter(page => page === true).length);
        setPrice(((pageArr.filter(page => page === true).length) / selectedBook.pdfPageCount) * selectedBook.price);
    }

    const purchaseButtonOnClick = async() => {
        const formData = new FormData();

        let bookPurchaseDto = {
            'purchasePageList': pageArr
        }
        console.log("페이지 수: " + pageArr.filter(value => value == true).length);
        formData.append('bookPurchaseStr', JSON.stringify(bookPurchaseDto, getCircularReplacer()));
        console.log(userInfo);
        const token = await AsyncStorage.getItem('user_jwt');
        console.log(token);
        axios.post(`${HS_API_END_POINT}/book-purchase/pdf-book/` + selectedBook.id, formData, {
            headers: {
                'Authorization' : "Bearer " + token  
            }
        })
        .then((res) => {
      
            Toast.show({
                type: 'purchaseSuccessToast',
                text1: '구매가 완료되었어요.',
            });
            console.log(res);
        })
        .catch((err)=> console.log(err));

    }

    const HierarchyDataRender = (item, index) => {
        const realStartPage = selectedBook.realStartPage;
        if (!item.tick) {
            let flag = false;
            item.tick = false;
            item.complete = false;
            for(let i=item.startPage; i<=item.endPage; i++) {
                if(!pdfPurchaseInfo.purchasePageList[i]) {
                    flag = true;
                    break;
                }
            }
            if(!flag) {
                item.complete = true;
                item.tick = true;
            }
        }
 
        return(
            <View style={{marginLeft: 20}}  key={item.shopId}>            
                <View>
                                
                    <View style={styles.TocFieldViewStyle}>
                            {item.childs ? 

                                <Icon name="chevron-right" size={15} style={{
                                    marginRight: 12
                                }}/> : 
                                <Icon name="circle" size={15} style={{
                                    marginRight: 12}}
                                />}
                                <CheckBox
                                    boxType='square'
                                    style={{
                                        marginRight: 10,
                                        width: 20,
                                        height: 20
                                    }}
                                    animationDuration={0.4}
                                    onAnimationType='fade'
                                    offAnimationType='fade'
                                    value={item.tick}
                                    disabled={item.complete}
                                    onValueChange={()=> {

  
                                        if(!item.tick) {
                                            
                                            onTick(item);
                                            let flag = false;
                                            for(let i=item.startPage; i<=item.endPage; i++){
                                                if(pdfPurchaseInfo.purchasePageList[i]) {
                                                    flag = true;
                                                }
                                                else {
                                                    pageArr[i] = true;
                                                }
                                            }
                                            if(flag) {
                                                Alert.alert(null,'구매한 페이지가 포함돼있어요. 가격에서는 제외돼요.');
                                            }
                                            console.log(pageArr);
                                            setPageArr(pageArr);
                                        }else {
                              
                                                unTick(item); 
                                                for(let i=item.startPage; i<=item.endPage; i++){
                                                    if(!pdfPurchaseInfo.purchasePageList[i]){
                                                        pageArr[i] = false;
                                                    }
                                                
                                                }
                                                console.log(pageArr);
                                                setPageArr(pageArr);
                                           
                                        }
                                    
                                        priceCheck();
                                        

                                    }} />
                                        
                            <View style={{
                                width: '90%',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',

                            }}>
                                <Text 
                                    numberOfLines={1}
                                    style={{
                                    fontSize: responsiveScreenFontSize(1),
                                    width: '82%'
  
                                }} >{item.text}</Text>
                                <Text style={{
                                    textAlign: 'center',
                                    width: '18%',
                                    fontSize: responsiveScreenFontSize(0.8),
                                    position: 'absolute',
                                    right: 0
                                }}>
                                    {item.startPage- realStartPage +1}
                                </Text>
                            </View>
                        </View>
    
                        {item.childs && item.childs.map(
                            (data, index) => {
                                if(!data.parent) {
                                    data.parent = item;
                                }
                                return HierarchyDataRender(data, index);
                            }
                        ) }
    
                    </View>
                          
            </View>
        );
    }
    const tocInitialize = () => {
        axios.get(`${HS_API_END_POINT}/book-purchase/book-toc/` + selectedBook.id)
        .then((res)=> {
            setBookTocData(res.data.data);
        })
        .catch((err)=> console.log(err));
    }

    const sellByPage = () => {

        
        setByToc(false)
        for(let i=0; i<=selectedBook.pdfPageCount; i++) {
            pageArr[i] = false;
        }
        setPageArr(pageArr);
        setPrice(0);

    };
    const sellByToc = () => {

        tocInitialize();

        setByToc(true);
        for(let i=0; i<=selectedBook.pdfPageCount; i++) {
            pageArr[i] = false;
        }
        setPageArr(pageArr);
        setPrice(0);
        setPagesToBuy("");
    }
    const onChangeText = (select) => setText(select);

    const delPage = (key) =>{
        const newPages = {...pagesToBuy};
        const delValue = newPages[key].text;
        let newPageArr = [...pageArr];

        const inputs = delValue.split(',').map(x => x.trim());
        for(const x of inputs) {
            const pages = x.split('-');
            if(pages.length===1){
                newPageArr[Number(pages[0])] = false;
            } else {
                for(var i = Number(pages[0]); i<=Number(pages[1]);i++){
                    newPageArr[i]=false;
                }
            }
        }
        console.log("페이지 현황: "+ newPageArr);
        setPageArr(newPageArr);

        delete newPages[key];
        setPagesToBuy(newPages);
    }
    const isNumeric = input => !isNaN(input) // you may also check if the value is a nonzero positive integer
    const isOrdered = (start, end) => parseInt(start) < parseInt(end)
    const isRangeValid = range => range.length == 2 && range.every(isNumeric) && isOrdered(range[0], range[1])
    const isSingleValid = single => single.length == 1 && isNumeric(single[0])

    // 유효한 페이지인지 검사한다.    
    const isValidPage = (input) => {
        const inputs = input.split(',').map(x => x.trim());
        for(const x of inputs) {
            if(!x){
                Alert.alert(
                    "알맞은 형태로 입력해주세요!"
                );
                return false;
            } 
            const pages = x.split('-');

            if (x==='0'){
                Alert.alert(
                    "유효하지 않은 페이지 숫자입니다."
                );
                setText("");
                return false;
            } else if (!isSingleValid(pages) && !isRangeValid(pages)){
                Alert.alert(
                    "알맞은 형태로 입력해주세요!",
                    "ex 6,7,8,10-15"
                );
                setText("");
                return false;
            }
        }
        return true;
    }

    // 이미 포함된 페이지인지 검사한다.
    const isDuplicatePage = (input) => {
        const inputs = input.split(',').map(x => x.trim());
        var tf=true;
        for(const x of inputs) {
            const pages = x.split('-');
            // console.log("isDuplicatePage pages: " + pages);
            if(pages.length===1){ //5-10 이런 형식이 아닌 페이지 입력일 경우
                if(pageArr[Number(pages[0])]){ // 해당 페이지가 있을 경우
                    Alert.alert(pages[0]+" 쪽은 이미 포함 되어있어요.");
                    setText("");
                    return false;
                } else if(pdfPurchaseInfo.purchasePageList[Number(pages[0])]){
                    Alert.alert(pages[0]+" 는 이미 구매한 페이지에요.");
                    setText("");
                    return false;
                }
           
            } else { //5-10 이런 형식이 들어왔을 경우 해당 범위 안에있는 모든 것을 검사해야한다.
                for(var i = Number(pages[0]); i<=Number(pages[1]);i++){
                    if(pageArr[i]){
                        Alert.alert(i+" 는 이미 포함 되어있어요.");
                        setText("");
                        return false;
                    } else if(pdfPurchaseInfo.purchasePageList[Number(pages[0])]) {
                        Alert.alert(i+" 는 이미 구매한 페이지에요.");
                        setText("");
                        return false;
                    }
               
                }
            }
        }
        return true;
    }
    //페이지 추가 이벤트 발생 시,
    const addPage = () => {
        console.log("pageArr:",pageArr);
        const inputs = text.split(',').map(x => x.trim());
        if(isValidPage(text)){ // 결과가 true 일때만 저장하는건데 -> true일때는 유효한 페이지형태 입력일 경우.

            if(isDuplicatePage(text)){ // true 일때 -> 중복이 아닐경우
                let temp=[...pageArr];
                for(const x of inputs) {
                    const pages = x.split('-');
                    if (pages.length===1) {
                        temp[Number(pages[0])]=true;
                    } else{
                        for(var i = Number(pages[0]); i<=Number(pages[1]);i++){
                            temp[i] = true;
                        }
                    }
                }
          
                setPageArr(temp);
                console.log('페이지 현황: ' + temp);
                const newPages = {
                    ...pagesToBuy, 
                    [Date.now()]: {text},
                };
                
                setPagesToBuy(newPages);
            }

        }

        setText("");

    }

    React.useEffect(()=> {
        tocInitialize();

        for(let i=0; i<=selectedBook.pdfPageCount; i++) {
            pageArr[i] = false;
        }
        console.log("페이지정보:" + pdfPurchaseInfo.purchasePageList);

        setPageArr(pageArr);
    },[])

    React.useEffect(()=> {
        priceCheck();
    }, [pageArr])


    return (
        <View style={[
            styles.PartPurchaseViewStyle,
            {
                height:  width > height ? '100%' : '60%',  
            }
        ]}>
                     
            <View style={styles.PartPurchaseLeftView}>
                <Text style={styles.BookTitleTextStyle} numberOfLines={2}> {selectedBook.name}</Text>

                <Pressable onPress={()=> setImageModalVisible(true)} style={{marginTop: '10%'}}>               
                    <Image
                        resizeMode='cover'
                        style={{
                            height: width > height ? responsiveScreenHeight(45): responsiveScreenWidth(40),
                            width:  width > height ? responsiveScreenWidth(24): responsiveScreenHeight(20),
                            borderWidth: 1,
                            borderColor: '#C2C2C2'                           
                        }}
                        source={{
                            uri: base64Image
                        }}
                    
                   />
                </Pressable>
                <Text style={{
                    fontSize: responsiveScreenFontSize(1),
                    marginVertical: 5
                }}> 미리보기 </Text>
                 
            </View>
 
                    
            <View style={styles.PartPurchaseRightView}>

                {byToc &&
                    <View 
                        style={{
                        height: '100%',
                        borderWidth: 1,
                        borderRadius: 15
                    }}>
                        <View style={{
                            height: '80%',
                        }}>
                                <FlatList
                                    data={bookTocData}
                                    renderItem={({item,index})=> HierarchyDataRender(item, index)}
                                    keyExtractor={(item,index)=> item.id.toString()}
                                />
                        </View>
                        <View style={styles.PriceInfoLayout}>
                            <View style={styles.PriceSecondLayout}>
                                <Text 
                                    numberOfLines={1}
                                    style={{
                                        fontSize: width > height ? responsiveScreenFontSize(2.2) : responsiveScreenFontSize(1.7),
                                        width: '70%',       
                                }}>
                                    {price.toLocaleString("ko-KR", { style: 'currency', currency: 'KRW' })}
                                </Text>
                       
                                <Text 
                                    style={{
                                        color: '#256EDE',
                                        fontWeight: '500'
                                    }}
                                    onPress={sellByPage}>
                                        페이지 단위로 구매하기
                                </Text>
                         
                                <Pressable style={({pressed}) => [
                                    {
                                        backgroundColor: pressed ? '#323232' : 'black',
                                    }, 
                                    {
                                        borderRadius: 10,
                                        width: responsiveScreenWidth(13),
                                        height: '80%',
                                        position: 'absolute',
                                        alignItems: 'center',
                                        right: 5,
                                        justifyContent: 'center',
                                    }
                                ]}
                                    onPress={()=> {
                                        if(price == 0) 
                                            alert('선택한 항목이 없습니다.');
                                        else {
                                            purchaseButtonOnClick();
                                        }
                                    }}>
        
                                <Text 
                                    style={{
                                        fontSize: responsiveScreenFontSize(1),
                                        color: 'white'
                                }}>구매하기</Text>
                
                                </Pressable>
                            </View>
                        </View>
                    </View>
                }
                {/* ㅍㅔ이지별로 구매하기 */}
                {!byToc &&
                    <View 
                        style={{
                        height: '100%',
                        borderWidth: 1,
                        borderRadius: 15
                    }}>
                    <View style={{
                        height: '80%',
        
                    }}>
                        <View style={{
                            height: '10%',
                            marginHorizontal:'5%',
                            marginTop:'5%',
                            justifyContent:'center',
         
                        }}>
                            <Text style={{
                                fontSize:responsiveScreenFontSize(1.0),
                                textAlign:'center',
                                fontWeight: '600'
                            }}>
                                구매하고자 하는 페이지를 입력해주세요.
                            </Text>
                        </View>
                        <View
                            style={{
                                flex:1,
                                justifyContent:'center',
                                alignContent:'center',
                                flexDirection:'row'
                            }}>
                        
                            <View style={{
                                width: '100%', 
                                justifyContent:'center',
                                flexDirection: 'row',
                                display: 'flex',
                            }}>
                                <TextInput 
                                    style={{
                                        height:'40%',
                                        width:'60%',
                                        borderWidth: 1,
                                        borderRadius: 10,
                                        paddingLeft:10,
                                        marginHorizontal: 20
                                    }}
                                    onChangeText={onChangeText}
                                    value={text}
                                    onSubmitEditing={addPage}
                                    placeholder=" ex 6,7,8,10-15"
                                >
                                </TextInput>
                                <Pressable style={({pressed}) => [
                                    {
                                        backgroundColor: !pressed ? '#323232' : 'black',
                                    }, 
                                    {
                                        height: '40%',
                                        width:'20%',             
                                        borderRadius: 10,
                                        justifyContent:'center',
                                    }
                                ]}
                                    onPress={()=> {
                                        addPage();
                                    
                                    }}>
                                
                                    <Text 
                                        style={{
                                            textAlign:'center',
                                            fontSize: responsiveScreenFontSize(1),
                                            color: 'white',
                                            fontWeight:'800'
                                    }}>담기</Text>
                                </Pressable>
                            </View>

                        </View>
                        <View style={{flex:4}}>
                            <ScrollView>
                                {Object.keys(pagesToBuy).map((key) => (
                                <View 
                                key={key}
                                style={{
                                    flexDirection:'row',
                                    margin:5,
                                    padding:10,
                                    paddingLeft:15,
                                    backgroundColor:'#E6E6E6',
                                    borderRadius:10,
                                    alignItems:'center',
                                    justifyContent:'space-between'
                                    
                                }}
                                >
                                    <Text style={{
                                        fontWeight:'500',
                                        fontSize:responsiveFontSize(0.9),
                                    }}>{pagesToBuy[key].text}</Text>
                                    <TouchableOpacity onPress={() => {
                                        delPage(key);
                              
                                    }}>
                                        <IconFeather name="x-square" size={20} color="red" />
                                    </TouchableOpacity>
                                </View>
                                ))}
                            </ScrollView>



                        </View>
                
                    </View>
                    <View style={styles.PriceInfoLayout}>
                            <View style={styles.PriceSecondLayout}>
                                <Text 
                                    numberOfLines={1}
                                    style={{
                                        fontSize: width > height ? responsiveScreenFontSize(2.2) : responsiveScreenFontSize(1.7),
                                        width: '70%',       
                                }}>
                                    {price.toLocaleString("ko-KR", { style: 'currency', currency: 'KRW' })}
                                </Text>
                           
                                <Text 
                                    style={{
                                        color: '#256EDE',
                                        fontWeight: '500'
                                    }}
                                    onPress={sellByToc}>
                                        목차 단위로 구매하기
                                </Text>
                         
                            <Pressable style={({pressed}) => [
                                    {
                                        backgroundColor: pressed ? '#323232' : 'black',
                                    }, 
                                    {
                                    borderRadius: 10,
                            
                                    width: responsiveScreenWidth(13),
                                    height: '80%',
                                    position: 'absolute',
                                    alignItems: 'center',
                                    right: 5,
                                    justifyContent: 'center',
                                    }
                                ]}
                                    onPress={()=> {
                                        if(price == 0) 
                                            alert('선택한 항목이 없습니다.');
                                        else {
                                            purchaseButtonOnClick();
                                        }
                                    }}>
        
                                    
                                <Text 
                                    style={{
                                        fontSize: responsiveScreenFontSize(1),
                                        color: 'white'
                                }}>구매하기</Text>
                
                            </Pressable>
                        </View>
                    </View>
                </View>
                              
                }
               
            </View>
     
            <ImageModal imageModalVisible={imageModalVisible}
                        setImageModalVisible={setImageModalVisible}
                        base64Image={base64Image} />

            <Toast position='top' topOffset={5}  config={toastConfig}/>    
        </View>
    );
}

const mapStateToProps = (state) => ({
    pdfPurchaseInfo: state.getPDFBookPurchaseInfos.purchaseDto,
    userInfo: state.userReducer.userObj
});

export default connect(mapStateToProps)(PartPurchaseView);


