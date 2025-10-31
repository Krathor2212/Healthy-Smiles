import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import type { RootStackParamList } from '../../Navigation/types';

// --- Mock Data ---
const FAQ_DATA = [
  {
    id: '1',
    question: 'How do I book an appointment?',
    answer:
      'You can book an appointment by navigating to the "Find Doctors" page, selecting a doctor, and choosing an available time slot on their profile. Follow the prompts to confirm your booking.',
  },
  {
    id: '2',
    question: 'Can I cancel or reschedule my appointment?',
    answer:
      'Yes, you can manage your appointments from the "My Appointments" section in your profile. Select the appointment you wish to change and choose the "Cancel" or "Reschedule" option.',
  },
  {
    id: '3',
    question: 'How is my payment information stored?',
    answer:
      'We use a secure, PCI-compliant payment gateway to process all transactions. Your card details are encrypted and are not stored directly on our servers, ensuring your information is safe.',
  },
  {
    id: '4S',
    question: 'Is my personal health information secure?',
    answer:
      'Absolutely. We adhere to strict data privacy and security standards to protect your personal and health information. All data is encrypted both in transit and at rest.',
  },
  {
    id: '5',
    question: 'What if I miss my appointment?',
    answer:
      "If you miss a scheduled appointment, it may be marked as a 'no-show'. Please check the clinic's specific policy, as a fee may apply. We recommend rescheduling at least 24 hours in advance.",
  },
];

const MAIN_GREEN = '#34D399';
const TEXT_PRIMARY = '#1F2937';
const TEXT_SECONDARY = '#6B7280';
const BG_LIGHT_GRAY = '#F3F4F6';
const BORDER_COLOR = '#E5E7EB';

type NavigationProp = StackNavigationProp<RootStackParamList>;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    // no-op for now, placeholder if we want to fetch FAQs from an API later
  }, []);

  const handleToggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <View style={styles.safeArea}>
      <AppHeader title="FAQs" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageSubtitle}>Frequently Asked Questions</Text>
        {FAQ_DATA.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <View key={item.id} style={styles.faqCard}>
              <TouchableOpacity onPress={() => handleToggle(item.id)} style={styles.questionContainer} activeOpacity={0.7}>
                <Text style={styles.questionText}>{item.question}</Text>
                <Ionicons name="chevron-down" size={22} color={MAIN_GREEN} style={[{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }]} />
              </TouchableOpacity>
              {isExpanded && (
                <View style={styles.answerContainer}>
                  <Text style={styles.answerText}>{item.answer}</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG_LIGHT_GRAY },
  container: { padding: 16, paddingBottom: 40 },
  pageSubtitle: { fontSize: 18, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 12 },
  faqCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, overflow: 'hidden' },
  questionContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  questionText: { flex: 1, fontSize: 16, fontWeight: '600', color: TEXT_PRIMARY, marginRight: 12 },
  answerContainer: { marginTop: 10, borderTopWidth: 1, borderTopColor: BORDER_COLOR, paddingTop: 10 },
  answerText: { fontSize: 14, color: TEXT_SECONDARY, lineHeight: 20 },
});

export default FAQsScreen;
