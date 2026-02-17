import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
import MobileAds, { AdEventType, AdsConsent, AppOpenAd, useInterstitialAd } from "react-native-google-mobile-ads";
import { AppState, Platform } from "react-native";
import { intersitialId, intersitialIdIOS, loadId } from "./constants";

const AdsHandler = forwardRef((props, ref) => {

    const {
        isLoaded: isLoadedIntersitial,
        isClosed: isClosedIntersitial,
        load: loadIntersitial,
        show: showIntersitial } = useInterstitialAd(Platform.OS === "android" ? intersitialId : intersitialIdIOS);

    /* CONSENT */
    const isMobileAdsStartCalledRef = useRef(false);
    useEffect(() => {
        if (!props.canStartAds) return;

        const prepare = async () => {
            try {
                const consentInfo = await AdsConsent.requestInfoUpdate();
                if (consentInfo.isConsentFormAvailable && consentInfo.status === 'REQUIRED') {
                    await AdsConsent.loadAndShowConsentFormIfRequired();
                }
                await startGoogleMobileAdsSDK();
            } catch (error) {
                console.error('Consent gathering failed:', error);
                // Try to start SDK anyway if consent fails (may still work in some regions/configs)
                startGoogleMobileAdsSDK();
            }
        }

        prepare();
    }, [props.canStartAds]);

    async function startGoogleMobileAdsSDK() {
        try {
            const { canRequestAds } = await AdsConsent.getConsentInfo();
            if (!canRequestAds || isMobileAdsStartCalledRef.current) {
                return;
            }

            isMobileAdsStartCalledRef.current = true;
            await MobileAds().initialize();
            props.setAdsLoaded(true);
            loadIntersitial(); // Cargar intersitial ads
            loadOpenAppAd(); // Cargar open ads
        } catch (error) {
            console.error('MobileAds initialization failed:', error);
        }
    }

    useImperativeHandle(ref, () => ({
        loadIntersitialAd() {
            loadIntersitial();
        },
        showIntersitialAd() {
            showIntersitialAd();
        },
        isClosedIntersitial() {
            return isClosedIntersitial;
        },
        isLoadedIntersitial() {
            return isLoadedIntersitial;
        },
    }))

    useEffect(() => {
        if (isClosedIntersitial) {
            if (props.closedIntersitialCallback) {
                props.closedIntersitialCallback();
            }
            loadIntersitial();
        }
    }, [isClosedIntersitial, props.closedIntersitialCallback])


    function showIntersitialAd() {
        if (isLoadedIntersitial) {
            showIntersitial();
        } else {
            loadIntersitial();
        }
    }

    /** APP OPEN ADS (BACKGROUND -> FOREGROUND -> SHOW ADD) */
    const openAdRef = useRef(null);
    const openAdLoadedRef = useRef(false);
    const [appStateChanged, setAppStateChanged] = useState(AppState.currentState);

    useEffect(() => {
        if (props.adsLoaded && appStateChanged === "active") {
            handleOpenAd();
        }
    }, [appStateChanged, props.adsLoaded])

    useEffect(() => {
        const subscription = AppState.addEventListener("change", nextAppState => {
            setAppStateChanged(nextAppState);
        });
        return () => subscription.remove();
    }, []);

    function handleOpenAd() {
        if (props.showOpenAd) {
            if (openAdRef.current && openAdLoadedRef.current) {
                try {
                    openAdRef.current.show();
                } catch (error) {
                    console.error("Failed to show App Open Ad:", error);
                    loadOpenAppAd(); // Try to reload if show fails
                }
            } else if (!openAdLoadedRef.current) {
                loadOpenAppAd();
            }
        } else {
            props.setShowOpenAd(true);
        }
    }

    function loadOpenAppAd() {
        try {
            const appOpenAd = AppOpenAd.createForAdRequest(loadId);

            const onLoaded = appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
                openAdRef.current = appOpenAd;
                openAdLoadedRef.current = true;
            });

            const onClosed = appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
                openAdLoadedRef.current = false;
                openAdRef.current = null;
                loadOpenAppAd(); // Create a new instance for next time
            });

            const onError = appOpenAd.addAdEventListener(AdEventType.ERROR, (error) => {
                console.error("App Open Ad Error:", error);
                openAdLoadedRef.current = false;
                openAdRef.current = null;
            });

            appOpenAd.load();
        } catch (error) {
            console.error("Failed to create App Open Ad:", error);
        }
    }

    return null;
})

export default AdsHandler