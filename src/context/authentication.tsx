import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

import firebase from 'firebase/app';

import firebaseApp from '@/lib/firebase';

interface IUserCredentials {
  email: string;
  password: string;
}

type Provider = 'google';

interface IUser {
  data: firebase.User;
  additional: {
    company: string;
  };
}

interface IAuthenticationContext {
  user: firebase.User;
  createUser(credentials: IUserCredentials): Promise<firebase.User>;
  signIn(credentials: IUserCredentials): Promise<firebase.User>;
  signInWithPopup(provider: Provider): Promise<firebase.User>;
  signOut(): Promise<void>;
  sendForgotPasswordEmail(email: string): Promise<void>;
  sendPhoneVerificationId(phone: string): Promise<string>;
  signInWithPhoneNumber(
    verificationCode: string,
    verificationId: string,
  ): Promise<firebase.User>;
}

const AuthenticationContext = createContext<IAuthenticationContext | null>(
  null,
);

const AuthenticationProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<IUser>(null);

  useEffect(() => {
    firebaseApp.auth().onAuthStateChanged(async newUser => {
      if (!newUser) {
        setUser(null);

        return;
      }

      const reference = await firebaseApp
        .database()
        .ref(`users/${newUser.uid}`)
        .get();
      const data = reference.val();

      setUser({
        data: newUser,
        additional: data,
      });
    });

    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      'recaptcha-container',
      {
        size: 'invisible',
      },
    );
  }, []);

  const createUser = useCallback(
    async ({ email, password }: IUserCredentials): Promise<firebase.User> => {
      const response = await firebaseApp
        .auth()
        .createUserWithEmailAndPassword(email, password);

      await firebaseApp.database().ref(`users/${response.user.uid}`).set({
        company: 'test',
      });

      return response.user;
    },
    [],
  );

  const signIn = useCallback(
    async ({ email, password }: IUserCredentials): Promise<firebase.User> => {
      try {
        const response = await firebaseApp
          .auth()
          .signInWithEmailAndPassword(email, password);

        return response.user;
      } catch (err) {
        const methods = await firebase.auth().fetchSignInMethodsForEmail(email);

        let response: firebase.auth.UserCredential;

        if (methods.includes(firebase.auth.GoogleAuthProvider.PROVIDER_ID)) {
          const googleProvider = new firebase.auth.GoogleAuthProvider();

          googleProvider.setCustomParameters({ login_hint: email });

          response = await firebase.auth().signInWithPopup(googleProvider);
        }

        if (response) {
          return response.user;
        }

        throw err;
      }
    },
    [],
  );

  const signInWithPopup = useCallback(
    async (provider: Provider): Promise<firebase.User> => {
      switch (provider) {
        case 'google':
          const googleProvider = new firebase.auth.GoogleAuthProvider();

          const response = await firebaseApp
            .auth()
            .signInWithPopup(googleProvider);

          return response.user;
        default:
          throw new Error("Specify one of these providers: 'google'.");
      }
    },
    [],
  );

  const signOut = useCallback(async () => firebaseApp.auth().signOut(), []);

  const sendForgotPasswordEmail = useCallback(
    async (email: string) => firebaseApp.auth().sendPasswordResetEmail(email),
    [],
  );

  const sendPhoneVerificationId = useCallback(
    async (phone: string): Promise<string> => {
      const phoneProvider = new firebase.auth.PhoneAuthProvider();

      const verificationId = await phoneProvider.verifyPhoneNumber(
        phone,
        window.recaptchaVerifier,
      );

      return verificationId;
    },
    [],
  );

  const signInWithPhoneNumber = useCallback(
    async (verificationCode: string, verificationId: string) => {
      const phoneCredential = firebase.auth.PhoneAuthProvider.credential(
        verificationId,
        verificationCode,
      );

      const response = await firebase
        .auth()
        .signInWithCredential(phoneCredential);

      return response.user;
    },
    [],
  );

  return (
    <AuthenticationContext.Provider
      value={{
        user,
        createUser,
        signIn,
        signInWithPopup,
        signOut,
        sendForgotPasswordEmail,
        sendPhoneVerificationId,
        signInWithPhoneNumber,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};

function useAuthentication(): IAuthenticationContext {
  const context = useContext(AuthenticationContext);

  if (!context) {
    throw new Error(
      "'useAuthentication' must be used within a 'AuthenticationProvider'",
    );
  }

  return context;
}

export { AuthenticationProvider, useAuthentication };
