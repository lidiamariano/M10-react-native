import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
    TouchableOpacity
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

const SERVER = 'http://10.254.19.101:8080';

export default function Profile() {
    const { userId } = useLocalSearchParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch(`${SERVER}/users/${userId}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                setUser(json);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, [userId]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }
    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>Erro: {error}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.profileContainer}>
                <Image
                    source={{ uri: user.image }}
                    style={styles.profileImage}
                    resizeMode="cover"
                />
                <View style={styles.infoContainer}>
                    <Text style={styles.label}>Nome</Text>
                    <Text style={styles.value}>{user.name}</Text>

                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{user.email}</Text>

                    <Text style={styles.label}>Celular</Text>
                    <Text style={styles.value}>{user.cellphone}</Text>
                </View>

                <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => router.push({pathname:'/editProfile', params: { userId: userId }})}
                >
                    <Text style={styles.editButtonText}>Alterar informações</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    error: {
        color: 'red',
    },
    profileContainer: {
        padding: 20,
        alignItems: 'center',
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 20,
        backgroundColor: '#eee',
    },
    infoContainer: {
        width: '100%',
        marginBottom: 30,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginTop: 10,
    },
    value: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    editButton: {
        backgroundColor: '#000000',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 6,
        marginTop: 20,
    },
    editButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
});