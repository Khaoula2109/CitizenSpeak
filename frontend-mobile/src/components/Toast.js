import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Toast = ({
                   visible,
                   message,
                   type = 'error',
                   duration = 4000,
                   onHide,
                   position = 'top',
               }) => {
    const [isVisible, setIsVisible] = useState(visible);
    const slideAnim = useRef(new Animated.Value(-100)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            setIsVisible(true);
            showToast();
        } else {
            hideToast();
        }
    }, [visible]);

    const showToast = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            if (duration > 0) {
                setTimeout(() => {
                    hideToast();
                }, duration);
            }
        });
    };

    const hideToast = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: position === 'top' ? -100 : 100,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setIsVisible(false);
            if (onHide) onHide();
        });
    };

    const getToastConfig = () => {
        switch (type) {
            case 'success':
                return {
                    backgroundColor: '#27ae60',
                    icon: 'check-circle',
                    iconColor: '#ffffff',
                };
            case 'warning':
                return {
                    backgroundColor: '#f39c12',
                    icon: 'alert-circle',
                    iconColor: '#ffffff',
                };
            case 'info':
                return {
                    backgroundColor: '#3498db',
                    icon: 'information',
                    iconColor: '#ffffff',
                };
            case 'error':
            default:
                return {
                    backgroundColor: '#e74c3c',
                    icon: 'alert-circle',
                    iconColor: '#ffffff',
                };
        }
    };

    if (!isVisible) return null;

    const config = getToastConfig();

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    [position]: 50,
                    backgroundColor: config.backgroundColor,
                    transform: [{ translateY: slideAnim }],
                    opacity: opacityAnim,
                },
            ]}
        >
            <View style={styles.content}>
                <MaterialCommunityIcons
                    name={config.icon}
                    size={24}
                    color={config.iconColor}
                    style={styles.icon}
                />
                <Text style={styles.message} numberOfLines={3}>
                    {message}
                </Text>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={hideToast}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons
                        name="close"
                        size={20}
                        color={config.iconColor}
                    />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 16,
        right: 16,
        borderRadius: 12,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        zIndex: 9999,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    icon: {
        marginRight: 12,
    },
    message: {
        flex: 1,
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
    },
    closeButton: {
        padding: 4,
        marginLeft: 8,
    },
});

export default Toast;