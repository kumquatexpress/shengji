'use strict';
var describe = require('tape').test,
  ShengJi = require('../lib/ShengJi')(),
  Utils = require('../lib/Utils');

var jokers = [{
  value: ShengJi.cardValue.REDJOKER
}, {
  value: ShengJi.cardValue.BLACKJOKER
}];

var nonPointCards = [{
  value: ShengJi.cardValue.TWO
}, {
  value: ShengJi.cardValue.THREE
}, {
  value: ShengJi.cardValue.FOUR
}, {
  value: ShengJi.cardValue.SIX
}, {
  value: ShengJi.cardValue.SEVEN
}, {
  value: ShengJi.cardValue.EIGHT
}, {
  value: ShengJi.cardValue.NINE
}, {
  value: ShengJi.cardValue.JACK
}, {
  value: ShengJi.cardValue.QUEEN
}, {
  value: ShengJi.cardValue.ACE
}];

var pointCards = [{
  value: ShengJi.cardValue.FIVE
}, {
  value: ShengJi.cardValue.TEN
}, {
  value: ShengJi.cardValue.KING
}];

describe('ShengJi', function(suite) {
  var it = suite.test;

  it('calculates cards that are points', function(t) {
    t.plan(3);

    t.equals(ShengJi.calcPointsForSingleCard({
      value: ShengJi.cardValue.FIVE
    }), 5, '5 is 5 points');

    t.equals(ShengJi.calcPointsForSingleCard({
      value: ShengJi.cardValue.TEN
    }), 10, '10 is 10 points');

    t.equals(ShengJi.calcPointsForSingleCard({
      value: ShengJi.cardValue.KING
    }), 10, 'K is 10 points');
  });

  it('calculates other cards to be worth no points', function(t) {
    t.plan(1);

    t.equals(ShengJi.calcPoints(nonPointCards), 0);
  });

  it('calculates max points for a specified # of decks', function(t) {
    t.plan(2);

    t.equals(ShengJi.maxPoints(1), 100);
    t.equals(ShengJi.maxPoints(2), 200);
  });

  it('calculates bottom points with multiplier', function(t) {
    t.plan(2);

    // Default multiplier
    t.equals(ShengJi.calcKittyPoints([{
      value: ShengJi.cardValue.FIVE
    }]), 10, 'a bottom pile of 5 points will be worth 10 by default');

    // Explicit multiplier
    var multiplier = 3;
    t.equals(ShengJi.calcKittyPoints([{
        value: ShengJi.cardValue.FIVE
      }], multiplier),
      15,
      'a bottom pile of 5 points will be worth 15 with a 3x multiplier');
  });

  it('calculates the # of decks based on the # of players', function(t) {
    t.equals(ShengJi.numDecks(4), 2, '2 decks for 4 players');
    t.equals(ShengJi.numDecks(5), 2, '2 decks for 5 players');
    t.equals(ShengJi.numDecks(6), 3, '3 decks for 6 players');
    t.equals(ShengJi.numDecks(7), 3, '3 decks for 7 players');
    t.equals(ShengJi.numDecks(8), 4, '4 decks for 8 players');
    t.equals(ShengJi.numDecks(9), 4, '4 decks for 9 players');

    t.end();
  });

  it('determines if a card is a point card', function(t) {
    pointCards.forEach(function(card) {
      t.true(ShengJi.isAPointCard(card), card.value + ' is a point card');
    });

    nonPointCards.forEach(function(card) {
      t.false(ShengJi.isAPointCard(card), card.value + ' is not a point card');
    });

    t.end();
  });

  it('determines the stronger play correctly', function(t) {
    var trumpLevel = 5;
    var trumpSuit = ShengJi.cardSuit.SPADES;
    var leadingSuit = ShengJi.cardSuit.DIAMONDS;

    var twoDiamonds = Utils.generateCard(ShengJi.cardValue.TWO, ShengJi.cardSuit.DIAMONDS),
      threeDiamonds = Utils.generateCard(ShengJi.cardValue.THREE, ShengJi.cardSuit.DIAMONDS),
      fourDiamonds = Utils.generateCard(ShengJi.cardValue.FOUR, ShengJi.cardSuit.DIAMONDS),
      twoClubs = Utils.generateCard(ShengJi.cardValue.TWO, ShengJi.cardSuit.CLUBS),
      threeClubs = Utils.generateCard(ShengJi.cardValue.TWO, ShengJi.cardSuit.CLUBS),
      twoTrump = Utils.generateCard(ShengJi.cardValue.TWO, ShengJi.cardSuit.SPADES),
      threeTrump = Utils.generateCard(ShengJi.cardValue.THREE, ShengJi.cardSuit.SPADES),
      currentLevel = Utils.generateCard(trumpLevel, ShengJi.cardSuit.DIAMONDS),
      currentLevelAndSuit = Utils.generateCard(trumpLevel, trumpSuit),
      redJoker = Utils.generateCard(ShengJi.cardValue.REDJOKER, ShengJi.cardSuit.JOKER),
      blackJoker = Utils.generateCard(ShengJi.cardValue.BLACKJOKER, ShengJi.cardSuit.JOKER);

    t.test('for single cards', function(t) {
      t.false(ShengJi.isStronger(threeDiamonds, threeDiamonds, trumpLevel, trumpSuit, leadingSuit),
        '2nd play of the same card cannot be stronger');

      t.false(ShengJi.isStronger(threeDiamonds, twoDiamonds, trumpLevel, trumpSuit, leadingSuit),
        '2 of diamonds < 3 of diamonds');

      t.true(ShengJi.isStronger(threeDiamonds, fourDiamonds, trumpLevel, trumpSuit, leadingSuit),
        '4 of diamonds > 3 of diamonds');

      t.false(ShengJi.isStronger(threeDiamonds, twoClubs, trumpLevel, trumpSuit, leadingSuit),
        '2 of clubs (not trump) < than 3 of diamonds');

      t.false(ShengJi.isStronger(threeDiamonds, threeClubs, trumpLevel, trumpSuit, leadingSuit),
        '3 of clubs (not trump) < 3 of diamonds');

      t.true(ShengJi.isStronger(threeDiamonds, twoTrump, trumpLevel, trumpSuit, leadingSuit),
        '2 of spades (trump) > 3 of diamonds');

      t.true(ShengJi.isStronger(threeDiamonds, threeTrump, trumpLevel, trumpSuit, leadingSuit),
        '3 of spades (trump) > 3 of diamonds');

      t.false(ShengJi.isStronger(threeTrump, threeDiamonds, trumpLevel, trumpSuit, leadingSuit),
        '3 of diamonds < 3 of spades (trump)');

      t.true(ShengJi.isStronger(threeTrump, currentLevel, trumpLevel, trumpSuit, leadingSuit),
        'Current level > 3 of spades (trump)');

      t.true(ShengJi.isStronger(currentLevel, currentLevelAndSuit, trumpLevel, trumpSuit, leadingSuit),
        'Current level and suit > just current level');

      t.true(ShengJi.isStronger(currentLevelAndSuit, blackJoker, trumpLevel, trumpSuit, leadingSuit),
        'Black joker > current level and suit');

      t.true(ShengJi.isStronger(blackJoker, redJoker, trumpLevel, trumpSuit, leadingSuit),
        'Red joker > black joker');

      t.end();
    });

    t.test('for pairs of cards', function(t) {
      t.false(ShengJi.isStronger(threeDiamonds.concat(threeDiamonds), threeDiamonds.concat(threeDiamonds),
        trumpLevel, trumpSuit, leadingSuit), '2nd play of the same pair cannot be stronger');

      t.false(ShengJi.isStronger(threeDiamonds.concat(threeDiamonds), twoDiamonds.concat(twoDiamonds),
        trumpLevel, trumpSuit, leadingSuit), '2x three of diamonds > 2x two of diamonds');

      t.false(ShengJi.isStronger(threeDiamonds.concat(threeDiamonds), threeClubs.concat(threeClubs),
        trumpLevel, trumpSuit, leadingSuit), '2x three of diamonds > 2x three of clubs when played first');

      t.false(ShengJi.isStronger(threeDiamonds.concat(threeDiamonds), blackJoker.concat(threeDiamonds),
        trumpLevel, trumpSuit, leadingSuit), '2x three of diamonds > nonmatching trump+diamonds');

      t.false(ShengJi.isStronger(threeDiamonds.concat(threeDiamonds), threeDiamonds.concat(threeTrump),
        trumpLevel, trumpSuit, leadingSuit), '2x three of diamonds > trump three + three of diamonds');

      t.true(ShengJi.isStronger(threeDiamonds.concat(threeDiamonds), fourDiamonds.concat(fourDiamonds),
        trumpLevel, trumpSuit, leadingSuit), '2x three of diamonds < 2x four of diamonds');

      t.true(ShengJi.isStronger(threeDiamonds.concat(threeDiamonds), threeTrump.concat(threeTrump),
        trumpLevel, trumpSuit, leadingSuit), '2x three of diamonds < 2x three of trump');

      t.true(ShengJi.isStronger(fourDiamonds.concat(fourDiamonds), twoTrump.concat(twoTrump),
        trumpLevel, trumpSuit, leadingSuit), '2x four of diamonds < 2x two of trump suit');

      t.true(ShengJi.isStronger(currentLevel.concat(currentLevel), blackJoker.concat(blackJoker),
        trumpLevel, trumpSuit, leadingSuit), '2x current level < 2x black joker (trump)');

      t.true(ShengJi.isStronger(twoTrump.concat(twoTrump), currentLevel.concat(currentLevel),
        trumpLevel, trumpSuit, leadingSuit), ' 2x two of trump suit < 2x currentLevel');

      t.false(ShengJi.isStronger(currentLevel.concat(currentLevel), currentLevelAndSuit.concat(currentLevel),
        trumpLevel, trumpSuit, leadingSuit),
        '2x current level of non trump > 2x non-matching suit of current level + current level trump');

      t.false(ShengJi.isStronger(currentLevel.concat(currentLevel), blackJoker.concat(redJoker),
        trumpLevel, trumpSuit, leadingSuit),
        '2x current level of non trump > blackjoker + redjoker');

      t.end();
    });

    t.end();
  });

  it('determines if a card is a trump card', function(t) {
    jokers.forEach(function(card) {
      t.true(ShengJi.isTrump(card, 2, ShengJi.cardSuit.DIAMONDS), card.value + ' is a trump card');
    });

    t.true(ShengJi.isTrump({ value: ShengJi.cardValue.TWO }, 2, ShengJi.cardSuit.DIAMONDS),
      'current level is a trump');

    t.end();
  });

});
