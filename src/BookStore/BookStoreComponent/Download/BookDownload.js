import {HS_API_END_POINT} from '../../../Shared/env';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNFS from 'react-native-fs';
import {TextDecoder} from "text-encoding"


export async function downloadPdfBook(item) {
    // 유저 정보 추가로 필요
    // key는 "pdf_" + id
    const id = item.id;
    const storageKey = "pdf_" + id;
    const pdfDirPath = RNFS.DocumentDirectoryPath + "/pdf/";
    const pdfCoverPath = RNFS.DocumentDirectoryPath + "/pdfCover/";

    console.log(id)
    const res = await axios.get(HS_API_END_POINT + "/download/pdf", {params: {id: id, maxContentLength:2000000000000}})
    
    console.log(pdfDirPath);
    const data = res.data.data;
    console.log(data);
    if (!await RNFS.exists(pdfDirPath)) {
        await RNFS.mkdir(pdfDirPath);
    }

    if(!await RNFS.exists(pdfCoverPath)) {
        await RNFS.mkdir(pdfCoverPath);
    }
    
    //RNFS.writeFile(pdfDirPath + data.fileName, data.bytes, 'base64');
    const downloadUrl = HS_API_END_POINT + "/download/pdf-2?id=" + id;

    RNFS.writeFile(pdfCoverPath + data.coverFileName, item.bookCoverResource, 'base64');
    RNFS.downloadFile({
        fromUrl: downloadUrl,
        toFile: pdfDirPath + data.fileName
    })

    const localData = {
        book_id: id,
        fileName: data.fileName,
        coverFileName: data.coverFileName,
        title: item.name,
        author: item.author,
        price: item.price,
        pubDate: item.pubDate,
        publisher: item.publisher,
        realStartPage: item.realStartPage,
        totalPage: item.pdfPageCount
    }
    return AsyncStorage.setItem(storageKey, JSON.stringify(localData));
}

export async function downloadPdfKeys(book_id) {
    // 유저 정보 추가로 필요
    const storageKey = "pdf_" + book_id;

    const response = axios.get(HS_API_END_POINT + "/key" + "/pdf_test", {params: {book_id: book_id}});
    var keys = await response.then((res) => res.data.data);
    for (let i = 0; i < keys.length; i++) {
        const element = keys[i];
        const keyWordArray = new TextDecoder().decode(new Uint8Array(element.aesKey));
        const ivWordArray = new TextDecoder().decode(new Uint8Array(element.iv));
        keys[i] = {
            ...keys[i],
            aesKey: keyWordArray,
            iv: ivWordArray
        }
    }
    AsyncStorage.getItem(storageKey)
        .then(async (item) => {
            var itemData = JSON.parse(item);
            console.log(itemData);
            itemData = {
                ...itemData,
                keys: keys
            }
            console.log(itemData);
            await AsyncStorage.setItem(storageKey, JSON.stringify(itemData));
        }
    );
    console.log(keys);
}