import AsyncStorage from '@react-native-async-storage/async-storage';

interface UpdateOverlayProps {
  storageTag: string;
  valueToStore?: string;
}

const getStoredValue = async ({
  storageTag,
}: UpdateOverlayProps): Promise<any> => {
  try {
    const storedValue = await AsyncStorage.getItem(`${storageTag}`);

    return storedValue;
  } catch (e) {
    console.log(e, 'Error storing current version');
  }
};

const storeValue = async ({
  storageTag,
  valueToStore = '',
}: UpdateOverlayProps) => {
  try {
    await AsyncStorage.setItem(`${storageTag}`, valueToStore);
  } catch (e) {
    console.log(e, 'Error storing current version');
  }
};

export { getStoredValue, storeValue };
