import { DefaultTheme, DarkTheme } from '@react-navigation/native';

const colors = {
    black: '#FF000000',
    white: '#FFFFFFFF',
    maron: '#6a2202',
    moutarde: '#bc7404',
    moutarde2: '#d6a861',
    maron2: '#844c2c',
    primary_color: '#844c2c',
    light_gray_background: '#F5F5F5',
    secondary_text: '#757575',
    maron3: '#d6bcaa',
    option_background: '#f2e8fa',
    selected_option_background: '#e8d8f7',
    text_dark: '#333333',
    switch_brown: '#8B4513',
    switch_brown_track: '#D2B48C',
    switch_thumb_normal: '#FFFFFF',
    switch_track_normal: '#CCCCCC',
};

export const lightTheme = {
    ...DefaultTheme,
    dark: false,
    colors: {
        ...DefaultTheme.colors,
        ...colors,
        primary: colors.primary_color,
        background: colors.light_gray_background,
        card: colors.white,
        text: colors.text_dark,
        border: '#E0E0E0',
        notification: colors.moutarde,
        placeholder: colors.secondary_text,
        shadow: colors.black,
        buttonPrimary: colors.maron2,
        buttonSecondary: colors.moutarde,
        statusSubmitted: '#3498db',
        statusInProgress: '#f39c12',
        statusResolved: '#2ecc71',
        inputBackground: colors.white,
        cardBackground: colors.white,
        switchTrack: colors.switch_track_normal,
        switchThumb: colors.switch_thumb_normal,
        switchTrackActive: colors.switch_brown_track,
        switchThumbActive: colors.switch_brown,
    },
    components: {
        button: {
            borderRadius: 8,
            paddingVertical: 12,
            paddingHorizontal: 24,
            elevation: 3,
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
        },
        card: {
            borderRadius: 12,
            padding: 16,
            marginVertical: 8,
            backgroundColor: colors.white,
            elevation: 3,
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
        },
        input: {
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#E0E0E0',
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: colors.white,
        },
    },
    navigation: {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            primary: colors.primary_color,
            background: colors.light_gray_background,
            card: colors.white,
            text: colors.text_dark,
            border: '#E0E0E0',
            notification: colors.moutarde,
        },
    },
};

export const darkTheme = {
    ...DarkTheme,
    dark: true,
    colors: {
        ...DarkTheme.colors,
        ...colors,
        primary: colors.maron,
        background: '#121212',
        card: '#242424',
        text: colors.white,
        border: '#3A3A3A',
        notification: colors.moutarde,
        placeholder: '#AAAAAA',
        shadow: '#000000',
        buttonPrimary: colors.maron,
        buttonSecondary: colors.moutarde,
        statusSubmitted: '#3498db',
        statusInProgress: '#f39c12',
        statusResolved: '#2ecc71',
        inputBackground: '#333333',
        cardBackground: '#242424',
        switchTrack: '#666666',
        switchThumb: colors.white,
        switchTrackActive: colors.maron3,
        switchThumbActive: colors.maron,
    },
    components: {
        button: {
            borderRadius: 8,
            paddingVertical: 12,
            paddingHorizontal: 24,
            elevation: 3,
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.4,
            shadowRadius: 2,
        },
        card: {
            borderRadius: 12,
            padding: 16,
            marginVertical: 8,
            backgroundColor: '#242424',
            elevation: 3,
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
        },
        input: {
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#3A3A3A',
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: '#333333',
        },
    },
    navigation: {
        ...DarkTheme,
        colors: {
            ...DarkTheme.colors,
            primary: colors.maron,
            background: '#121212',
            card: '#242424',
            text: colors.white,
            border: '#3A3A3A',
            notification: colors.moutarde,
        },
    },
};