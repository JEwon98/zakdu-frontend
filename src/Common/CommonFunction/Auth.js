import AsyncStorage from '@react-native-async-storage/async-storage';


export async function getJWT() {
    const jwt = await AsyncStorage.getItem('user_jwt');
    if (jwt === null) {
        return null;
    } else {
        return {Authorization : 'Bearer ' + jwt};
    }
}
