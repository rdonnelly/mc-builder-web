import isDeepEqual from 'lodash/isEqual';
import keyBy from 'lodash/keyBy';
import memoizeOne from 'memoize-one';

import { compareCardFaction } from '../../data/cardUtils';
import {
  Card,
  getCard,
  getEligibleCards,
  getFilteredCards,
} from '../../data/models/Card';
import { getFactions } from '../../data/models/Faction';
import { getSets } from '../../data/models/Set';
import {
  FactionCode,
  FactionCodes,
  FilterCodes,
  SetCode,
  SetCodes,
  TypeCode,
  TypeCodes,
} from '../../data/types';
import { IStoreDeck, IStoreDeckCard } from '../../store/types';

interface IDeckCard {
  card: Card;
  code: string;
  name: string;
  factionCode: FactionCode;
  setCode: SetCode;
  typeCode: TypeCode;
  count: number;
}

interface IDeckCardSection {
  code: string;
  title: string;
  count: number;
  data: IDeckCard[];
}

interface IDeckCardSections {
  [code: string]: IDeckCardSection;
}

export class Deck {
  raw: IStoreDeck;
  rawCards: IStoreDeckCard[];

  constructor(deck: IStoreDeck, cards?: IStoreDeckCard[]) {
    this.raw = deck;
    this.rawCards = cards;
  }

  get code() {
    return this.raw.code;
  }

  get version() {
    return this.raw.version;
  }

  get name() {
    return this.raw.name;
  }

  get aspects() {
    return getFactions().filter((f) => this.raw.aspectCodes.includes(f.code));
  }

  get aspectCodes() {
    return this.raw.aspectCodes;
  }

  get aspectNames() {
    return this.aspects.map((a) => a.name);
  }

  get set() {
    return getSets().find((f) => f.code === this.raw.setCode);
  }

  get setCode() {
    return this.raw.setCode;
  }

  get setName() {
    return (this.set || {}).name;
  }

  get cardCount(): number {
    return this.cards.reduce((count, card) => {
      if (
        card.factionCode !== FactionCodes.ENCOUNTER &&
        card.setCode !== SetCodes.INVOCATION &&
        card.typeCode !== TypeCodes.ALTER_EGO &&
        card.typeCode !== TypeCodes.HERO
      ) {
        count += card.count;
      }
      return count;
    }, 0);
  }

  get cards(): IDeckCard[] {
    return getCardsForDeck(this.rawCards);
  }

  get extraCards(): IDeckCard[] {
    return getExtraCardsForDeck(this.setCode);
  }

  get cardsSectioned(): IDeckCardSection[] {
    const cards = [].concat(this.cards, this.extraCards);
    return createDeckCardSections(cards, {
      includeExtra: true,
      includeIdentity: true,
    });
  }

  get eligibleCards(): IDeckCard[] {
    const cards = this.cards;
    const cardsObj = keyBy(cards, (card) => card.code);

    return getEligibleCards(this.aspectCodes, this.setCode).map((card) => ({
      card,
      code: card.code,
      name: card.name,
      factionCode: card.factionCode,
      setCode: card.setCode,
      typeCode: card.typeCode,
      count: cardsObj[card.code] ? cardsObj[card.code].count : null,
    }));
  }

  get eligibleCardsSectioned(): IDeckCardSection[] {
    const cards = this.eligibleCards;
    return createDeckCardSections(cards, { includeEmpty: true });
  }

  get identityCards(): Card[] {
    return this.cards
      .filter(
        (card) =>
          card.typeCode === TypeCodes.ALTER_EGO ||
          card.typeCode === TypeCodes.HERO,
      )
      .map((card) => card.card);
  }

  get isLegal(): boolean {
    // TODO restricted list
    // TODO spider-woman equal double aspect
    return this.cardCount >= 40 && this.cardCount <= 50;
  }

  get prettyText(): string {
    const cardsSectioned = this.cardsSectioned;

    const heroCardsText = cardsSectioned
      .find((section) => section.code === 'hero')
      ?.data.map(
        (deckCard) =>
          `${deckCard.count}x ${deckCard.name} (${deckCard.card.packCode})`,
      )
      .join('\n');
    const aspectCardsText = cardsSectioned
      .find((section) => section.code === 'aspect')
      ?.data.map(
        (deckCard) =>
          `${deckCard.count}x ${deckCard.name} (${deckCard.card.packCode})`,
      )
      .join('\n');
    const basicCardsText = cardsSectioned
      .find((section) => section.code === 'basic')
      ?.data.map(
        (deckCard) =>
          `${deckCard.count}x ${deckCard.name} (${deckCard.card.packCode})`,
      )
      .join('\n');

    const text = `${this.name}
---
${this.set.name} – ${this.aspectNames.join(', ')} – ${this.cardCount} Cards

Hero Cards:
${heroCardsText || 'None'}

Aspect Cards:
${aspectCardsText || 'None'}

Basic Cards:
${basicCardsText || 'None'}
`;
    return text;
  }

