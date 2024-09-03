import { useEffect, useState } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
  Image,
  Platform,
  Modal,
  Linking,
} from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import AppUpdatedOverlay from './components/AppUpdatedOverlay';
import { getStoredValue, storeValue } from './components/store';

interface AutoUpdateOverlayProps {
  currentVersion: string;
  iosStoreLink: string;
  androidStoreLink: string;
  primaryColor: string;
  backgroundColor: string;
  icon: ImageSourcePropType;
  mainTitle: string;
  description: string;
  buttonTitle: string;
  titleFontFamily: string;
  descriptionFontFamily: string;
  buttonTitleFontFamily: string;
  titleFontSize: number;
  descriptionFontSize: number;
  buttonTitleFontSize: number;
  isWhatsNewRequired: boolean;
  whatsNewDescription: string;
}
interface ManualUpdateOverlayProps {
  updateAvailable: any;
  iosStoreLink: string;
  androidStoreLink: string;
  currentVersion: string;
  icon: ImageSourcePropType;
  mainTitle: string;
  description: string;
  buttonTitle: string;
  primaryColor: string;
  backgroundColor: string;
  titleFontFamily: string;
  descriptionFontFamily: string;
  buttonTitleFontFamily: string;
  titleFontSize: number;
  descriptionFontSize: number;
  buttonTitleFontSize: number;
  isMandatoryUpdate: boolean;
  whatsNewDescription: string;
  isWhatsNewRequired: boolean;
  onDismissButtonPress: () => void;
}

const { width } = Dimensions.get('window');
const alert = require('./alertImage.png');

