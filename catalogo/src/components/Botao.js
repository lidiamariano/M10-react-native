import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';

export function Botao({texto, funcao}) {
    return (
            <TouchableOpacity style={estilo.botao} onPress={funcao?? null}>
                <Text style={estilo.textoBotao}>{texto}</Text>
            </TouchableOpacity>
    );
}

const estilo = StyleSheet.create(
    {
        botao: {
            width: "80%",
            padding: 8,
            margin: 10,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: '#f0f0f0',
            backgroundColor: '#000000',
            borderRadius: 20,
        },
        textoBotao: {
            fontSize: 24,
            color: '#c4c4c4',
            padding: 16,
            textAlign: 'center',
        },
    }
);