import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';

export function CustomHeader({ navigation, route, options, back}) {
  const [profileImage, setProfileImage] = useState(null);
  const [unreadCount, setUnreadCount] = useState();

  useFocusEffect(() => {
    const fetchProfileImage = async () => {
      if (!route.params || !route.params.userId) {
        console.log('No userId provided');
        return;
      }

      try {
        const response = await fetch(`http://10.254.19.101:8080/users/${route.params.userId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const user = await response.json();

        if (user?.image) {
          setProfileImage(user.image);
        } else {
          console.log('No image found for user');
          setProfileImage(null);
        }
      } catch (error) {
        console.error('Failed to fetch profile image:', error);
        setProfileImage(null);
      }
    };
    const fetchUnreadCount = async () => {
      if (!route.params || !route.params.userId) {
        console.log('No userId provided for unread count');
        return;
      }
      try {
        const response = await fetch(`http://10.254.19.101:8080/users/${route.params.userId}/notifications/`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const notifications = await response.json();
        const unreadNotifications = notifications.filter(notification => !notification.is_read);
        setUnreadCount(unreadNotifications.length);
      } catch (error) {
        console.error('Failed to fetch unread notifications:', error);
        setUnreadCount(0);
      }
    }
    fetchUnreadCount();

    fetchProfileImage();
  });

  return (
    <View style={styles.container}>
      {back && route.name !== "home/(tabs)/index" ? (
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>‹ Voltar</Text>
        </TouchableOpacity>
      ) : null}
      
      <Text style={styles.title}>
        {options.title ?? route.name}
      </Text>
      
      <View style={styles.iconsContainer}>
      {route.name === 'newItem' ? null : (
        <TouchableOpacity 
        onPress={() => router.push({pathname : '/newItem', params: {userId: route.params.userId }})}
        style={styles.notificationButton}
      >
        <Image
          source={require('../../assets/add.png')}
          style={styles.icon}
        />
      </TouchableOpacity>
      )}
        <TouchableOpacity 
          onPress={() => router.push({pathname : '/notifications', params: {userId: route.params.userId }})}
          style={styles.notificationButton}
        >
          <Image
            source={require('../../assets/notification-icon.png')}
            style={styles.icon}
          />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => router.push({pathname : '/profile', params: {userId: route.params.userId }})}
          style={styles.profileButton}
        >
          {profileImage ? (
            <Image
              source={{ uri: profileImage }}
              style={styles.profileImage}
              onError={(e) => {
                console.log('Image load error:', e.nativeEvent.error);
                setProfileImage(null);
              }}
            />
          ) : (
            <Image
              source={require('../../assets/default-profile.png')}
              style={styles.profileImage}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
  },
  backButton: {
    fontSize: 18,
    color: '#fff',
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  notificationButton: {
    marginRight: 16,
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: 'red',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});