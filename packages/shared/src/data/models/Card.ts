import isDeepEqual from 'lodash/isEqual';
import memoizeOne from 'memoize-one';

import {
  compareCardCode,
  compareCardCost,
  compareCardFaction,
  compareCardName,
  compareCardType,
} from '../../data/cardUtils';
import { getFactions } from '../../data/models/Faction';
import { getPacks } from '../../data/models/Pack';
import { getSets } from '../../data/models/Set';
import { getTypes } from '../../data/models/Type';
import {
  CardSortTypes,
  FactionCode,
  FactionCodes,
  FilterCode,
  FilterCodes,
  ICardRaw,
  PackCode,
  SetCode,
  TypeCode,
  TypeCodes,
} from '../../data/types';

const cards: ICardRaw[] = [].concat(
  require('marvelsdb-json-data/pack/ant_encounter.json'),
  require('marvelsdb-json-data/pack/ant.json'),
  require('marvelsdb-json-data/pack/bkw_encounter.json'),
  require('marvelsdb-json-data/pack/bkw.json'),
  require('marvelsdb-json-data/pack/cap_encounter.json'),
  require('marvelsdb-json-data/pack/cap.json'),
  require('marvelsdb-json-data/pack/core_encounter.json'),
  require('marvelsdb-json-data/pack/core.json'),
  require('marvelsdb-json-data/pack/drs_encounter.json'),
  require('marvelsdb-json-data/pack/drs.json'),
  require('marvelsdb-json-data/pack/gob_encounter.json'),
  require('marvelsdb-json-data/pack/hlk_encounter.json'),
  require('marvelsdb-json-data/pack/hlk.json'),
  require('marvelsdb-json-data/pack/msm_encounter.json'),
  require('marvelsdb-json-data/pack/msm.json'),
  require('marvelsdb-json-data/pack/qsv_encounter.json'),
  require('marvelsdb-json-data/pack/qsv.json'),
  require('marvelsdb-json-data/pack/ron_encounter.json'),
  require('marvelsdb-json-data/pack/scw_encounter.json'),
  require('marvelsdb-json-data/pack/scw.json'),
  require('marvelsdb-json-data/pack/thor_encounter.json'),
  require('marvelsdb-json-data/pack/thor.json'),
  require('marvelsdb-json-data/pack/toafk_encounter.json'),
  require('marvelsdb-json-data/pack/trors_encounter.json'),
  require('marvelsdb-json-data/pack/trors.json'),
  require('marvelsdb-json-data/pack/twc_encounter.json'),
  require('marvelsdb-json-data/pack/wsp_encounter.json'),
  require('marvelsdb-json-data/pack/wsp.json'),
);

export class Card {
  raw: ICardRaw;

  constructor(card: ICardRaw) {
    this.raw = card;
  }

  get code() {
    return this.raw.code;
  }

  get cardCode() {
    return this.raw.code.slice(2).replace(/^0+/, '').toUpperCase();
  }

  get name() {
    return this.raw.name;
  }

  get faction() {
    return getFactions().find((f) => f.code === this.raw.faction_code);
  }

  get factionCode() {
    return (this.faction || {}).code as FactionCode;
  }

  get factionName() {
    return (this.faction || {}).name;
  }

  get pack() {
    return getPacks().find((p) => p.code === this.raw.pack_code);
  }

  get packCode() {
    return (this.pack || {}).code;
  }

  get packName() {
    return (this.pack || {}).name;
  }

  get set() {
    return getSets().find((s) => s.code === this.raw.set_code);
  }

  get setCode() {
    return (this.set || {}).code;
  }

  get setName() {
    return (this.set || {}).name;
  }

  get setQuantity() {
    return this.raw.quantity;
  }

  get type() {
    return getTypes().find((t) => t.code === this.raw.type_code);
  }

  get typeCode() {
    return (this.type || {}).code;
  }

  get typeName() {
    return (this.type || {}).name;
  }

  get cost() {
    return this.raw.cost;
  }

  get flavor() {
    return this.raw.flavor;
  }

  get text() {
    return this.raw.text;
  }

  get backFlavor() {
    return this.raw.back_flavor;
  }

  get backText() {
    return this.raw.back_text;
  }

  get attackText() {
    return this.raw.attack_text;
  }

  get schemeText() {
    return this.raw.scheme_text;
  }

  get boostText() {
    if (this.raw.boost_text == null) {
      return null;
    }
    return `[special] <b>Boost</b>: ${this.raw.boost_text}`;
  }

  get isHealthPerHero() {
    return !!this.raw.health_per_hero;
  }

  get resources() {
    if (
      !this.raw.resource_energy &&
      !this.raw.resource_mental &&
      !this.raw.resource_physical &&
      !this.raw.resource_wild
    ) {
      return null;
    }

    return {
      energy: this.raw.resource_energy,
      mental: this.raw.resource_mental,
      physical: this.raw.resource_physical,
      wild: this.raw.resource_wild,
    };
  }

  get isUnique() {
    return this.raw.is_unique || false;
  }

  get packPosition() {
    return this.raw.position;
  }

  get setPosition() {
    return this.raw.set_position;
  }

  get deckLimit() {
    return this.raw.deck_limit || 0;
  }

