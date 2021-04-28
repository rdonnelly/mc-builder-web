import '../styles/globals.css';

import Head from 'next/head';
import { useEffect, useState } from 'react';
import { createGlobalStyle } from 'styled-components';
import { ThemeProvider } from 'styled-components/native';
import useDarkMode from 'use-dark-mode';

import { darkTheme, lightTheme } from '@shared/styles';

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html,
  body {
    padding: 0;
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
      Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
  }

  html {
    height: 100%;
  }

  body {
    height: 100%;
    overflow: hidden;
  }

  #__next {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
`;

function MyApp({ Component, pageProps }) {
  const [isMounted, setIsMounted] = useState(false);
  const darkmode = useDarkMode(false);

  const theme = darkmode.value ? darkTheme : lightTheme;
  const hasWindow = typeof window !== 'undefined';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        <Head>
          <title>MC Builder</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <link
            rel="preload"
            href="/fonts/FontAwesome5_Pro_Regular.ttf"
            as="font"
            crossOrigin=""
          />
          <link
            rel="preload"
            href="/fonts/marvel-icons.ttf"
            as="font"
            crossOrigin=""
          />
        </Head>
        {(isMounted || !hasWindow) && <Component {...pageProps} />}
      </ThemeProvider>
    </>
  );
}

export default MyApp;
