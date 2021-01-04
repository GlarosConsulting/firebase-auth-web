import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from 'react';

import firebase from 'firebase/app';

import firebaseApp from '@/lib/firebase';

interface IUserCredentials {
  email: string;
  password: string;
}

type Provider = 'google';

interface IAuthenticationContext {
  user: firebase.User;
  createUser(credentials: IUserCredentials): Promise<firebase.User>;
  signIn(credentials: IUserCredentials): Promise<firebase.User>;
  signInWith(provider: Provider): Promise<firebase.User>;
  signOut(): void;
}

const AuthenticationContext = createContext<IAuthenticationContext | null>(
  null,
);

const AuthenticationProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<firebase.User>(null);

  useEffect(() => {
    firebaseApp.auth().onAuthStateChanged(setUser);
  }, []);

  const createUser = useCallback(
    async ({ email, password }: IUserCredentials): Promise<firebase.User> => {
      const response = await firebaseApp
        .auth()
        .createUserWithEmailAndPassword(email, password);

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

  const signInWith = useCallback(
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

  const signOut = useCallback(() => {
    firebaseApp.auth().signOut();
  }, []);
  return (
    <AuthenticationContext.Provider
      value={{ user, createUser, signIn, signInWith, signOut }}
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
