import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useContext } from 'react';
import { ThemeContext } from '../themes/ThemeProvider';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const Button = ({
                           title,
                           onPress,
                           variant = 'primary',
                           icon,
                           disabled = false,
                           loading = false,
                           style,
                           textStyle,
                           ...rest
                       }) => {
    const { theme } = useContext(ThemeContext);

    const getBackgroundColor = () => {
        if (disabled) return 'rgba(0, 0, 0, 0.12)';

        switch (variant) {
            case 'primary':
                return theme.colors.buttonPrimary;
            case 'secondary':
                return theme.colors.buttonSecondary;
            case 'outline':
                return 'transparent';
            default:
                return theme.colors.buttonPrimary;
        }
    };

    const getTextColor = () => {
        if (disabled) return 'rgba(0, 0, 0, 0.38)';

        switch (variant) {
            case 'primary':
            case 'secondary':
                return theme.colors.white;
            case 'outline':
                return theme.colors.buttonPrimary;
            default:
                return theme.colors.white;
        }
    };

    const getBorderStyle = () => {
        return variant === 'outline'
            ? { borderWidth: 1, borderColor: theme.colors.buttonPrimary }
            : {};
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.button,
                {
                    backgroundColor: getBackgroundColor(),
                },
                getBorderStyle(),
                style,
            ]}
            {...rest}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <>
                    {icon && (
                        <MaterialCommunityIcons
                            name={icon}
                            size={20}
                            color={getTextColor()}
                            style={styles.icon}
                        />
                    )}
                    <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
    },
    icon: {
        marginRight: 8,
    },
});