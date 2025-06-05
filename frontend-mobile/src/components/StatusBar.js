import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeContext } from '../themes/ThemeProvider';
import { MaterialCommunityIcons } from '@expo/vector-icons';


export const StatusBar = ({
                              steps,
                              currentStep,
                              style,
                              ...rest
                          }) => {
    const { theme } = useContext(ThemeContext);

    return (
        <View style={[styles.container, style]} {...rest}>
            {steps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isActive = index === currentStep;

                const stepColor = isCompleted
                    ? theme.colors.statusResolved
                    : isActive
                        ? theme.colors.statusInProgress
                        : theme.colors.border;

                const textColor = isCompleted || isActive
                    ? theme.colors.text
                    : theme.colors.secondary_text;

                const lineColor = index < steps.length - 1
                    ? isCompleted
                        ? theme.colors.statusResolved
                        : theme.colors.border
                    : 'transparent';

                return (
                    <View key={index} style={styles.stepContainer}>
                        <View style={styles.stepContent}>
                            <View
                                style={[
                                    styles.stepCircle,
                                    { backgroundColor: stepColor },
                                ]}
                            >
                                {isCompleted ? (
                                    <MaterialCommunityIcons
                                        name="check"
                                        size={14}
                                        color="white"
                                    />
                                ) : (
                                    <Text style={styles.stepNumber}>
                                        {index + 1}
                                    </Text>
                                )}
                            </View>
                            <Text
                                style={[
                                    styles.stepLabel,
                                    { color: textColor },
                                ]}
                                numberOfLines={2}
                            >
                                {step}
                            </Text>
                        </View>
                        {index < steps.length - 1 && (
                            <View
                                style={[
                                    styles.stepLine,
                                    { backgroundColor: lineColor },
                                ]}
                            />
                        )}
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    stepContainer: {
        flex: 1,
        alignItems: 'center',
    },
    stepContent: {
        alignItems: 'center',
    },
    stepCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    stepNumber: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    stepLabel: {
        fontSize: 12,
        textAlign: 'center',
        maxWidth: 80,
    },
    stepLine: {
        position: 'absolute',
        top: 12,
        right: '-50%',
        width: '100%',
        height: 2,
    },
});

export default StatusBar;