export const AutoUpdateOverlay = ({
  currentVersion,
  iosStoreLink,
  androidStoreLink,
  icon = alert,
  mainTitle = 'Update Available',
  description = 'Please update the application to the latest version.',
  buttonTitle = 'Update',
  isWhatsNewRequired = true,
  whatsNewDescription,
  primaryColor = '#11B8B2',
  backgroundColor = '#EEEEEE',
  titleFontFamily,
  descriptionFontFamily,
  buttonTitleFontFamily,
  titleFontSize = 24,
  descriptionFontSize = 14,
  buttonTitleFontSize = 14,
}: AutoUpdateOverlayProps): any => {
  const [autoDetectedVersionNeedsUpdate, setAutoDetectedVersionNeedsUpdate] =
    useState<boolean>(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState<boolean | null>(
    null
  );
  const [isAppUpdated, setIsAppUpdated] = useState<boolean>(false);
  const [whatsNewContent, setWhatsNewContent] = useState<string>('');
  const [latestVersion, setLatestVersion] = useState('');

  const fetchGooglePlayVersion = async () => {
    try {
      const googlePlayResponse = await fetch(androidStoreLink);
      const googlePlayText = await googlePlayResponse.text();
      const googlePlayVersionMatch = googlePlayText.match(
        /\[\[\["([\d.]+?)"\]\]/
      );
      if (googlePlayVersionMatch && googlePlayVersionMatch[1]) {
        const latestVersion = googlePlayVersionMatch[1].trim();

        const currentVersionParts = currentVersion.split('.').map(Number);
        const latestVersionParts = latestVersion.split('.').map(Number);
        setLatestVersion(latestVersion);

        for (
          let i = 0;
          i < Math.max(currentVersionParts.length, latestVersionParts.length);
          i++
        ) {
          const currentPart = currentVersionParts[i] || 0;
          const latestPart = latestVersionParts[i] || 0;

          if (currentPart < latestPart) {
            if (i == 2) {
              const shown = await getStoredValue({
                storageTag: 'availableUpdate',
              });
              if (shown == null) {
                await storeValue({
                  storageTag: 'availableUpdate',
                  valueToStore: 'shown',
                });
                setIsUpdateAvailable(true);
                setAutoDetectedVersionNeedsUpdate(true);
              } else {
                setAutoDetectedVersionNeedsUpdate(false);
              }
            } else {
              setIsUpdateAvailable(false);
              setAutoDetectedVersionNeedsUpdate(true);
            }
            return;
          } else if (currentPart > latestPart) {
            setAutoDetectedVersionNeedsUpdate(false);
            setIsUpdateAvailable(false);
            return;
          }
        }

        setAutoDetectedVersionNeedsUpdate(false);
        setIsUpdateAvailable(false);
      }
    } catch (error) {
      console.error('Error fetching Google Play Store version:', error);
    }
  };

  const fetchAppStoreVersion = async () => {
    try {
      const appStoreResponse = await fetch(iosStoreLink);
      const appStoreText = await appStoreResponse.text();
      const appStoreVersionMatch = appStoreText.match(/Version\s([\d.]+)/);

      if (appStoreVersionMatch && appStoreVersionMatch[1]) {
        const latestVersion = appStoreVersionMatch[1].trim();
        const currentVersionParts = currentVersion.split('.').map(Number);
        const latestVersionParts = latestVersion.split('.').map(Number);
        setLatestVersion(latestVersion);

        for (
          let i = 0;
          i < Math.max(currentVersionParts.length, latestVersionParts.length);
          i++
        ) {
          const currentPart = currentVersionParts[i] || 0;
          const latestPart = latestVersionParts[i] || 0;

          if (currentPart < latestPart) {
            if (i == 2) {
              const shown = await getStoredValue({
                storageTag: 'availableUpdate',
              });
              if (shown == null) {
                await storeValue({
                  storageTag: 'availableUpdate',
                  valueToStore: 'shown',
                });
                setIsUpdateAvailable(true);
                setAutoDetectedVersionNeedsUpdate(true);
              } else {
                setAutoDetectedVersionNeedsUpdate(false);
              }
            } else {
              setIsUpdateAvailable(false);
              setAutoDetectedVersionNeedsUpdate(true);
            }
            return;
          } else if (currentPart > latestPart) {
            setAutoDetectedVersionNeedsUpdate(false);
            setIsUpdateAvailable(false);
            return;
          }
        }

        setAutoDetectedVersionNeedsUpdate(false);
        setIsUpdateAvailable(false);
      }
    } catch (error) {
      console.error('Error fetching App Store version:', error);
    }
  };

  const fetchWhatsNew = async () => {
    if (Platform.OS == 'android') {
      const googlePlayResponse = await fetch(androidStoreLink);
      const googlePlayText = await googlePlayResponse.text();

      const description = googlePlayText.match(
        /<div itemprop="description">(.*?)<\/div>/s
      );

      if (description && description[1]) {
        setWhatsNewContent(description[1]);
        setIsAppUpdated(true);
      }
    } else {
      const appStoreResponse = await fetch(iosStoreLink);

      const appStoreText = await appStoreResponse.text();
      const descriptionSection = appStoreText.match(
        /<div class="we-truncate we-truncate--multi-line we-truncate--interactive " dir>([\s\S]*?)<\/div>/gi
      );

      if (descriptionSection && descriptionSection[0]) {
        const description = descriptionSection[0].match(
          /<p dir="false" data-test-bidi>([\s\S]*?)<\/p>/i
        );
        if (description && description[1]) {
          setWhatsNewContent(description[1]);
          setIsAppUpdated(true);
        }
      }
    }
  };

  const checkIfUserUpdated = async () => {
    try {
      const storedVersion = await getStoredValue({
        storageTag: 'storedVersion',
      });
      if (storedVersion !== null) {
        if (storedVersion == currentVersion) {
          setIsAppUpdated(false);
        } else {
          await storeValue({
            storageTag: 'storedVersion',
            valueToStore: currentVersion,
          });

          if (whatsNewDescription) {
            setWhatsNewContent(whatsNewDescription);
            setIsAppUpdated(true);
          } else {
            fetchWhatsNew();
          }
        }
      } else {
        await storeValue({
          storageTag: 'storedVersion',
          valueToStore: currentVersion,
        });
      }
    } catch (e) {
      console.log(e, 'Error story current version');
    }
  };

  const onDownloadButtonPress = () => {
    Linking.openURL(Platform.OS == 'ios' ? iosStoreLink : androidStoreLink);
  };

  useEffect(() => {
    if (Platform.OS == 'ios') {
      fetchAppStoreVersion();
    } else {
      fetchGooglePlayVersion();
    }
    if (isWhatsNewRequired) {
      checkIfUserUpdated();
    }
  }, [currentVersion, iosStoreLink, androidStoreLink, isWhatsNewRequired]);

  return (
    <>
      <Modal
        visible={autoDetectedVersionNeedsUpdate}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setAutoDetectedVersionNeedsUpdate(false);
        }}
      >
        <View
          style={[styles.centeredView, { backgroundColor: backgroundColor }]}
        >
          <View style={styles.modalView}>
            <Image source={icon} style={styles.icon} />

            <Text
              style={[
                styles.mainTitle,
                {
                  fontFamily: titleFontFamily ? titleFontFamily : undefined,
                  fontSize: titleFontSize,
                },
              ]}
            >
              {mainTitle}
            </Text>

            <Text
              style={[
                styles.description,

                {
                  fontFamily: descriptionFontFamily
                    ? descriptionFontFamily
                    : undefined,
                  fontSize: descriptionFontSize,
                  lineHeight: descriptionFontSize + 2,
                },
              ]}
            >
              {description}
            </Text>

            <>
              {!isUpdateAvailable && (
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: primaryColor }]}
                  onPress={onDownloadButtonPress}
                >
                  <Text
                    style={[
                      styles.buttonTitle,

                      {
                        fontFamily: buttonTitleFontFamily
                          ? buttonTitleFontFamily
                          : undefined,
                        fontSize: buttonTitleFontSize,
                      },
                    ]}
                  >
                    {buttonTitle}
                  </Text>
                </TouchableOpacity>
              )}
              {isUpdateAvailable && (
                <View style={styles.buttonsContainer}>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: primaryColor }]}
                    onPress={onDownloadButtonPress}
                  >
                    <Text
                      style={[
                        styles.buttonTitle,

                        {
                          fontFamily: buttonTitleFontFamily
                            ? buttonTitleFontFamily
                            : undefined,
                          fontSize: buttonTitleFontSize,
                        },
                      ]}
                    >
                      Update
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.dismissButton]}
                    onPress={() => setAutoDetectedVersionNeedsUpdate(false)}
                  >
                    <Text
                      style={[
                        styles.buttonTitle,
                        styles.dismissButtonTitle,
                        {
                          fontFamily: buttonTitleFontFamily
                            ? buttonTitleFontFamily
                            : undefined,
                          color: primaryColor,
                          fontSize: buttonTitleFontSize,
                        },
                      ]}
                    >
                      Skip for now
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          </View>
        </View>
      </Modal>
      {isWhatsNewRequired && isAppUpdated ? (
        <AppUpdatedOverlay
          content={whatsNewContent}
          version={latestVersion}
          primaryColor={primaryColor}
          backgroundColor={backgroundColor}
          titleFontFamily={titleFontFamily}
          descriptionFontFamily={descriptionFontFamily}
          buttonTitleFontFamily={buttonTitleFontFamily}
          titleFontSize={titleFontSize}
          descriptionFontSize={descriptionFontSize}
          buttonTitleFontSize={buttonTitleFontSize}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export const ManualUpdateOverlay = ({
  updateAvailable = false,
  currentVersion,
  iosStoreLink,
  androidStoreLink,
  icon = alert,
  mainTitle = 'Update Available',
  description = 'Please update the application to the latest version.',
  buttonTitle = 'Update',
  primaryColor = '#11B8B2',
  backgroundColor = '#EEEEEE',
  isWhatsNewRequired = true,
  isMandatoryUpdate,
  whatsNewDescription,
  onDismissButtonPress,
  titleFontFamily,
  descriptionFontFamily,
  buttonTitleFontFamily,
  titleFontSize = 24,
  descriptionFontSize = 14,
  buttonTitleFontSize = 14,
}: ManualUpdateOverlayProps): any => {
  const [isAppUpdated, setIsAppUpdated] = useState<boolean>(false);
  const [whatsNewContent, setWhatsNewContent] = useState<string>('');

  const fetchWhatsNew = async () => {
    if (Platform.OS == 'android') {
      const googlePlayResponse = await fetch(androidStoreLink);
      const googlePlayText = await googlePlayResponse.text();
      const description = googlePlayText.match(
        /<div itemprop="description">(.*?)<\/div>/s
      );

      if (description && description[1]) {
        setWhatsNewContent(description[1]);
        setIsAppUpdated(true);
      }
    } else {
      const appStoreResponse = await fetch(iosStoreLink);

      const appStoreText = await appStoreResponse.text();
      const descriptionSection = appStoreText.match(
        /<div class="we-truncate we-truncate--multi-line we-truncate--interactive " dir>([\s\S]*?)<\/div>/gi
      );

      if (descriptionSection && descriptionSection[0]) {
        const description = descriptionSection[0].match(
          /<p dir="false" data-test-bidi>([\s\S]*?)<\/p>/i
        );
        if (description && description[1]) {
          setWhatsNewContent(description[1]);
          setIsAppUpdated(true);
        }
      }
    }
  };

  const checkIfUserUpdated = async () => {
    try {
      const storedVersion = await getStoredValue({
        storageTag: 'storedVersion',
      });
      if (storedVersion !== null) {
        if (storedVersion == currentVersion) {
          setIsAppUpdated(false);
        } else {
          await storeValue({
            storageTag: 'storedVersion',
            valueToStore: currentVersion,
          });

          if (whatsNewDescription) {
            setWhatsNewContent(whatsNewDescription);
            setIsAppUpdated(true);
          } else {
            fetchWhatsNew();
          }
        }
      } else {
        await storeValue({
          storageTag: 'storedVersion',
          valueToStore: currentVersion,
        });
      }
    } catch (e) {
      console.log(e, 'Error story current version');
    }
  };

  const onDownloadButtonPress = () => {
    Linking.openURL(Platform.OS == 'ios' ? iosStoreLink : androidStoreLink);
  };

  useEffect(() => {
    if (isWhatsNewRequired) {
      checkIfUserUpdated();
    }
  }, [
    currentVersion,
    iosStoreLink,
    androidStoreLink,
    whatsNewDescription,
    isWhatsNewRequired,
  ]);

  return (
    <>
      <Modal
        visible={updateAvailable}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          onDismissButtonPress();
        }}
      >
        <View
          style={[styles.centeredView, { backgroundColor: backgroundColor }]}
        >
          <View style={styles.modalView}>
            <Image source={icon} style={styles.icon} />

            <Text
              style={[
                styles.mainTitle,

                {
                  fontFamily: titleFontFamily ? titleFontFamily : undefined,
                  fontSize: titleFontSize,
                },
              ]}
            >
              {mainTitle}
            </Text>

            <Text
              style={[
                styles.description,

                {
                  fontFamily: descriptionFontFamily
                    ? descriptionFontFamily
                    : undefined,
                  fontSize: descriptionFontSize,
                  lineHeight: descriptionFontSize + 2,
                },
              ]}
            >
              {description}
            </Text>

            {isMandatoryUpdate && (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: primaryColor }]}
                onPress={onDownloadButtonPress}
              >
                <Text
                  style={[
                    styles.buttonTitle,

                    {
                      fontFamily: buttonTitleFontFamily
                        ? buttonTitleFontFamily
                        : undefined,
                      fontSize: buttonTitleFontSize,
                    },
                  ]}
                >
                  {buttonTitle}
                </Text>
              </TouchableOpacity>
            )}
            {!isMandatoryUpdate && (
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: primaryColor }]}
                  onPress={onDownloadButtonPress}
                >
                  <Text
                    style={[
                      styles.buttonTitle,

                      {
                        fontFamily: buttonTitleFontFamily
                          ? buttonTitleFontFamily
                          : undefined,
                        fontSize: buttonTitleFontSize,
                      },
                    ]}
                  >
                    Update
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.dismissButton]}
                  onPress={onDismissButtonPress}
                >
                  <Text
                    style={[
                      styles.buttonTitle,
                      styles.dismissButtonTitle,
                      {
                        fontFamily: buttonTitleFontFamily
                          ? buttonTitleFontFamily
                          : undefined,
                        color: primaryColor,
                        fontSize: buttonTitleFontSize,
                      },
                    ]}
                  >
                    Skip for now
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
      {isWhatsNewRequired && isAppUpdated ? (
        <AppUpdatedOverlay
          content={whatsNewContent}
          version={currentVersion}
          primaryColor={primaryColor}
          backgroundColor={backgroundColor}
          titleFontFamily={titleFontFamily}
          descriptionFontFamily={descriptionFontFamily}
          buttonTitleFontFamily={buttonTitleFontFamily}
          titleFontSize={titleFontSize}
          descriptionFontSize={descriptionFontSize}
          buttonTitleFontSize={buttonTitleFontSize}
        />
      ) : (
        <></>
      )}
    </>
  );
};

