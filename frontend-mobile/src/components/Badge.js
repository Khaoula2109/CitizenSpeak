import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeContext } from '../themes/ThemeProvider';

export const Badge = ({
                          text,
                          variant = 'default',
                          size = 'medium',
                          style,
                          textStyle,
                          ...rest
                      }) => {
    const { theme } = useContext(ThemeContext);

    const getBadgeColor = () => {
        switch (variant) {
            case 'success':
                return theme.colors.statusResolved;
            case 'warning':
                return theme.colors.statusInProgress;
            case 'error':
                return 'red';
            case 'info':
                return theme.colors.statusSubmitted;
            default:
                return theme.colors.secondary_text;
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return {
                    paddingVertical: 2,
                    paddingHorizontal: 6,
                    borderRadius: 4,
                    fontSize: 10,
                };
            case 'large':
                return {
                    paddingVertical: 4,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    fontSize: 14,
                };
            case 'medium':
            default:
                return {
                    paddingVertical: 3,
                    paddingHorizontal: 8,
                    borderRadius: 6,
                    fontSize: 12,
                };
        }
    };

    const sizeStyles = getSizeStyles();

    return (
        <View
            style={[
                styles.badge,
                {
                    backgroundColor: getBadgeColor(),
                    paddingVertical: sizeStyles.paddingVertical,
                    paddingHorizontal: sizeStyles.paddingHorizontal,
                    borderRadius: sizeStyles.borderRadius,
                },
                style,
            ]}
            {...rest}
        >
            <Text
                style={[
                    styles.text,
                    {
                        fontSize: sizeStyles.fontSize,
                    },
                    textStyle,
                ]}
                numberOfLines={1}
            >
                {text}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        alignSelf: 'flex-start',
    },
    text: {
        color: 'white',
        fontWeight: '500',
    },
});

export default Badge;