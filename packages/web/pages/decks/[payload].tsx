import { Base64 } from 'js-base64';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

import DeckDetailHeader from '@shared/components/DeckDetail/DeckDetailHeader';
import DeckDetailList from '@shared/components/DeckDetail/DeckDetailList';
import { DeckModel } from '@shared/data';
import { IStoreDeck, IStoreDeckCard } from '@shared/store/types';
import {
  convertImportToStoreDeckComponents,
  IImportDeck,
  isDeckJson,
  parseDeckJson,
} from '@shared/utils/DeckParser';

import getAbsoluteUrl from '../../utils/getAbsoluteUrl';

const DeckPage = ({
  storeDeck,
  storeDeckCards,
}: {
  storeDeck: IStoreDeck;
  storeDeckCards: IStoreDeckCard[];
}) => {
  const router = useRouter();

  const deck = new DeckModel(storeDeck, storeDeckCards);
  const deckName = deck.name;

  const title =
    deck != null ? `${deckName} | Decks | MC Builder` : 'Decks | MC Builder';

  const handlePressItem = (cardCode: string) => {
    router.push(`/cards/${cardCode}`);
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta property="og:url" content={router.asPath} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={deck.name} />
        <meta property="og:description" content={deck.description} />
        <meta
          property="og:image"
          content={getAbsoluteUrl('/images/mc-icon-1024.png')}
        />
      </Head>
      <DeckDetailHeader deck={deck} />
      <DeckDetailList deck={deck} handlePressItem={handlePressItem} />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const payload = params.payload as string;

  let decoded: string = payload;
  let importDeck: IImportDeck | false = null;
  let storeDeck: IStoreDeck = null;
  let storeDeckCards: IStoreDeckCard[] = null;

  if (Base64.isValid(payload)) {
    decoded = Base64.decode(payload);
  }

  if (isDeckJson(decoded)) {
    importDeck = parseDeckJson(decoded);
  }

  if (importDeck) {
    const storeDeckComponents = convertImportToStoreDeckComponents(importDeck);
    storeDeck = storeDeckComponents.storeDeck;
    storeDeckCards = storeDeckComponents.storeDeckCards;
  }

  if (!storeDeck || !storeDeckCards) {
    return {
      notFound: true,
    };
  }

  return { props: { storeDeck, storeDeckCards } };
};

export default DeckPage;
