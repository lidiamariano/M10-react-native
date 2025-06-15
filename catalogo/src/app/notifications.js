import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const SERVER = 'http://10.254.19.101:8080';

export default function Notifications() {
    const { userId } = useLocalSearchParams();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchNotifications() {
            try {
                const res = await fetch(`${SERVER}/users/${userId}/notifications`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                const unreadNotifications = json.filter(notification => !notification.is_read);
                setNotifications(unreadNotifications);
                const res2 = await fetch(`${SERVER}/users/${userId}/notifications/read_all`, {
                    method: 'PUT'
                });
                if (!res2.ok) throw new Error(`HTTP ${res2.status}`);
                await res2.json();
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }
        fetchNotifications()
    }, []);

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
    if (!notifications || notifications.length === 0) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>Nenhum notificação não lida</Text>
            </View>
        );
    }


    const renderCard = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.info}>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.message}>{item.message}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={renderCard}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    list: {
        padding: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignNotifications: 'center',
        alignItems: 'center',
        alignContent : 'center',
    },
    error: {
        color: 'red',
    },
    card: {
        backgroundColor: '#fafafa',
        borderBottomColor: '#ddd',
        borderBottomWidth: 1,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    image: {
        width: '100%',
        height: 150,
        backgroundColor: '#eee',
    },
    info: {
        padding: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
        color: '#333',
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        color: '#666',
        marginBottom: 8,
    },
    message: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0F0F0F', 
    },
    button: {
        backgroundColor: '#FFA07A',
        paddingVertical: 10,
        alignNotifications: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    }
});