const mainStyles = {
  color: {
    title: '#14202B',
    text: '#9B9B9B',
    placeholder: '#a0a0a0',
    white: '#FFFFFF',
  },
  fontSize: {
    title: 20,
    small: 12,
  },
  borderRadius: {
    main: 25,
    small: 8,
    extraSmall: 4,
  },
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    position: 'absolute',
    bottom: 0,
    width: width,
    backgroundColor: 'white',
    padding: 35,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    height: 64,
    width: 64,
    marginBottom: 20,
  },
  mainTitle: {
    color: mainStyles.color.title,
    fontSize: mainStyles.fontSize.title,
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    color: mainStyles.color.text,
    fontSize: mainStyles.fontSize.small,
    textAlign: 'center',
    width: width / 1.2,
    lineHeight: 24,
    marginBottom: 30,
  },
  button: {
    width: width - 40,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: mainStyles.borderRadius.extraSmall,
    marginBottom: 10,
  },
  dismissButton: {
    backgroundColor: 'transparent',
  },
  buttonTitle: {
    color: mainStyles.color.white,
    fontSize: mainStyles.fontSize.small,
    textAlign: 'center',
  },
  dismissButtonTitle: {
    color: mainStyles.color.text,
  },
  buttonsContainer: {
    alignItems: 'center',
  },
});
