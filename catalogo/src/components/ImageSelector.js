import React, { useState } from 'react';
import { Platform, Alert, ActionSheetIOS } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import { Botao } from './Botao'; // Make sure to import your Botao component

export const ImageSelector = ({ onImageSelected }) => {
    const [image, setImage] = useState(null);
    
    const pickImage = async () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancelar', 'Tirar foto', 'Escolher da galeria'],
                    cancelButtonIndex: 0,
                },
                async (buttonIndex) => {
                    if (buttonIndex === 1) {
                        await takePhoto();
                    } else if (buttonIndex === 2) {
                        await selectFromLibrary();
                    }
                }
            );
        } else {
            Alert.alert(
                'Selecionar Imagem',
                'Escolha uma opção',
                [
                    {
                        text: 'Cancelar',
                        style: 'cancel',
                    },
                    {
                        text: 'Tirar foto',
                        onPress: async () => await takePhoto(),
                    },
                    {
                        text: 'Escolher da galeria',
                        onPress: async () => await selectFromLibrary(),
                    },
                ]
            );
        }
    };
    
    const takePhoto = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission required', 'We need camera permissions to take pictures');
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            if (onImageSelected) {
                onImageSelected(result.assets[0].uri);
            }
        }
    };
    
    const selectFromLibrary = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission required', 'We need gallery permissions to select images');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            if (onImageSelected) {
                onImageSelected(result.assets[0].uri);
            }
        }
    };
    
    return (
        <Botao 
            texto={image ? "Alterar Imagem" : "Adicionar Imagem"} 
            funcao={pickImage}
            estiloExtra={{width: '100%'}}
        />
    );
};
