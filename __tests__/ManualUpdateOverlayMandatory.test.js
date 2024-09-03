import React, { useState } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ManualUpdateOverlay } from '../src/index';
import '@testing-library/jest-native/extend-expect';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

import { Linking } from 'react-native';
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    text: () => Promise.resolve('Version 1.2.3'),
  })
);

const TestWrapper = (props) => {
  const [updateAvailable, setUpdateAvailable] = useState(props.updateAvailable);

  const handleDismiss = () => {
    setUpdateAvailable(false);
    if (props.onDismissButtonPress) {
      props.onDismissButtonPress();
    }
  };

  return (
    <ManualUpdateOverlay
      {...props}
      updateAvailable={updateAvailable}
      onDismissButtonPress={handleDismiss}
    />
  );
};

const setup = (props) => {
  return render(<TestWrapper {...props} />);
};

describe('ManualUpdateOverlay', () => {
  it('renders the overlay with default props', async () => {
    const { getByText, debug } = setup({
      updateAvailable: true,
      currentVersion: '1.0.0',
      iosStoreLink: 'https://example.com/ios',
      androidStoreLink: 'https://example.com/android',
    });

    await waitFor(() => {
      expect(getByText('Update Available')).toBeTruthy();
      expect(
        getByText('Please update the application to the latest version.')
      ).toBeTruthy();
      expect(getByText('Update')).toBeTruthy();
    });
  });

  it('displays custom title and description', async () => {
    const { getByText, debug } = setup({
      updateAvailable: true,
      currentVersion: '1.0.0',
      iosStoreLink: 'https://example.com/ios',
      androidStoreLink: 'https://example.com/android',
      mainTitle: 'Custom Title',
      description: 'Custom Description',
    });

    await waitFor(() => {
      expect(getByText('Custom Title')).toBeTruthy();
      expect(getByText('Custom Description')).toBeTruthy();
    });
  });

  it('fetches and sets the latest version for Android', async () => {
    const { getByText, debug } = setup({
      updateAvailable: true,
      currentVersion: '1.0.0',
      androidStoreLink: 'https://example.com/android',
    });

    await waitFor(() => {
      expect(getByText('Update')).toBeTruthy();
    });
  });

  it('fetches and sets the latest version for iOS', async () => {
    const { getByText, debug } = setup({
      updateAvailable: true,
      currentVersion: '1.0.0',
      iosStoreLink: 'https://example.com/ios',
    });

    await waitFor(() => {
      expect(getByText('Update')).toBeTruthy();
    });
  });

  it('opens the store link when the update button is pressed', async () => {
    const mockLinkingOpenURL = jest.fn();
    Linking.openURL = mockLinkingOpenURL;

    const { getByText, debug } = setup({
      updateAvailable: true,
      currentVersion: '1.0.0',
      iosStoreLink: 'https://example.com/ios',
      androidStoreLink: 'https://example.com/android',
    });

    await waitFor(() => {
      fireEvent.press(getByText('Update'));
    });

    expect(mockLinkingOpenURL).toHaveBeenCalledWith('https://example.com/ios');
  });

  it('hides the overlay when "Skip for now" is pressed and isMandatoryUpdate is false', async () => {
    const onDismissButtonPress = jest.fn();
    const { getByText, queryByText, debug } = setup({
      updateAvailable: true,
      iosStoreLink: 'https://example.com/ios',
      androidStoreLink: 'https://example.com/android',
      isMandatoryUpdate: false,
      onDismissButtonPress,
    });

    await waitFor(() => {
      fireEvent.press(getByText('Skip for now'));
    });

    expect(onDismissButtonPress).toHaveBeenCalled();

    expect(queryByText('Skip for now')).toBeNull();
  });

  it('does not render "Skip for now" button when isMandatoryUpdate is true', async () => {
    const { queryByText, debug } = setup({
      updateAvailable: true,
      iosStoreLink: 'https://example.com/ios',
      androidStoreLink: 'https://example.com/android',
      isMandatoryUpdate: true,
    });

    expect(queryByText('Skip for now')).toBeNull();
  });
});
