import React, { useContext } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { ThemeContext } from '../themes/ThemeProvider';


export const Avatar = ({
                           source,
                           name,
                           size = 'medium',
                           variant = 'circle',
                           style,
                           ...rest
                       }) => {
    const { theme } = useContext(ThemeContext);

    const getSize = () => {
        switch (size) {
            case 'small':
                return 36;
            case 'large':
                return 80;
            case 'medium':
            default:
                return 50;
        }
    };

    const getBorderRadius = () => {
        const dimension = getSize();

        switch (variant) {
            case 'circle':
                return dimension / 2;
            case 'rounded':
                return dimension / 5;
            case 'square':
                return 0;
            default:
                return dimension / 2;
        }
    };

    const getInitials = () => {
        if (!name) return '?';

        const names = name.split(' ');
        if (names.length === 1) {
            return names[0].charAt(0).toUpperCase();
        }

        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    };

    const dimension = getSize();
    const borderRadius = getBorderRadius();

    if (!source) {
        return (
            <View
                style={[
                    styles.placeholder,
                    {
                        backgroundColor: theme.colors.primary,
                        width: dimension,
                        height: dimension,
                        borderRadius: borderRadius,
                    },
                    style,
                ]}
                {...rest}
            >
                <Text
                    style={[
                        styles.initials,
                        {
                            fontSize: dimension * 0.4,
                        },
                    ]}
                >
                    {getInitials()}
                </Text>
            </View>
        );
    }

    return (
        <Image
            source={typeof source === 'string' ? { uri: source } : source}
            style={[
                {
                    width: dimension,
                    height: dimension,
                    borderRadius: borderRadius,
                },
                style,
            ]}
            resizeMode="cover"
            {...rest}
        />
    );
};

const styles = StyleSheet.create({
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    initials: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default Avatar;