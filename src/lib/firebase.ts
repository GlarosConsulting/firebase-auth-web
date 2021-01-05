import firebase from 'firebase/app';

import 'firebase/auth';
import 'firebase/database';

import firebaseConfig from '@/config/firebase';

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Window {
    recaptchaVerifier: any;
  }
}

const firebaseApp = !firebase.apps.length
  ? firebase.initializeApp(firebaseConfig)
  : firebase.app();

export default firebaseApp;
