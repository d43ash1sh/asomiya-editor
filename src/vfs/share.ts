/**
 * Utilities for serializing and deserializing Asomiya code to/from URL hash
 * with full Unicode UTF-8 support for Assamese characters.
 */

export function encodeShareCode(code: string): string {
  try {
    const bytes = new TextEncoder().encode(code);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return encodeURIComponent(btoa(binary));
  } catch (err) {
    console.error('Failed to encode code for share URL:', err);
    return '';
  }
}

export function decodeShareCode(encodedHash: string): string | null {
  try {
    let clean = encodedHash.startsWith('#') ? encodedHash.slice(1) : encodedHash;
    if (clean.startsWith('code=')) {
      clean = clean.slice(5);
    }
    const binary = atob(decodeURIComponent(clean));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch (err) {
    console.error('Failed to decode code from share URL:', err);
    return null;
  }
}
