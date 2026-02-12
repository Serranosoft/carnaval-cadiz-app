import { useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import WebView from 'react-native-webview';
import Constants from "expo-constants";

export default function App() {

    const ref = useRef();
    const [loaded, setLoaded] = useState(false);

    return (
        <View style={styles.container}>
            <WebView
                ref={ref}
                style={[{ flex: loaded ? 1 : 0 }, styles.webview]}
                source={{ uri: 'https://carnaval-cadiz.vercel.app/' }}
                onLoadEnd={() => {
                    setLoaded(true);
                    ref.current.postMessage(Dimensions.get("window").height.toFixed(2))
                }}
            />
            { !loaded && <Text style={{ alignSelf: "center", flex: 1, fontSize: 21, fontWeight: "bold", textAlign: "center" }}>Cargando la información...</Text> }
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
