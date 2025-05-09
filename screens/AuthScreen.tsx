import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { AuthScreenProps } from '../types';

const AuthScreen: React.FC<AuthScreenProps> = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signup, login, logout, verifyEmail } = useAuth();

  const handleAuth = async () => {
    try {
      setLoading(true);
      if (isLogin) {
        await login(email, password);
      } else {
        if (!showVerification) {
          await signup(email, password, username, userId);
          Alert.alert(
            'Verification Email Sent',
            'Please check your email for the verification link and enter the code below.',
            [{ text: 'OK' }]
          );
          setShowVerification(true);
          return;
        }

        const verified = await verifyEmail(verificationCode);
        if (verified) {
          Alert.alert('Success', 'Email verified successfully! You can now login.');
          setIsLogin(true);
          setShowVerification(false);
        } else {
          Alert.alert('Error', 'Invalid verification code. Please try again.');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleExit = async () => {
    try {
      setLoading(true);
      await logout();
      // Exit app logic here
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <Text style={styles.title}>{isLogin ? 'Login' : 'Sign Up'}</Text>

          {!isLogin && !showVerification && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                placeholderTextColor="#fff"
              />
              <TextInput
                style={styles.input}
                placeholder="User ID"
                value={userId}
                onChangeText={setUserId}
                placeholderTextColor="#fff"
              />
            </>
          )}

          {!showVerification && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#fff"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#fff"
              />
            </>
          )}

          {showVerification && (
            <TextInput
              style={styles.input}
              placeholder="Verification Code"
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="number-pad"
              placeholderTextColor="#fff"
            />
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#3b5998" />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? 'Login' : showVerification ? 'Verify' : 'Sign Up'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => {
              setIsLogin(!isLogin);
              setShowVerification(false);
            }}
            disabled={loading}
          >
            <Text style={styles.switchText}>
              {isLogin ? 'Need an account? Sign Up' : 'Have an account? Login'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.exitButton, loading && styles.buttonDisabled]}
            onPress={handleExit}
            disabled={loading}
          >
            <Text style={styles.exitButtonText}>Exit</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    color: '#fff',
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#3b5998',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  switchText: {
    color: '#fff',
    fontSize: 14,
  },
  exitButton: {
    marginTop: 20,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 8,
  },
  exitButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default AuthScreen;
