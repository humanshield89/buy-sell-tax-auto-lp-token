# buy-sell-tax-auto-lp-token
This is an ERC20 token with buy and sell fee and auto LP

## Install dependencies

```
yarn install
```

## Compile contracts

```
yarn compile
```

## Test contracts

```
yarn run test
```

## Test Coverage 

```
yarn coverage
```

## Current tests coverage
File                      |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
--------------------------|----------|----------|----------|----------|----------------|
 contracts\               |      100 |     90.7 |      100 |      100 |                |
  AccessControl.sol       |      100 |     87.5 |      100 |      100 |                |
  BlackListToken.sol      |      100 |      100 |      100 |      100 |                |
  MaxTransactionToken.sol |      100 |    91.67 |      100 |      100 |                |
  MaxWalletToken.sol      |      100 |      100 |      100 |      100 |                |
  Token.sol               |      100 |     88.1 |      100 |      100 |                |
  TradeManagedToken.sol   |      100 |    83.33 |      100 |      100 |                |
 contracts\data\          |      100 |      100 |      100 |      100 |                |
  constants.sol           |      100 |      100 |      100 |      100 |                |
 contracts\internface\    |      100 |      100 |      100 |      100 |                |
  IFactory.sol            |      100 |      100 |      100 |      100 |                |
  IRouter.sol             |      100 |      100 |      100 |      100 |                |
 contracts\tests\         |      100 |      100 |      100 |      100 |                |
  ERC20Test.sol           |      100 |      100 |      100 |      100 |                |
All files                 |      100 |     90.7 |      100 |      100 |                |

## Format code before commit

```
yarn format
```

## Deployment

To deploy please write your own deploy script, check `scripts/deploy.js` for an example on how to deploy to bsc test net



