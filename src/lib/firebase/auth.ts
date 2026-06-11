import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  sendPasswordResetEmail, 
  updateProfile, 
  applyActionCode, 
  checkActionCode, 
  confirmPasswordReset,
  ActionCodeSettings,
  User,
  UserCredential,
  signInAnonymously
} from 'firebase/auth';
import { auth } from '../../firebase';

// Custom ActionCodeSettings to show "Chidon IQ" app name instead of Firebase / Project ID.
const getVerifyEmailActionSettings = (): ActionCodeSettings => ({
  url: 'https://chidoniq.com/verify-email',
  handleCodeInApp: true,
  iOS: {
    bundleId: 'com.chidoniq.ios',
  },
  android: {
    packageName: 'com.chidoniq.android',
    installApp: true,
    minimumVersion: '12',
  },
});

const getResetPasswordActionSettings = (): ActionCodeSettings => ({
  url: 'https://chidoniq.com/reset-password',
  handleCodeInApp: true,
  iOS: {
    bundleId: 'com.chidoniq.ios',
  },
  android: {
    packageName: 'com.chidoniq.android',
    installApp: true,
    minimumVersion: '12',
  },
});

/**
 * a) Create user, send confirmation email, set displayName to "Chidon IQ User".
 */
export const signUpWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Set display name custom placeholder
  await updateProfile(userCredential.user, {
    displayName: 'Chidon IQ User',
  });

  // Send verification email
  await sendEmailVerification(userCredential.user, getVerifyEmailActionSettings());
  
  return userCredential;
};

/**
 * b) Sign in user, verify email state.
 */
export const loginWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
  if (!userCredential.user.emailVerified) {
    throw new Error('Please verify your email first');
  }
  
  return userCredential;
};

/**
 * c) Resend verification email to a user.
 */
export const sendVerificationEmail = async (user: User): Promise<void> => {
  await sendEmailVerification(user, getVerifyEmailActionSettings());
};

/**
 * d) Send password reset email to specified destination.
 */
export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email, getResetPasswordActionSettings());
};

/**
 * e) Handle email actions (e.g. verified links / action flows).
 */
export const handleEmailAction = async (mode: string, oobCode: string): Promise<any> => {
  switch (mode) {
    case 'verifyEmail':
      return await applyActionCode(auth, oobCode);
    case 'resetPassword':
      return await checkActionCode(auth, oobCode);
    case 'recoverEmail':
    default:
      throw new Error(`Unsupported mode: ${mode}`);
  }
};

/**
 * Helper to execute actual password update after reset checking
 */
export const executeConfirmPasswordReset = async (oobCode: string, newPassword: string): Promise<void> => {
  await confirmPasswordReset(auth, oobCode, newPassword);
};

/**
 * Sign in anonymously as guest creator
 */
export const signInAsAnonymous = async (): Promise<UserCredential> => {
  const userCredential = await signInAnonymously(auth);
  if (!userCredential.user.displayName) {
    await updateProfile(userCredential.user, {
      displayName: 'Guest Scribe',
    });
  }
  return userCredential;
};
