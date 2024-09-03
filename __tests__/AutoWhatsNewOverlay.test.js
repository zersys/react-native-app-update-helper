import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AutoUpdateOverlay } from '../src/index';
import '@testing-library/jest-native/extend-expect';
export * from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const setup = (props) => {
  return render(<AutoUpdateOverlay {...props} />);
};

describe('AutoUpdateOverlay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows "What\'s New" overlay after updating the version and restarting the app with auto fetched content', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        text: () =>
          Promise.resolve(
            '<div class="we-truncate we-truncate--multi-line we-truncate--interactive " dir><p dir="false" data-test-bidi>Hello</p></div> Version 1.1.0 '
          ),
      })
    );

    const { getByText, queryByText, rerender } = setup({
      currentVersion: '1.0.8',
      androidStoreLink: 'https://example.com/android',
      iosStoreLink: 'https://example.com/ios',
    });

    await waitFor(() => {
      fireEvent.press(getByText('Update'));
    });

    rerender(
      <AutoUpdateOverlay
        currentVersion="1.1.0"
        androidStoreLink="https://example.com/android"
        iosStoreLink="https://example.com/ios"
      />
    );

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'storedVersion',
        '1.1.0'
      );
    });

    await waitFor(() => {
      expect(getByText("What's New")).toBeTruthy();
      expect(getByText('Version: 1.1.0')).toBeTruthy();
    });

    fireEvent.press(getByText('Get Started'));

    await waitFor(() => {
      expect(queryByText("What's New")).toBeNull();
    });
  });

  it('shows "What\'s New" overlay after updating the version and restarting the app with manually set content', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve('Version 1.1.0'),
      })
    );

    const { getByText, queryByText, rerender } = setup({
      currentVersion: '1.0.8',
      iosStoreLink: 'https://example.com/ios',
      androidStoreLink: 'https://example.com/android',
    });

    await waitFor(() => {
      fireEvent.press(getByText('Update'));
    });

    rerender(
      <AutoUpdateOverlay
        currentVersion="1.1.0"
        iosStoreLink="https://example.com/ios"
        androidStoreLink="https://example.com/android"
        whatsNewDescription="New Content"
      />
    );

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'storedVersion',
        '1.1.0'
      );
    });

    await waitFor(() => {
      expect(getByText("What's New")).toBeTruthy();
      expect(getByText('Version: 1.1.0')).toBeTruthy();
    });

    fireEvent.press(getByText('Get Started'));

    await waitFor(() => {
      expect(queryByText("What's New")).toBeNull();
    });
  });

  it('does not show "What\'s New" overlay if the isWhatsNewRequired is set to false', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve('Version 1.1.0'),
      })
    );

    const { getByText, queryByText, rerender } = setup({
      currentVersion: '1.0.8',
      iosStoreLink: 'https://example.com/ios',
      androidStoreLink: 'https://example.com/android',
      isWhatsNewRequired: false,
    });

    await waitFor(() => {
      fireEvent.press(getByText('Update'));
    });

    rerender(
      <AutoUpdateOverlay
        currentVersion="1.1.0"
        iosStoreLink="https://example.com/ios"
        androidStoreLink="https://example.com/android"
        isWhatsNewRequired={false}
      />
    );

    await waitFor(() => {
      expect(queryByText("What's New")).toBeNull();
    });
  });
});
