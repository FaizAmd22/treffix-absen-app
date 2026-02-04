import { FingerprintAIO } from '@ionic-native/fingerprint-aio';
import { f7 } from 'framework7-react';
import { showToast, showToastFailed } from './toast';
import { useSelector } from 'react-redux';
import { selectSettings } from '../slices/settingsSlice';

export const BiometricAuth = {
    isAvailable: async () => {
        try {
            const isAvailable = await FingerprintAIO.isAvailable();
            // console.log('Biometric availability:', isAvailable);
            return isAvailable;
        } catch (error) {
            console.error('Biometric not available:', error);
            return false;
        }
    },

    saveToken: async (token) => {
        try {
            // console.log('Attempting to save token:', token);

            if (!token) {
                console.error('Token is undefined or null');
                return false;
            }

            const result = await FingerprintAIO.registerBiometricSecret({
                secret: token,
                description: "Login credentials",
                invalidateOnEnrollment: false,
                disableBackup: false
            });

            // console.log('Token save result:', result);
            return true;
        } catch (error) {
            console.error('Failed to save biometric token:', error);
            return false;
        }
    },

    getToken: async () => {
        try {
            // console.log('Attempting to retrieve token');
            const result = await FingerprintAIO.loadBiometricSecret({
                description: "Please authenticate to login",
                disableBackup: false
            });

            // console.log('Full result object:', result);

            if (typeof result === 'string') {
                return result;
            } else if (result && typeof result === 'object') {
                // console.log('Result keys:', Object.keys(result));

                const token = result.secret || result.password || result.token || result;
                // console.log('Retrieved token:', token);

                return token;
            }

            throw new Error('Token tidak ditemukan');
        } catch (error) {
            console.error('Biometric authentication failed:', error);
            throw error;
        }
    },

    deleteToken: async () => {
        const theme = useSelector(selectSettings)

        try {
            // console.log('Attempting to clear biometric token');
            await FingerprintAIO.registerBiometricSecret({
                secret: "",
                description: "Login credentials",
                invalidateOnEnrollment: true,
                disableBackup: false
            });
            // console.log('Biometric token cleared successfully');
            // f7.dialog.alert("Biometric token cleared successfully");
            showToast("Biometric token cleared successfully", theme)

            return true;
        } catch (error) {
            console.error('Failed to clear biometric token:', error);
            // f7.dialog.alert(`Failed to clear biometric token: ${error}`);
            // showToastFailed(`Failed to clear biometric token: ${error}`)
            return false;
        }
    }

};