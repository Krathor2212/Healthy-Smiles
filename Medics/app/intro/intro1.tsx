import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function Index() {
    return (
        <View style={styles.container}>
            {/* Skip Button */}
            <View style={styles.skipButtonContainer}>
                <TouchableOpacity>
                    <Text style={styles.skipButtonText}>Skip</Text>
                </TouchableOpacity>
            </View>

            {/* Main Content */}
            <View style={styles.mainContent}>
                {/* Doctor Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{
                            uri: 'https://api.builder.io/api/v1/image/assets/TEMP/1b1f61f53da2606f25207f7fd9def477c0a66e27?width=642',
                        }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                </View>

                {/* Headline */}
                <View style={styles.headlineContainer}>
                    <Text style={styles.headline}>
                        Consult only with a doctor you trust
                    </Text>
                </View>

                {/* Progress Dots and Next Button */}
                <View style={styles.progressContainer}>
                    {/* Progress Dots */}
                    <View style={styles.dotsContainer}>
                        <View style={[styles.dot, styles.activeDot]} />
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                    </View>

                    {/* Next Button */}
                    <TouchableOpacity style={styles.nextButton}>
                        <View style={styles.nextButtonIcon}>
                            <Text style={styles.nextButtonText}>→</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Home Indicator */}
            <View style={styles.homeIndicatorContainer}>
                <View style={styles.homeIndicator} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB', // Replace with your app background color
        alignItems: 'center',
        justifyContent: 'center',
    },
    skipButtonContainer: {
        position: 'absolute',
        top: 40,
        right: 24,
    },
    skipButtonText: {
        color: '#9CA3AF', // Muted text color
        fontSize: 14,
        fontWeight: '400',
    },
    mainContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    imageContainer: {
        width: 320,
        height: 384,
        marginBottom: 32,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    headlineContainer: {
        marginBottom: 48,
        paddingHorizontal: 16,
    },
    headline: {
        textAlign: 'center',
        color: '#111827', // Dark text color
        fontSize: 24,
        fontWeight: '700',
        lineHeight: 32,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 200,
        paddingHorizontal: 8,
    },
    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 12,
        height: 4,
        backgroundColor: '#D1D5DB', // Inactive dot color
        borderRadius: 2,
        marginHorizontal: 2,
    },
    activeDot: {
        backgroundColor: '#14B8A6', // Active dot color
    },
    nextButton: {
        width: 56,
        height: 56,
        backgroundColor: '#14B8A6', // Teal color
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
    },
    nextButtonIcon: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '700',
    },
    homeIndicatorContainer: {
        justifyContent: 'center',
        paddingBottom: 16,
    },
    homeIndicator: {
        width: 128,
        height: 4,
        backgroundColor: '#6B7280', // Dark muted color
        borderRadius: 2,
    },
});