  get imageSrc() {
    const cgdbId = this.pack.cgdbId;

    if (cgdbId == null) {
      return null;
    }

    const packCode = String(this.pack.cgdbId).padStart(2, '0');
    return `https://lcgcdn.s3.amazonaws.com/mc/MC${packCode}en_${this.cardCode}.jpg`;
  }

  get imageUriSet() {
    const cgdbId = this.pack.cgdbId;

    if (cgdbId == null) {
      return [];
    }

    const packCode = String(this.pack.cgdbId).padStart(2, '0');
    const isDoubleSided = ['main_scheme'].includes(this.typeCode);

    if (isDoubleSided) {
      return [
        `https://lcgcdn.s3.amazonaws.com/mc/MC${packCode}en_${this.cardCode}A.jpg`,
        `https://lcgcdn.s3.amazonaws.com/mc/MC${packCode}en_${this.cardCode}B.jpg`,
      ];
    }

    return [
      `https://lcgcdn.s3.amazonaws.com/mc/MC${packCode}en_${this.cardCode}.jpg`,
    ];
  }
}

export const getCards = memoizeOne(() =>
  cards.map((raw) => new Card(raw)).sort(compareCardCode),
);

export const getCardsMap = memoizeOne(() =>
  getCards().reduce((map, card) => {
    map[card.code] = card;
    return map;
  }, {}),
);

export const getFilteredCards = memoizeOne(
  ({
    searchString,
    filter,
    filterCode,
    cardCodes,
    sortType,
  }: {
    searchString?: string;
    filter?: FilterCode;
    filterCode?:
      | FactionCode
      | FactionCode[]
      | PackCode
      | PackCode[]
      | SetCode
      | SetCode[]
      | TypeCode
      | TypeCode[];
    cardCodes?: string[];
    sortType?: CardSortTypes;
  }) => {
    let filteredCards = getCards();

    const formattedSearchTerm =
      searchString != null
        ? searchString.toLowerCase().replace(/[^A-Za-z0-9]/g, '')
        : null;

    filteredCards = filteredCards.filter((card) => {
      if (cardCodes && cardCodes.length && !cardCodes.includes(card.code)) {
        return false;
      }

      if (formattedSearchTerm) {
        const cardName = card.name.toLowerCase().replace(/[^A-Za-z0-9]/g, '');
        return cardName.includes(formattedSearchTerm);
      }

      return true;
    });

    switch (filter) {
      case FilterCodes.FACTION: {
        filteredCards = filteredCards.filter((card) =>
          Array.isArray(filterCode)
            ? (filterCode as FactionCode[]).includes(card.factionCode)
            : card.factionCode === filterCode,
        );
        break;
      }
      case FilterCodes.PACK: {
        filteredCards = filteredCards.filter((card) =>
          Array.isArray(filterCode)
            ? (filterCode as PackCode[]).includes(card.packCode)
            : card.packCode === filterCode,
        );
        break;
      }
      case FilterCodes.SET: {
        filteredCards = filteredCards.filter((card) =>
          Array.isArray(filterCode)
            ? (filterCode as SetCode[]).includes(card.setCode)
            : card.setCode === filterCode,
        );
        break;
      }
      case FilterCodes.TYPE: {
        filteredCards = filteredCards.filter((card) =>
          Array.isArray(filterCode)
            ? (filterCode as TypeCode[]).includes(card.typeCode)
            : card.typeCode === filterCode,
        );
        break;
      }
    }

    let comparator = compareCardCode;
    if (sortType === CardSortTypes.CODE) {
      comparator = compareCardCode;
    } else if (sortType === CardSortTypes.COST) {
      comparator = compareCardCost;
    } else if (sortType === CardSortTypes.FACTION) {
      comparator = compareCardFaction;
    } else if (sortType === CardSortTypes.NAME) {
      comparator = compareCardName;
    } else if (sortType === CardSortTypes.TYPE) {
      comparator = compareCardType;
    } else if (filter) {
      if (filter === FilterCodes.FACTION) {
        comparator = compareCardType;
      } else if (filter === FilterCodes.PACK) {
        comparator = compareCardCode;
      } else if (filter === FilterCodes.SET) {
        comparator = compareCardCode;
      } else if (filter === FilterCodes.TYPE) {
        comparator = compareCardFaction;
      }
    }

    filteredCards = filteredCards.sort(comparator);

    return filteredCards;
  },
  isDeepEqual,
);

export const getEligibleCards = memoizeOne(
  (factionCodes: FactionCode[], setCode: SetCode) =>
    getCards()
      .filter((card) => {
        // exclude cards that are not an Ally, Event, Resource, Support, or Upgrade
        if (
          ![
            TypeCodes.ALLY,
            TypeCodes.EVENT,
            TypeCodes.RESOURCE,
            TypeCodes.SUPPORT,
            TypeCodes.UPGRADE,
          ].includes(card.typeCode as TypeCodes)
        ) {
          return false;
        }

        const isInFaction = [...factionCodes, FactionCodes.BASIC].includes(
          card.factionCode,
        );

        // exclude cards that are not in faction, do not belong to hero
        if (
          (!isInFaction || card.setCode != null) &&
          card.setCode !== setCode
        ) {
          return false;
        }

        return true;
      })
      .sort(compareCardFaction),
  isDeepEqual,
);

export const getCard = (code: string) => getCardsMap()[code];
