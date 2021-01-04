import firebase from 'firebase/app';
import 'firebase/auth';

import firebaseConfig from '@/config/firebase';

const firebaseApp = !firebase.apps.length
  ? firebase.initializeApp(firebaseConfig)
  : firebase.app();

export default firebaseApp;
