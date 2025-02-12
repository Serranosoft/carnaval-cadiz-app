import { useEffect, useRef } from 'react';
import { Dimensions, StatusBar, StyleSheet, Text, View } from 'react-native';
import WebView from 'react-native-webview';

export default function App() {

    const ref = useRef();

    return (
        <View style={styles.container}>
            <WebView
                ref={ref}
                style={styles.webview}
                source={{ uri: 'https://carnaval-cadiz.vercel.app/' }}
                onLoadEnd={() => ref.current.postMessage(Dimensions.get("window").height.toFixed(2))}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: StatusBar.currentHeight + 24,
    },
    webview: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        backgroundColor: '#fff',
    }
});
