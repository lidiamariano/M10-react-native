import { Botao } from '../components/Botao';
import { router, Link } from 'expo-router';
import { Text, StyleSheet, View, TextInput, SafeAreaView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { ImageSelector } from '../components/ImageSelector';

export default function Cadastro() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [cellphone, setCellphone] = useState('');
    const [cellphoneError, setCellphoneError] = useState('');
    const [password, setPassword] = useState('');
    const [database, setDatabase] = useState([]);
    const [image, setImage] = useState(null);

    const fetchDatabase = async () => {
        try {
            const response = await fetch('http://10.254.19.101:8080/users');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setDatabase(data);
        } catch (error) {
            console.error('Erro ao buscar o banco de dados:', error);
            setDatabase([]); // Inicializa com um array vazio se houver erro
        }
    };

    const handleImageSelected = (imageUri) => {
        setImage(imageUri);
    };

    useEffect(() => {
        fetchDatabase();
    }, []);

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const validateCellphone = (phone) => {
        const re = /^(\+55)?[\s-]?\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/;
        return re.test(phone);
    };

    const isEmailRegistered = (email) => {
        return database.some(user => user.email.toLowerCase() === email.toLowerCase());
    };

    const signUp = async () => {
        setEmailError('');
        setCellphoneError('');

        let isValid = true;

        if (!firstName || !lastName) {
            Alert.alert('Erro', 'Por favor, preencha seu nome e sobrenome');
            return;
        }

        if (!validateEmail(email)) {
            setEmailError('Por favor, insira um e-mail válido');
            isValid = false;
        } else if (isEmailRegistered(email)) {
            setEmailError('Este e-mail já está cadastrado');
            isValid = false;
        }

        if (!validateCellphone(cellphone)) {
            setCellphoneError('Por favor, insira um número de celular válido');
            isValid = false;
        }

        if (!password) {
            Alert.alert('Erro', 'Por favor, crie uma senha');
            return;
        }

        if (!isValid) {
            return;
        }
        const userId = database.length > 0 ? database[database.length - 1].id + 1 : 1;
        
        const formData = new FormData();
        formData.append('name', `${firstName} ${lastName}`);
        formData.append('email', email);
        formData.append('cellphone', cellphone);
        formData.append('password', password);
        
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
            const response = await fetch(`http://10.254.19.101:8080/users/`, {
                method: 'POST',
                body: formData,
            });
    
            if (!response.ok) {
                let errorText;
                try {
                    const errorData = await response.json();
                    errorText = errorData.detail || 'Erro ao cadastrar usuário';
                } catch (e) {
                    errorText = await response.text();
                }
                throw new Error(errorText);
            }
            const responseData = await response.json();
    
            Alert.alert('Sucesso', 'Usuário cadastrado com sucesso!');
            router.replace({
                pathname: '/home',
                params: { userId: userId }
            });
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Erro', error.message || 'Ocorreu um erro ao cadastrar o usuário');
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
                        <Text style={{fontSize: 30, fontWeight: 'bold', color: '#693c3f'}}>Crie sua conta</Text>
                        <Text style={{fontSize: 20, color: '#693c3f'}}>Preencha seus dados</Text>
                        
                        <View style={estilo.input}>
                            <Text style={estilo.inputText}>Nome</Text>
                            <TextInput 
                                style={estilo.inputField} 
                                onChangeText={setFirstName}
                                value={firstName}
                                placeholder="Digite seu nome"
                                returnKeyType="next"
                            />
                        </View>

                        <View style={estilo.input}>
                            <Text style={estilo.inputText}>Sobrenome</Text>
                            <TextInput 
                                style={estilo.inputField} 
                                onChangeText={setLastName}
                                value={lastName}
                                placeholder="Digite seu sobrenome"
                                returnKeyType="next"
                            />
                        </View>

                        <View style={estilo.input}>
                            <Text style={estilo.inputText}>E-mail</Text>
                            <TextInput 
                                style={[estilo.inputField, emailError ? estilo.inputError : null]} 
                                onChangeText={(text) => {
                                    setEmail(text);
                                    if (emailError) setEmailError('');
                                }}
                                value={email}
                                placeholder="Digite seu e-mail"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                returnKeyType="next"
                            />
                            {emailError ? <Text style={estilo.errorText}>{emailError}</Text> : null}
                        </View>

                        <View style={estilo.input}>
                            <Text style={estilo.inputText}>Celular</Text>
                            <TextInput 
                                style={[estilo.inputField, cellphoneError ? estilo.inputError : null]} 
                                onChangeText={(text) => {
                                    setCellphone(text);
                                    if (cellphoneError) setCellphoneError('');
                                }}
                                value={cellphone}
                                placeholder="Digite seu número (ex: 11987654321)"
                                keyboardType="phone-pad"
                                returnKeyType="next"
                            />
                            {cellphoneError ? <Text style={estilo.errorText}>{cellphoneError}</Text> : null}
                        </View>

                        <View style={estilo.input}>
                            <Text style={estilo.inputText}>Senha</Text>
                            <TextInput 
                                style={estilo.inputField} 
                                onChangeText={setPassword} 
                                value={password} 
                                placeholder="Crie uma senha"
                                secureTextEntry={true}
                                returnKeyType="done"
                            />
                        </View>
                        <View style={[estilo.input, { alignItems: 'center' }]}>
                            <Text style={estilo.inputText}>Foto de perfil</Text>
                            <ImageSelector onImageSelected={handleImageSelected} />
                        </View>

                        <Link href={'/'} style={estilo.redirect}> Já tem uma conta? Faça login! </Link>
                        <Botao texto={"Cadastrar"} funcao={signUp}/>
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
        redirect: {
            color: '#693c3f',
            fontSize: 16,
            marginTop: 20,
            marginBottom: 20,
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