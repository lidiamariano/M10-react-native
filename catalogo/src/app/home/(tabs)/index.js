import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
    TouchableOpacity,
    Modal
} from 'react-native';
import { useRouter } from 'expo-router';

const SERVER = 'http://10.254.19.101:8080';

export default function home() {
    const router = useRouter();
    const { userId } = router.params || {};
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Novo estado para modal
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        async function fetchItems() {
            try {
                const res = await fetch(`${SERVER}/products`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                setItems(json);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }
        fetchItems()
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
    if (!items || items.length === 0) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>Nenhum dado disponível</Text>
            </View>
        );
    }

    const openModal = (item) => {
        setSelectedItem(item);
        setModalVisible(true);
    };

    const renderCard = ({ item }) => (
        <TouchableOpacity onPress={() => openModal(item)}>
            <View style={styles.card}>
                <Image
                    source={{ uri: `${item.image}` }}
                    style={styles.image}
                    resizeMode="cover"
                />
                <View style={styles.info}>
                    <Text style={styles.title}>{item.name}</Text>
                    <Text style={styles.price}>R$ {item.price}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={items}
                keyExtractor={(item) => item.id}
                renderItem={renderCard}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />

            {/* Modal de detalhes */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedItem && (
                            <>
                                <Image
                                    source={{ uri: `${selectedItem.image}` }}
                                    style={styles.modalImage}
                                    resizeMode="cover"
                                />
                                <Text style={styles.modalTitle}>{selectedItem.name}</Text>
                                <Text style={styles.modalDescription}>
                                    {selectedItem.description}
                                </Text>
                                <Text style={styles.modalPrice}>
                                    R$ {selectedItem.price}
                                </Text>
                            </>
                        )}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        alignItems: 'center',
    },
    error: {
        color: 'red',
    },
    card: {
        backgroundColor: '#fafafa',
        borderRadius: 8,
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
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0F0F0F', 
    },
    button: {
        backgroundColor: '#FFA07A',
        paddingVertical: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
    },
    modalImage: { width: '100%', height: 180, borderRadius: 4, marginBottom: 12 },
    modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8, color: '#333' },
    modalDescription: { fontSize: 16, lineHeight: 22, color: '#555', marginBottom: 12 },
    modalPrice: { fontSize: 18, fontWeight: 'bold', color: '#0F0F0F', marginBottom: 16 },

    closeButton: {
        backgroundColor: '#000000',
        paddingVertical: 10,
        borderRadius: 6,
        alignItems: 'center',
    },
    closeButtonText: { color: '#ffF', fontSize: 16, fontWeight: '500' },
});
