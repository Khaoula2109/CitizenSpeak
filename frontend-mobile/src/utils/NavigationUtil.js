/**
 * Utilitaire pour simplifier la navigation dans l'application
 * Cet outil permet d'accéder à des écrans spécifiques indépendamment
 * de leur position dans l'arborescence des navigateurs
 */

// Référence vers l'objet de navigation qui sera défini lors de l'initialisation de l'app
let _navigator;

// Fonction pour définir la référence du navigateur principal
function setTopLevelNavigator(navigatorRef) {
    _navigator = navigatorRef;
}

// Navigation vers un écran dans l'un des navigateurs imbriqués
function navigate(routeName, params) {
    if (!_navigator) {
        console.warn('Navigation n\'est pas initialisée');
        return;
    }

    // Gestion spéciale pour l'écran ComplaintDetail
    if (routeName === 'ComplaintDetail') {
        // Utiliser le navigateur HomeStack pour accéder à ComplaintDetail
        _navigator.navigate('Home', {
            screen: 'ComplaintDetail',
            params: params
        });
        return;
    }

    // Navigation standard pour tous les autres écrans
    _navigator.navigate(routeName, params);
}

// Navigation avec un reset de la pile (utile après login/logout)
function reset(routeName, params) {
    _navigator.reset({
        index: 0,
        routes: [{ name: routeName, params }],
    });
}

// Retour à l'écran précédent
function goBack() {
    _navigator.goBack();
}

// Exporter les fonctions utilitaires
export default {
    setTopLevelNavigator,
    navigate,
    reset,
    goBack,
};