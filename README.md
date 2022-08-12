# ️Timevault [tlock](./src/images/tlock-icon.svg)

A deadman's switch to encrypt your vulnerability reports or other compromising data to be decryptable at a set time in the future.  Uses [tlock-js](https://github.com/drand/tlock-js) and is powered by [drand](https://drand.love).
Messages encrypted with timevault are also compatible with the [go tlock library](https://github.com/drand/tlock).

Automagically deploys to https://timevault.drand.love

## Prerequisites
- node 16+
- npm 8+

## Quickstart
- run `npm install` to install all the dependencies
- run `npm start` to run an HTTP server locally serving the UI for encrypting/decrypting your important material
