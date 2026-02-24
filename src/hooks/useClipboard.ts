import React from 'react';

// eslint-disable-next-line prettier/prettier
let ClipboardModule: { setString: (value: string) => Promise<void> | void } | null = null;

try {
  // Prefer community clipboard package for React Native 0.60+
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  ClipboardModule = require('@react-native-clipboard/clipboard');
} catch (e) {
  try {
    // Fallback for older React Native versions that still export Clipboard
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    const rn = require('react-native');
    ClipboardModule = rn.Clipboard ?? null;
  } catch {
    ClipboardModule = null;
  }
}

export function useClipboard() {
  const [hasCopied, setHasCopied] = React.useState(false);
  const [value, setValue] = React.useState<string>('');

  const onCopy = async (copiedValue: string) => {
    if (ClipboardModule && typeof ClipboardModule.setString === 'function') {
      await ClipboardModule.setString(copiedValue);
    }

    setValue(copiedValue);
    setHasCopied(true);
  };

  return {
    value,
    onCopy,
    hasCopied,
  };
}
