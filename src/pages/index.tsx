import React, { useCallback } from 'react';

import { Form } from '@unform/web';

import Input from '@/components/Input';
import SEO from '@/components/SEO';
import { useAuthentication } from '@/context/authentication';
import firebaseApp from '@/lib/firebase';
import { Title } from '@/styles/pages/Home';

interface IFormData {
  email: string;
  password: string;
}

const Home: React.FC = () => {
  const { user, createUser, signIn, signInWith, signOut } = useAuthentication();

  const handleSubmit = useCallback(async ({ email, password }: IFormData) => {
    try {
      await signIn({
        email,
        password,
      });
    } catch (err) {
      alert(err);
    }
  }, []);

  const handleCreateUser = useCallback(
    async ({ email, password }: IFormData) => {
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
            <button onClick={() => signInWith('google')}>
              Sign In with Google
            </button>

            <Form onSubmit={handleSubmit}>
              <Input name="email" type="email" placeholder="E-mail" />
              <Input name="password" type="password" placeholder="Password" />

              <button type="submit">Sign In</button>
            </Form>

            <Form onSubmit={handleCreateUser}>
              <Input name="email" type="email" placeholder="E-mail" />
              <Input name="password" type="password" placeholder="Password" />

              <button type="submit">Create account</button>
            </Form>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
