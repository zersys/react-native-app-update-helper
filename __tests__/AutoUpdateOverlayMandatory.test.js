import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AutoUpdateOverlay } from '../src/index';
import '@testing-library/jest-native/extend-expect';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

// Mock Linking
import { Linking } from 'react-native';
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    text: () => Promise.resolve('Version 1.2.3'),
  })
);

const setup = (props) => {
  return render(<AutoUpdateOverlay {...props} />);
};

describe('AutoUpdateOverlay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the overlay with default props', async () => {
    const { getByText } = setup({
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
    const { getByText } = setup({
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
    const { getByText } = setup({
      currentVersion: '1.0.0',
      androidStoreLink: 'https://example.com/android',
    });

    await waitFor(() => {
      expect(getByText('Update')).toBeTruthy();
    });
  });

  it('fetches and sets the latest version for iOS', async () => {
    const { getByText } = setup({
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

    const { getByText } = setup({
      currentVersion: '1.0.0',
      iosStoreLink: 'https://example.com/ios',
      androidStoreLink: 'https://example.com/android',
    });

    await waitFor(() => {
      fireEvent.press(getByText('Update'));
    });

    expect(mockLinkingOpenURL).toHaveBeenCalledWith('https://example.com/ios');
  });
});
