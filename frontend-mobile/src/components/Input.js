import React, { useState, useContext } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { ThemeContext } from '../themes/ThemeProvider';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const Input = ({
                          label,
                          placeholder,
                          value,
                          onChangeText,
                          secureTextEntry,
                          keyboardType,
                          autoCapitalize = 'none',
                          error,
                          helper,
                          leftIcon,
                          rightIcon,
                          onRightIconPress,
                          multiline = false,
                          numberOfLines = 1,
                          style,
                          inputStyle,
                          ...rest
                      }) => {
    const { theme } = useContext(ThemeContext);
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const handleFocus = () => {
        setIsFocused(true);
        if (rest.onFocus) {
            rest.onFocus();
        }
    };

    const handleBlur = () => {
        setIsFocused(false);
        if (rest.onBlur) {
            rest.onBlur();
        }
    };

    const getBorderColor = () => {
        if (error) {
            return 'red';
        }
        if (isFocused) {
            return theme.colors.primary;
        }
        return theme.colors.border;
    };

    return (
        <View style={[styles.container, style]}>
            {label && (
                <Text style={[styles.label, { color: theme.colors.text }]}>
                    {label}
                </Text>
            )}

            <View
                style={[
                    styles.inputContainer,
                    {
                        backgroundColor: theme.colors.inputBackground,
                        borderColor: getBorderColor(),
                        minHeight: multiline ? 100 : 50,
                    },
                ]}
            >
                {leftIcon && (
                    <MaterialCommunityIcons
                        name={leftIcon}
                        size={20}
                        color={theme.colors.secondary_text}
                        style={styles.leftIcon}
                    />
                )}

                <TextInput
                    style={[
                        styles.input,
                        {
                            color: theme.colors.text,
                            textAlignVertical: multiline ? 'top' : 'center',
                        },
                        inputStyle,
                    ]}
                    placeholder={placeholder}
                    placeholderTextColor={theme.colors.placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry && !isPasswordVisible}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    multiline={multiline}
                    numberOfLines={multiline ? numberOfLines : 1}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...rest}
                />

                {secureTextEntry && (
                    <TouchableOpacity
                        onPress={togglePasswordVisibility}
                        style={styles.rightIcon}
                    >
                        <MaterialCommunityIcons
                            name={isPasswordVisible ? 'eye-off' : 'eye'}
                            size={20}
                            color={theme.colors.secondary_text}
                        />
                    </TouchableOpacity>
                )}

                {rightIcon && !secureTextEntry && (
                    <TouchableOpacity
                        onPress={onRightIconPress}
                        style={styles.rightIcon}
                        disabled={!onRightIconPress}
                    >
                        <MaterialCommunityIcons
                            name={rightIcon}
                            size={20}
                            color={theme.colors.secondary_text}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {(error || helper) && (
                <Text
                    style={[
                        styles.helperText,
                        {
                            color: error ? 'red' : theme.colors.secondary_text,
                        },
                    ]}
                >
                    {error || helper}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        marginBottom: 8,
        fontSize: 14,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
    },
    input: {
        flex: 1,
        height: '100%',
        paddingVertical: 12,
    },
    leftIcon: {
        marginRight: 10,
    },
    rightIcon: {
        padding: 4,
    },
    helperText: {
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
});

export default Input;