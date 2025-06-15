import { Botao } from '../components/Botao';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, StyleSheet, View, TextInput, SafeAreaView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, Alert, ActionSheetIOS } from 'react-native';
import { use, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import { ImageSelector } from '../components/ImageSelector';

export default function AddItem() {
    const { userId } = useLocalSearchParams();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [priceError, setPriceError] = useState('');
    const [image, setImage] = useState(null);

    const validatePrice = (price) => {
        const re = /^\d+(\.\d{1,2})?$/;
        return re.test(price);
    };

    const handleImageSelected = (imageUri) => {
        setImage(imageUri);
    };
   

    const addItem = async () => {
        setPriceError('');
        let isValid = true;
    
        if (!name || !description) {
            Alert.alert('Erro', 'Por favor, preencha o nome e a descrição do item');
            return;
        }
    
        if (!validatePrice(price)) {
            setPriceError('Por favor, insira um preço válido (ex: 10.99)');
            isValid = false;
        }
    
        if (!image) {
            Alert.alert('Erro', 'Por favor, adicione uma imagem do item');
            return;
        }
    
        if (!isValid) {
            return;
        }
    
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', parseFloat(price));
        
        if (image) {
            let filename = image.split('/').pop();
            let match = /\.(\w+)$/.exec(filename);
            let type = match ? `image/${match[1]}` : 'image/jpeg';
            
            formData.append('image', {
                uri: image,
                name: filename,
                type: type,
            });
        }
    
        try {
            const response = await fetch(`http://10.254.19.101:8080/users/${userId}/products/`, {
                method: 'POST',
                body: formData,
            });
    
            if (!response.ok) {
                let errorText;
                try {
                    const errorData = await response.json();
                    errorText = errorData.detail || 'Erro ao adicionar item';
                } catch (e) {
                    errorText = await response.text();
                }
                throw new Error(errorText);
            }
            const responseData = await response.json();
    
            Alert.alert('Sucesso', 'Item adicionado com sucesso!');
            router.replace({
                pathname: '/home',
                params: { userId: userId }
            });
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Erro', error.message || 'Ocorreu um erro ao adicionar o item');
        }
    } 

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView>
                    <SafeAreaView style={estilo.fundoContainer}>
                        <Text style={{fontSize: 30, fontWeight: 'bold', color: '#693c3f'}}>Adicionar Item</Text>
                        <Text style={{fontSize: 20, color: '#693c3f'}}>Preencha os detalhes do item</Text>
                        
                        <View style={estilo.input}>
                            <Text style={estilo.inputText}>Nome</Text>
                            <TextInput 
                                style={estilo.inputField} 
                                onChangeText={setName}
                                value={name}
                                placeholder="Digite o nome do item"
                                returnKeyType="next"
                            />
                        </View>

                        <View style={estilo.input}>
                            <Text style={estilo.inputText}>Descrição</Text>
                            <TextInput 
                                style={estilo.inputField} 
                                onChangeText={setDescription}
                                value={description}
                                placeholder="Digite a descrição do item"
                                multiline
                                numberOfLines={3}
                                returnKeyType="next"
                            />
                        </View>

                        <View style={estilo.input}>
                            <Text style={estilo.inputText}>Preço</Text>
                            <TextInput 
                                style={[estilo.inputField, priceError ? estilo.inputError : null]} 
                                onChangeText={(text) => {
                                    setPrice(text.replace(',', '.'));
                                    if (priceError) setPriceError('');
                                }}
                                value={price}
                                placeholder="Digite o preço (ex: 19.99)"
                                keyboardType="decimal-pad"
                                returnKeyType="next"
                            />
                            {priceError ? <Text style={estilo.errorText}>{priceError}</Text> : null}
                        </View>

                        <View style={[estilo.input, { alignItems: 'center' }]}>
                            <Text style={estilo.inputText}>Imagem do Item</Text>
                            <ImageSelector onImageSelected={handleImageSelected} />
                        </View>

                        <Botao texto={"Adicionar Item"} funcao={addItem}/>
                    </SafeAreaView>
                </ScrollView>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}

const estilo = StyleSheet.create(
    {
        fundoContainer: {
            backgroundColor: '#F9F6EE',
            flex: 1,
            padding: 16,
            alignItems: 'center',
            justifyContent: 'center',
        },
        inputField: {
            borderColor: 'black',
            borderRadius: 10,
            borderWidth: 2,
            padding: 10, 
        },
        inputError: {
            borderColor: 'red',
        },
        inputText: {
            margin: 5
        },
        input: {
            width: '80%',
            margin: 10
        },
        errorText: {
            color: 'red',
            fontSize: 12,
            marginTop: 5,
        }
    }
);