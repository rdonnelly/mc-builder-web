import Head from 'next/head';
import styled from 'styled-components/native';

import { base, colors } from '@shared/styles';

import Header from '../components/Header';

const IndexPage = () => {
  return (
    <>
      <Head>
        <title>MC Builder</title>
        <meta name="apple-itunes-app" content="app-id=1516561943" />
      </Head>
      <Header color={colors.lightGray} />
      <Container>
        <img
          src="/images/mc-icon-1024.png"
          alt="MC Builder"
          title="MC Builder"
          width="200"
        />
      </Container>
    </>
  );
};

const Container = styled(base.Container)`
  align-items: center;
  justify-content: center;
  width: 100%;
`;

export default IndexPage;
