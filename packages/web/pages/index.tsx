import Head from 'next/head';
import styled from 'styled-components/native';

const IndexPage = () => {
  return (
    <>
      <Head>
        <title>MC Builder</title>
        <meta name="apple-itunes-app" content="app-id=1516561943" />
      </Head>

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

const Container = styled.View`
  align-items: center;
  flex: 1 1 auto;
  justify-content: center;
  width: 100%;
`;

export default IndexPage;
