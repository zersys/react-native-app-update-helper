import { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  Modal,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface AppUpdatedOverlayProps {
  content: string;
  version: string;
  primaryColor: string;
  backgroundColor: string;
  titleFontFamily: string;
  descriptionFontFamily: string;
  buttonTitleFontFamily: string;
  titleFontSize: number;
  descriptionFontSize: number;
  buttonTitleFontSize: number;
}

export const AppUpdatedOverlay: React.FC<AppUpdatedOverlayProps> = ({
  content,
  version,
  primaryColor = '#11B8B2',
  backgroundColor = '#EEEEEE',
  titleFontFamily,
  descriptionFontFamily,
  buttonTitleFontFamily,
  titleFontSize,
  descriptionFontSize,
  buttonTitleFontSize,
}) => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(true);

  return (
    <Modal visible={isModalVisible} transparent={true} animationType="slide">
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View
            style={[styles.topComponent, { backgroundColor: backgroundColor }]}
          />
          <Text
            style={[
              styles.mainTitle,

              {
                fontFamily: titleFontFamily ? titleFontFamily : undefined,
                fontSize: titleFontSize,
              },
            ]}
          >
            What's New
          </Text>
          <Text
            style={[
              styles.mainTitle,
              styles.subTitle,
              {
                fontFamily: descriptionFontFamily
                  ? descriptionFontFamily
                  : undefined,
                fontSize: descriptionFontSize,
              },
            ]}
          >
            Version: {version}
          </Text>

          <ScrollView
            bounces={false}
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}
            style={styles.scrollviewContainer}
          >
            {content
              .split(Platform.OS === 'ios' ? '<br />' : '<br>')
              .map((line, index) => {
                return (
                  <Text
                    key={index}
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
                    {line.trim()}
                  </Text>
                );
              })}
          </ScrollView>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: primaryColor }]}
            onPress={() => {
              setIsModalVisible(false);
            }}
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
              Get Started
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const mainStyles = {
  color: {
    text: '#15202B',
    white: '#FFFFFF',
  },
  fontSize: {
    title: 24,
    content: 14,
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
    height: height,
    width: width,
    margin: 20,
    backgroundColor: 'white',
    padding: 35,
    alignItems: 'center',
  },
  topComponent: {
    height: height / 4,
    width: width,
    marginTop: -50,
    marginBottom: 40,
  },
  icon: {
    height: 50,
    width: 50,
    marginBottom: 20,
  },
  mainTitle: {
    color: mainStyles.color.text,
    fontSize: mainStyles.fontSize.title,
    textAlign: 'center',
    marginBottom: 5,
  },
  subTitle: {
    fontSize: mainStyles.fontSize.small,
    fontWeight: 'normal',
    marginBottom: 20,
  },
  description: {
    lineHeight: 20,
    color: mainStyles.color.text,
    fontSize: mainStyles.fontSize.content,
    width: width / 1.2,
    marginBottom: 30,
  },
  button: {
    minWidth: width - 40,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: mainStyles.borderRadius.extraSmall,
    marginBottom: 20,
  },
  buttonTitle: {
    color: mainStyles.color.white,
    fontSize: mainStyles.fontSize.small,
    textAlign: 'center',
  },
  scrollviewContainer: {
    width: width - 60,
    marginVertical: 10,
  },
});

export default AppUpdatedOverlay;
