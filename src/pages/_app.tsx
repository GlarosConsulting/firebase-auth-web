import { AppProps } from 'next/app';
import React from 'react';

import AppProvider from '@/context';

import GlobalStyle from '../styles/GlobalStyle';

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => (
  <AppProvider>
    <GlobalStyle />
    <Component {...pageProps} />
  </AppProvider>
);

export default MyApp;
