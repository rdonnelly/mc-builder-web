import { useWindowWidth } from '@react-hook/window-size/throttled';
import Head from 'next/head';

import CardDetail from '@shared/components/CardDetail';
import { Card, getCard, getCards } from '@shared/data/models/Card';

const CardPage = ({ rawCard }) => {
  const card = new Card(rawCard);
  const windowWidth = useWindowWidth();
  const width = Math.min(windowWidth, 768);

  return (
    <>
      <Head>
        <title>{`${card.name} | MC Builder`}</title>
      </Head>
      <CardDetail card={card} width={width} />
    </>
  );
};

// This function gets called at build time
export async function getStaticPaths() {
  // Call an external API endpoint to get posts
  const cards = getCards();

  // Get the paths we want to pre-render based on posts
  const paths = cards.map((card) => `/cards/${card.code}`);

  // We'll pre-render only these paths at build time.
  // { fallback: false } means other routes should 404.
  return { paths, fallback: false };
}

// This also gets called at build time
export async function getStaticProps({ params }) {
  // params contains the post `id`.
  // If the route is like /posts/1, then params.id is 1
  const code = params.code;
  const card = getCard(code);

  // Pass post data to the page via props
  return { props: { rawCard: card.raw } };
}

export default CardPage;
