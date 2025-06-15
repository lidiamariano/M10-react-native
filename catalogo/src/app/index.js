import { Botao } from '../components/Botao';
import { router, Link } from 'expo-router';
import { Text, StyleSheet, View, TextInput, Alert} from 'react-native';
import { useState, useEffect } from 'react';

export default function TelaPrincipal() {

    const [email, setEmail] = useState('');  
    const [senha, setSenha] = useState(''); 

    const [database, setDatabase] = useState([]);
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
    }
    useEffect(() => {
        fetchDatabase();
    }, []);

    const getUserId = (email) => {
        const user = database.find(user => user.email.toLowerCase() === email.toLowerCase());
        return user ? user.id : null;
    };

    const isEmailRegistered = (email) => {
        return database.some(user => user.email.toLowerCase() === email.toLowerCase());
    };
    
    const isPasswordValid = (email, password) => {
        const user = database.find(user => user.email.toLowerCase() === email.toLowerCase());
        return user && user.password === password;
    };

    const handleLogin = () => {
        if (!email || !senha) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos');
            return;
        }

        if (!isEmailRegistered(email)) {
            Alert.alert('Erro', 'E-mail não cadastrado.');
            return;
        }

        if (!isPasswordValid(email, senha)) {
            Alert.alert('Erro', 'Senha incorreta.');
            return;
        }

        const userId = getUserId(email);
        router.replace({
            pathname: "/home",
            params: { userId: userId }
        });
    }

    return (
        <View style={estilo.fundoContainer}>
            <Text style={{fontSize: 30, fontWeight: 'bold', color: '#693c3f'}}>Bem-vindo(a)!</Text>
            <Text style={{fontSize: 20, color: '#693c3f'}}>Faça login para continuar</Text>
            <View style={estilo.input}>
                <Text style={estilo.inputText}>E-mail</Text>
                <TextInput 
                    style={estilo.inputField} 
                    onChangeText={setEmail}
                    value={email}
                    placeholder="Digite seu e-mail"
                    keyboardType="email-address"
                />
            </View>
            <View style={estilo.input}>
                <Text style={estilo.inputText}>Senha</Text>
                <TextInput 
                    style={estilo.inputField} 
                    onChangeText={setSenha} 
                    value={senha} 
                    secureTextEntry={true}
                    placeholder="Digite sua senha" 
                />
            </View>
            <Link href={'/cadastro'} style={estilo.redirect}> Não tem uma conta? Cadastre-se! </Link>
            <Botao texto={"Entrar"} funcao={handleLogin}/>
        </View>
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
        inputText: {
            margin: 10
        },
        input: {
            width: '80%',
            margin: 15
        }
    }
);