# Timevault 

A deadman's switch to encrypt your vulnerability reports or other compromising data to be decryptable at a set time in the future.  Uses [tlock-js](https://github.com/drand/tlock-js) and is powered by [drand](https://drand.love).
Messages encrypted with timevault are also compatible with the [go tlock library](https://github.com/drand/tlock).

Automagically deploys to https://timevault.drand.love

## Prerequisites
- node 16+
- npm 8+

## Quickstart
- run `npm install` to install all the dependencies
- run `npm start` to run an HTTP server locally serving the UI for encrypting/decrypting your important material

## Network

This is currently running against the drand mainnet. 
Ciphertexts from prior to 21st of March 2023 were using testnet, and as such you may need to replace instances of `mainnetClient()` with `testnetClient()` in the code for it to decrypt them.

## License

This project is licensed using the [Permissive License Stack](https://protocol.ai/blog/announcing-the-permissive-license-stack/) which means that all contributions are available under the most permissive commonly-used licenses, and dependent projects can pick the license that best suits them.

Therefore, the project is dual-licensed under Apache 2.0 and MIT terms:

- Apache License, Version 2.0, ([LICENSE-APACHE](https://github.com/drand/timevault/blob/master/LICENSE-APACHE) or http://www.apache.org/licenses/LICENSE-2.0)
- MIT license ([LICENSE-MIT](https://github.com/drand/timevault/blob/master/LICENSE-MIT) or http://opensource.org/licenses/MIT)