import { createRef, useRef, useState } from 'react';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import WebView from 'react-native-webview';
import Constants from "expo-constants";
import AdsHandler from './AdsHandler';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { bannerId, bannerIdIOS } from './constants';

export default function App() {

    const ref = useRef();
    const [loaded, setLoaded] = useState(false);

    // Gestión de anuncios
    const [adsLoaded, setAdsLoaded] = useState(false);
    const [showOpenAd, setShowOpenAd] = useState(true);
    const adsHandlerRef = useRef();
    return (
        <View style={styles.container}>
            <AdsHandler canStartAds={loaded} ref={adsHandlerRef} showOpenAd={showOpenAd} adsLoaded={adsLoaded} setAdsLoaded={setAdsLoaded} setShowOpenAd={setShowOpenAd} />
            {adsLoaded && <BannerAd unitId={Platform.OS === "android" ? bannerId : bannerIdIOS} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} requestOptions={{}} />}
            <WebView
                ref={ref}
                style={[{ flex: loaded ? 1 : 0 }, styles.webview]}
                source={{ uri: 'https://carnaval-cadiz.vercel.app/' }}
                androidLayerType="software"
                javaScriptEnabled={true}
                domStorageEnabled={true}
                onLoadEnd={() => {
                    try {
                        setLoaded(true);
                        if (ref.current) {
                            ref.current.postMessage(Dimensions.get("window").height.toFixed(2));
                        }
                    } catch (error) {
                        console.error("WebView onLoadEnd error:", error);
                    }
                }}
            />
            {adsLoaded && <BannerAd unitId={Platform.OS === "android" ? bannerId : bannerIdIOS} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} requestOptions={{}} />}
            {!loaded && <Text style={{ alignSelf: "center", flex: 1, fontSize: 21, fontWeight: "bold", textAlign: "center" }}>Cargando la información...</Text>}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Constants.statusBarHeight,
        backgroundColor: '#fff',
    },
    webview: {
        alignItems: 'center',
        justifyContent: 'center',
    }
});
