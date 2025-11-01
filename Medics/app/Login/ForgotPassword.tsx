import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../Navigation/types';

// --- Constants ---
const MAIN_GREEN = '#34D399';
const TEXT_PRIMARY = '#1F2937';
const TEXT_SECONDARY = '#6B7280';
const BG_LIGHT_GRAY = '#F3F4F6';
const BORDER_COLOR = '#E5E7EB';
const WHITE = '#FFFFFF';
const SUCCESS_GREEN = '#10B981';

type Step = 1 | 2 | 3 | 4; // 1: Email, 2: Verify, 3: Reset, 4: Success

type NavigationProp = StackNavigationProp<RootStackParamList>;

// --- Main Component ---

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Refs for code input
  const codeTextInputRef = useRef<TextInput>(null);

  const handleBackPress = () => {
    if (step > 1 && step < 4) {
      setStep((step - 1) as Step);
    } else {
      navigation.goBack();
    }
  };

  // --- Step Handlers ---

  const handleSendResetEmail = () => {
    // TODO: Add email validation and API call
    console.log('Resetting password for:', email);
    setStep(2); // Move to verification step
    setTimeout(() => codeTextInputRef.current?.focus(), 100); // Focus code input
  };

  const handleVerifyCode = () => {
    // TODO: Add code verification API call
    console.log('Verifying code:', code);
    setStep(3); // Move to create new password step
  };

  const handleCreateNewPassword = () => {
    // TODO: Add password validation (match, strength) and API call
    console.log('Setting new password');
    setStep(4); // Move to success modal
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  // --- Render Functions for Each Step ---

  const renderEmailStep = () => (
    <>
      <Text style={styles.title}>Forgot Your Password?</Text>
      <Text style={styles.subtitle}>
        Enter your email, we will send you a confirmation code
      </Text>

      <View style={styles.inputContainer}>
        <Feather name="mail" size={20} color={TEXT_SECONDARY} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor={TEXT_SECONDARY}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleSendResetEmail}
      >
        <Text style={styles.buttonText}>Reset Password</Text>
      </TouchableOpacity>
    </>
  );

  const renderVerificationStep = () => (
    <>
      <Text style={styles.title}>Enter Verification Code</Text>
      <Text style={styles.subtitle}>
        Enter code that we have sent to your email {'\n'}
        <Text style={styles.emailText}>{email}</Text>
      </Text>

      {/* Hidden Text Input to capture code */}
      <TextInput
        ref={codeTextInputRef}
        style={styles.hiddenCodeInput}
        keyboardType="number-pad"
        maxLength={4}
        value={code}
        onChangeText={setCode}
        caretHidden
      />

      {/* Visible Code Boxes */}
      <View style={styles.codeContainer}>
        {[0, 1, 2, 3].map((index) => (
          <TouchableOpacity
            key={index}
            style={styles.codeBox}
            onPress={() => codeTextInputRef.current?.focus()}
          >
            <Text style={styles.codeText}>
              {code[index] ? '•' : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleVerifyCode}
        disabled={code.length !== 4}
      >
        <Text style={styles.buttonText}>Verify</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.resendContainer}>
        <Text style={styles.resendText}>Didn't receive the code? </Text>
        <Text style={[styles.resendText, styles.resendLink]}>Resend</Text>
      </TouchableOpacity>
    </>
  );

  const renderResetStep = () => (
    <>
      <Text style={styles.title}>Create New Password</Text>
      <Text style={styles.subtitle}>
        Create your new password to login
      </Text>

      <View style={styles.inputContainer}>
        <Feather name="lock" size={20} color={TEXT_SECONDARY} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Enter new password"
          placeholderTextColor={TEXT_SECONDARY}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={TEXT_SECONDARY} />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Feather name="lock" size={20} color={TEXT_SECONDARY} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Confirm new password"
          placeholderTextColor={TEXT_SECONDARY}
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <Feather name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color={TEXT_SECONDARY} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleCreateNewPassword}
      >
        <Text style={styles.buttonText}>Create Password</Text>
      </TouchableOpacity>
    </>
  );

  const renderSuccessModal = () => (
    <Modal
      visible={step === 4}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setStep(1)} // Close modal on back button (Android)
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <View style={styles.successIconContainer}>
            <Feather name="check" size={40} color={WHITE} />
          </View>
          <Text style={styles.modalTitle}>Success</Text>
          <Text style={styles.modalSubtitle}>
            You have successfully reset your password.
          </Text>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={handleLogin}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={TEXT_PRIMARY} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {step === 1 && renderEmailStep()}
          {step === 2 && renderVerificationStep()}
          {step === 3 && renderResetStep()}
        </View>
      </KeyboardAvoidingView>
      {renderSuccessModal()}
    </View>
  );
};

// --- Styles ---

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: WHITE,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    lineHeight: 24,
    marginBottom: 30,
  },
  emailText: {
    color: TEXT_PRIMARY,
    fontWeight: '500',
  },
  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BG_LIGHT_GRAY,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    height: 56,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: TEXT_PRIMARY,
  },
  // Button
  button: {
    backgroundColor: MAIN_GREEN,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Code Verification
  hiddenCodeInput: {
    width: 0,
    height: 0,
    position: 'absolute',
    opacity: 0,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  codeBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: BG_LIGHT_GRAY,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
  },
  // Resend
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  resendText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
  resendLink: {
    color: MAIN_GREEN,
    fontWeight: 'bold',
  },
  // Success Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: SUCCESS_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginBottom: 12,
  },
  modalSubtitle: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  modalButton: {
    backgroundColor: MAIN_GREEN,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});

export default ForgotPasswordScreen;
