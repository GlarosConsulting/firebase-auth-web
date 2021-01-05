import React, { useCallback, useEffect } from 'react';

import { Form } from '@unform/web';
import firebase from 'firebase/app';

import Input from '@/components/Input';
import SEO from '@/components/SEO';
import { useAuthentication } from '@/context/authentication';
import { Title } from '@/styles/pages/Home';

interface IUserCredentialsFormData {
  email: string;
  password: string;
}

interface IPhoneFormData {
  phone: string;
}
interface IForgotPasswordFormData {
  email: string;
}

const Home: React.FC = () => {
  const {
    user,
    createUser,
    signIn,
    signInWithPopup,
    signOut,
    sendForgotPasswordEmail,
    sendPhoneVerificationId,
    signInWithPhoneNumber,
  } = useAuthentication();

  const handleSignIn = useCallback(
    async ({ email, password }: IUserCredentialsFormData) => {
      try {
        await signIn({
          email,
          password,
        });
      } catch (err) {
        alert(err);
      }
    },
    [],
  );

  const handleCreateUser = useCallback(
    async ({ email, password }: IUserCredentialsFormData) => {
      try {
        await createUser({
          email,
          password,
        });
      } catch (err) {
        alert(err);
      }
    },
    [],
  );

  const handleSignInWithPhone = useCallback(
    async ({ phone }: IPhoneFormData) => {
      try {
        const verificationId = await sendPhoneVerificationId(phone);

        const verificationCode = window.prompt(
          'Please enter the verification ' +
            'code that was sent to your mobile device.',
        );

        await signInWithPhoneNumber(verificationCode, verificationId);
      } catch (err) {
        alert(err);
      }
    },
    [],
  );

  const handleSendForgotPasswordEmail = useCallback(
    async ({ email }: IForgotPasswordFormData) => {
      try {
        await sendForgotPasswordEmail(email);
      } catch (err) {
        alert(err);
      }
    },
    [],
  );

  return (
    <div>
      <SEO title="Firebase Web" image="boost.png" shouldExcludeTitleSuffix />

      <section>
        <Title>Firebase Web</Title>

        <p>{JSON.stringify(user)}</p>

        {user ? (
          <button onClick={() => signOut()}>Sign Out</button>
        ) : (
          <div>
            <button onClick={() => signInWithPopup('google')}>
              Sign In with Google
            </button>

            <Form onSubmit={handleSignIn}>
              <Input name="email" type="email" placeholder="E-mail" />
              <Input name="password" type="password" placeholder="Password" />

              <button type="submit">Sign In</button>
            </Form>

            <Form onSubmit={handleCreateUser}>
              <Input name="email" type="email" placeholder="E-mail" />
              <Input name="password" type="password" placeholder="Password" />

              <button type="submit">Create account</button>
            </Form>

            <Form onSubmit={handleSignInWithPhone}>
              <Input name="phone" type="phone" placeholder="Phone" />

              <button type="submit">Sign In with Phone</button>
            </Form>

            <Form onSubmit={handleSendForgotPasswordEmail}>
              <Input name="email" type="email" placeholder="E-mail" />

              <button type="submit">Send forgot password e-mail</button>
            </Form>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
