import React, { useContext } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemeContext } from '../themes/ThemeProvider';


export const Card = ({
                         children,
                         variant = 'default',
                         style,
                         onPress,
                         ...rest
                     }) => {
    const { theme } = useContext(ThemeContext);

    const getCardStyle = () => {
        const baseStyle = {
            backgroundColor: theme.colors.cardBackground,
            borderRadius: 12,
            padding: 16,
        };

        switch (variant) {
            case 'elevated':
                return {
                    ...baseStyle,
                    elevation: 4,
                    shadowColor: theme.colors.shadow,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                };
            case 'flat':
                return {
                    ...baseStyle,
                    elevation: 0,
                    shadowOpacity: 0,
                };
            case 'outline':
                return {
                    ...baseStyle,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    elevation: 0,
                    shadowOpacity: 0,
                };
            default:
                return {
                    ...baseStyle,
                    elevation: 2,
                    shadowColor: theme.colors.shadow,
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                };
        }
    };

    if (onPress) {
        return (
            <TouchableOpacity
                style={[styles.container, getCardStyle(), style]}
                onPress={onPress}
                activeOpacity={0.7}
                {...rest}
            >
                {children}
            </TouchableOpacity>
        );
    }

    return (
        <View
            style={[styles.container, getCardStyle(), style]}
            {...rest}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
});

export default Card;