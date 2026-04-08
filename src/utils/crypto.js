import CryptoJS from 'crypto-js';

// The provided 32-byte encryption key (Base64 encoded)
const ENCRYPTION_KEY_B64 = 'a6T8tOCYiSzDTrcqPvCbJfy0wSQOVcfaevH0gtwCtoU=';

/**
 * Encrypts the request body using AES-256-CBC.
 * Generates a random 16-byte IV and prepends it to the result, then Base64 encodes them together.
 */
export const encryptBody = (data) => {
    try {
        const text = typeof data === 'object' ? JSON.stringify(data) : String(data);
        const key = CryptoJS.enc.Base64.parse(ENCRYPTION_KEY_B64);
        const iv = CryptoJS.lib.WordArray.random(16);

        const encrypted = CryptoJS.AES.encrypt(text, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        // Concatenate IV + Ciphertext
        const combined = iv.clone().concat(encrypted.ciphertext);

        // Return as Base64 string
        return combined.toString(CryptoJS.enc.Base64);
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt request body');
    }
};

/**
 * Decrypts the response using AES-256-CBC.
 * Extracts the 16-byte IV from the beginning of the Base64 decoded data.
 */
export const decryptResponse = (encryptedBase64) => {
    try {
        if (!encryptedBase64) {
            throw new Error('Invalid encrypted data format');
        }

        const key = CryptoJS.enc.Base64.parse(ENCRYPTION_KEY_B64);

        // Decode Base64 string to WordArray
        const combined = CryptoJS.enc.Base64.parse(encryptedBase64);

        // The IV is the first 16 bytes (4 words in a WordArray)
        const iv = CryptoJS.lib.WordArray.create(combined.words.slice(0, 4), 16);
        
        // The ciphertext is the remainder
        const ciphertext = CryptoJS.lib.WordArray.create(combined.words.slice(4), combined.sigBytes - 16);

        const decrypted = CryptoJS.AES.decrypt(
            { ciphertext: ciphertext },
            key,
            {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }
        );

        const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
        if (!decryptedText) {
            throw new Error('Decryption resulted in empty string (possibly wrong key or corrupted data)');
        }

        try {
            return JSON.parse(decryptedText);
        } catch (e) {
            return decryptedText;
        }
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt response');
    }
};