  get shareableText(): string {
    const text = JSON.stringify({
      code: this.code,
      version: this.version,
      name: this.name,
      cards: {
        ...this.cards
          .filter(
            (card) =>
              card.typeCode === TypeCodes.HERO ||
              (card.factionCode !== FactionCodes.ENCOUNTER &&
                card.factionCode !== FactionCodes.HERO),
          )
          .reduce((map, c) => {
            map[c.code] = c.count;
            return map;
          }, {}),
      },
    });

    return text;
  }
}

export const getCardListForDeck = memoizeOne(
  (deck: Deck): Card[] => {
    return [].concat(deck.cards, deck.extraCards).map((card) => card.card);
  },
  (newArgs, lastArgs) => {
    return (
      newArgs[0].code === lastArgs[0].code &&
      isDeepEqual(newArgs[0].rawCards, lastArgs[0].rawCards)
    );
  },
);

export const getEligibleCardListForDeck = memoizeOne(
  (deck: Deck): Card[] => {
    return deck.eligibleCards.map((card) => card.card);
  },
  (newArgs, lastArgs) => {
    return (
      newArgs[0].code === lastArgs[0].code &&
      isDeepEqual(newArgs[0].rawCards, lastArgs[0].rawCards)
    );
  },
);

export const createDeckCardSections = (
  deckCards: IDeckCard[],
  options: {
    includeEmpty?: boolean;
    includeExtra?: boolean;
    includeIdentity?: boolean;
  },
): IDeckCardSection[] => {
  const sections: IDeckCardSections = {
    identity: {
      code: 'identity',
      title: 'Identity',
      count: null,
      data: [],
    },
    hero: { code: 'hero', title: 'Hero', count: null, data: [] },
    aspect: {
      code: 'aspect',
      title: 'Aspect',
      count: null,
      data: [],
    },
    basic: {
      code: 'basic',
      title: 'Basic',
      count: null,
      data: [],
    },
    invocation: {
      code: 'invocation',
      title: 'Invocation',
      count: null,
      data: [],
    },
    encounter: {
      code: 'encounter',
      title: 'Encounter',
      count: null,
      data: [],
    },
  };

  deckCards.forEach((card) => {
    switch (true) {
      case card.typeCode === TypeCodes.HERO ||
        card.typeCode === TypeCodes.ALTER_EGO: {
        if (options.includeIdentity) {
          sections.identity.data.push(card);
          sections.identity.count += card.count || 0;
        }
        break;
      }
      case card.factionCode === FactionCodes.HERO &&
        card.setCode === SetCodes.INVOCATION: {
        if (options.includeExtra) {
          sections.invocation.data.push(card);
          sections.invocation.count += card.count || 0;
        }
        break;
      }
      case card.factionCode === FactionCodes.ENCOUNTER: {
        if (options.includeExtra) {
          sections.encounter.data.push(card);
          sections.encounter.count += card.count || 0;
        }
        break;
      }
      case card.factionCode === FactionCodes.HERO: {
        sections.hero.data.push(card);
        sections.hero.count += card.count || 0;
        break;
      }
      case card.factionCode === FactionCodes.BASIC: {
        sections.basic.data.push(card);
        sections.basic.count += card.count || 0;
        break;
      }
      default: {
        sections.aspect.data.push(card);
        sections.aspect.count += card.count || 0;
        break;
      }
    }
  });

  if (options.includeEmpty) {
    return Object.values(sections).filter((section) => section.count != null);
  }

  return Object.values(sections).filter((section) => section.count > 0);
};

const getCardsForDeck = memoizeOne(
  (storeDeckCards: IStoreDeckCard[]): IDeckCard[] => {
    return storeDeckCards
      .reduce((acc, deckCard) => {
        const card = getCard(deckCard.cardCode);

        if (
          card.factionCode !== FactionCodes.ENCOUNTER &&
          card.setCode !== SetCodes.INVOCATION
        ) {
          acc.push({
            card,
            code: card.code,
            name: card.name,
            factionCode: card.factionCode,
            setCode: card.setCode,
            typeCode: card.typeCode,
            count: deckCard.quantity,
          });
        }

        return acc;
      }, [])
      .sort(compareCardFaction);
  },
);

const getExtraCardsForDeck = memoizeOne((setCode: SetCode): IDeckCard[] => {
  const extraCards = [];

  const encounterCards = getFilteredCards({
    filter: FilterCodes.SET,
    filterCode: [setCode, `${setCode}_nemesis` as SetCode],
  }).filter((card) => card.factionCode === FactionCodes.ENCOUNTER);
  extraCards.push(...encounterCards);

  if (setCode === SetCodes.DOCTOR_STRANGE) {
    const invocationCards = getFilteredCards({
      filter: FilterCodes.SET,
      filterCode: SetCodes.INVOCATION,
    });
    extraCards.push(...invocationCards);
  }

  return extraCards.map((card) => ({
    card,
    code: card.code,
    name: card.name,
    factionCode: card.factionCode,
    setCode: card.setCode,
    typeCode: card.typeCode,
    count: card.setQuantity || 1,
  }));
});
