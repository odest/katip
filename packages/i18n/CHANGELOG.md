# Changelog

## [0.1.9](https://github.com/odest/katip/compare/v0.1.8...v0.1.9) (2025-12-16)


### Features

* **ai:** add cloud LLM provider support with API key auth ([c8edd84](https://github.com/odest/katip/commit/c8edd841ac9d6caea10537180f061c667175f479))
* transcription improvements, unified routing, and UX enhancements ([c1594b9](https://github.com/odest/katip/commit/c1594b9a4e3909d71754dcb3f55fb856943716d8))
* **ui:** add copy to clipboard functionality for summary and actions ([0386207](https://github.com/odest/katip/commit/0386207d3d36352722afb4000dda490ab7d5865f))


### Bug Fixes

* **transcription:** prevent restart after navigation and improve retry handling ([7e5ca82](https://github.com/odest/katip/commit/7e5ca82b57b3392aab98ad81fdb5ed134f5e8844))


### Code Refactoring

* **native:** simplify model selection to single file picker ([a520d5a](https://github.com/odest/katip/commit/a520d5a6565bb03433749de65d270fb322aade2a))

## [0.1.8](https://github.com/odest/katip/compare/v0.1.7...v0.1.8) (2025-12-16)


### Features

* **ai:** add cloud LLM provider support with API key auth ([c8edd84](https://github.com/odest/katip/commit/c8edd841ac9d6caea10537180f061c667175f479))
* improve audio processing and resolve RSC security vulnerabilities ([4795b77](https://github.com/odest/katip/commit/4795b778aba018ed7af96ffc1f77b8c9667a51e4))
* **native:** replace hound with symphonia to support multiple formats ([d85f9e4](https://github.com/odest/katip/commit/d85f9e47a2b1a3ffb81319d1df67921fed8ad54b))
* transcription improvements, unified routing, and UX enhancements ([c1594b9](https://github.com/odest/katip/commit/c1594b9a4e3909d71754dcb3f55fb856943716d8))
* **ui:** add copy to clipboard functionality for summary and actions ([0386207](https://github.com/odest/katip/commit/0386207d3d36352722afb4000dda490ab7d5865f))


### Bug Fixes

* **deps:** upgrade next.js and react to resolve new RSC vulnerabilities ([bb3d376](https://github.com/odest/katip/commit/bb3d37699c0ffcfdf394daba2e0046c57674a6eb))
* **transcription:** prevent restart after navigation and improve retry handling ([7e5ca82](https://github.com/odest/katip/commit/7e5ca82b57b3392aab98ad81fdb5ed134f5e8844))


### Code Refactoring

* **native:** simplify model selection to single file picker ([a520d5a](https://github.com/odest/katip/commit/a520d5a6565bb03433749de65d270fb322aade2a))

## [0.1.7](https://github.com/odest/katip/compare/v0.1.6...v0.1.7) (2025-12-12)


### Features

* add copy to clipboard support to transcription views ([b14b7b7](https://github.com/odest/katip/commit/b14b7b77c62778591b8c07fd9d625b4dacbb3db8))
* add editing, export, and clipboard support with new toolbar and segment list ([0e53894](https://github.com/odest/katip/commit/0e5389438cf84cf2fb4874799c9b0a2ad69e07ce))
* add per-file download progress UI and translation keys ([61a7187](https://github.com/odest/katip/commit/61a7187930452d61a081ccb001b68c88b5f88f8a))
* add recordings migration, pagination, and remove color column ([2749506](https://github.com/odest/katip/commit/2749506445063a4fba30a2917d92c21e0645cd40))
* add segment editing and export as file ([75c91d2](https://github.com/odest/katip/commit/75c91d21ba20f91b31475dee18eb0c267bf7b11c))
* **auth:** add forgot password and reset password flow ([412d089](https://github.com/odest/katip/commit/412d089cea4776bb09a7ded419ee8f0a8396bf19))
* **auth:** Add Supabase auth, UI components, and OTP flow ([a272ad1](https://github.com/odest/katip/commit/a272ad1b571e5eba20d083aad20c05da66e88a35))
* **auth:** enable account deletion with validation ([209e0f8](https://github.com/odest/katip/commit/209e0f8628f8880baf0d3b68ec97b01740529251))
* **auth:** enable avatar upload/remove with validation ([3633a7e](https://github.com/odest/katip/commit/3633a7e7fca856dee30ab880937694e1bb271672))
* **auth:** enable password update with validation ([3c729c5](https://github.com/odest/katip/commit/3c729c5f06a19720e218a6d4947f9f9a2497a228))
* **auth:** enable update email with validation ([61c5080](https://github.com/odest/katip/commit/61c508071096c0d5bb3e848bd5dc1305afddd47d))
* **auth:** enable update name with validation ([89914d1](https://github.com/odest/katip/commit/89914d1feae68119a6e124b225524dff87fead81))
* **auth:** fix session management, db init and local user cleanup ([f91c9cc](https://github.com/odest/katip/commit/f91c9cc30e1b2a5f518f1de3c3a7e31c76ac8403))
* **auth:** implement comprehensive authentication system and user settings ([186b2ea](https://github.com/odest/katip/commit/186b2ea36ed9a7709fc0d35e327d35a86ddfbdc2))
* **db:** implement soft delete with restore functionality and sync fix ([295e782](https://github.com/odest/katip/commit/295e7829f5d0cd1114eafec5915dbb84c79f2293))
* **i18n:** add missing translations to panels and pickers ([caea6ee](https://github.com/odest/katip/commit/caea6eeed44f74a629eafae0c50d5a320ddeb07a))
* improve audio processing and resolve RSC security vulnerabilities ([4795b77](https://github.com/odest/katip/commit/4795b778aba018ed7af96ffc1f77b8c9667a51e4))
* **native:** replace hound with symphonia to support multiple formats ([d85f9e4](https://github.com/odest/katip/commit/d85f9e47a2b1a3ffb81319d1df67921fed8ad54b))
* **settings:** Add AI provider card to settings page ([1f12892](https://github.com/odest/katip/commit/1f12892de539a3c9d80965e64ce32bc48e46593b))
* **sync:** add push recording sync support ([cf02c0f](https://github.com/odest/katip/commit/cf02c0fca887c94b6d3eb7f8c0a4c2ad801d46b5))
* **sync:** implement synchronization logic with pull & push recordings ([1c80123](https://github.com/odest/katip/commit/1c8012389c491a478de1f01bf4feb1719671d3d0))
* **transcription:** add basic transcription logic and UI ([8e2f44d](https://github.com/odest/katip/commit/8e2f44d0d20b6030da0893523f2e8894f838a3cf))
* **transcription:** implement desktop and web transcription support ([c5a7099](https://github.com/odest/katip/commit/c5a70994aa84411b972aa8089c6ae766e7df8770))
* **transcription:** support web transcription with transformers.js ([2bfaed4](https://github.com/odest/katip/commit/2bfaed408ba3dcab34a6a6199dde81f830ba86d7))
* **ui:** add account settings ui card with image, info, password, delete ([05266cb](https://github.com/odest/katip/commit/05266cb347a8a7e2448d7079a5c62a0325e7359d))
* **ui:** add basic recordings page with pagination and navigation ([15da692](https://github.com/odest/katip/commit/15da6920cdd2b1d1b6d59e602b7a08b98aad9eff))
* **ui:** add basic transcribe page, navigation and UI enhancements ([59f45e9](https://github.com/odest/katip/commit/59f45e9393de8690bf195d1aaee866a5e454c3d3))
* **ui:** add browser capabilities badge & hook, update i18n ([90b92d8](https://github.com/odest/katip/commit/90b92d8e7a1965403ea0ea2c1f212e02da8864a1))
* **ui:** add file upload component and toast wrapper ([071cfd9](https://github.com/odest/katip/commit/071cfd9a6b81a29c7fa9525e84bc3e925c9ee0df))
* **ui:** add language and performance selection components ([fc7d90a](https://github.com/odest/katip/commit/fc7d90a58b9201ac098da8fcf48920ae9c0dd7f2))
* **ui:** add local LLM summarization and action item extraction ([103f04c](https://github.com/odest/katip/commit/103f04cc10c3ca428776c6dfdf5ec60ee62a6c9f))
* **ui:** add local LLM summarization support ([ab48911](https://github.com/odest/katip/commit/ab489119734d2227717bd319671c2656ad67d15d))
* **ui:** add ModelSelectCard component and localization strings ([ee5c4af](https://github.com/odest/katip/commit/ee5c4af352799c20b04e2c7e54c7b144d43c270b))
* **ui:** add recording toolbar with search, sort, persist sort preference ([2efeb38](https://github.com/odest/katip/commit/2efeb388d2f7f2db5cb33ada141dfec1292ec445))
* **ui:** add settings store, persist selected tab, profile link ([b60483a](https://github.com/odest/katip/commit/b60483af80db49643c410698ca4591cc19d35ec4))
* **ui:** add sideviews for summary and actions ([9dc1c83](https://github.com/odest/katip/commit/9dc1c8376cf340c80fec1c30694a72dd50a047cd))
* **ui:** add user navigation with sign-in/sign-up forms ([0d0aa24](https://github.com/odest/katip/commit/0d0aa241ca08f592f60ee3168ca68b4ec585af10))
* **web:** add cached model indicators in model selection ([b6470c4](https://github.com/odest/katip/commit/b6470c4b8145bace6bc966b2369e976b002c075c))
* **web:** add cached models card to manage cached models ([e99baff](https://github.com/odest/katip/commit/e99baff87706f070b543f0ca29aacaf2cb59109e))


### Bug Fixes

* **deps:** upgrade next.js and react to resolve CVE-2025-55182 ([c73377a](https://github.com/odest/katip/commit/c73377a6d66ca3110096119df418dee7e367368d))
* **deps:** upgrade next.js and react to resolve new RSC vulnerabilities ([bb3d376](https://github.com/odest/katip/commit/bb3d37699c0ffcfdf394daba2e0046c57674a6eb))


### Code Refactoring

* introduce toolbar and segment list for transcription views ([9093dfc](https://github.com/odest/katip/commit/9093dfc33a65bab87715792d111c93d7d26d895a))
* overhaul transcription state and database logic ([2e6bc7f](https://github.com/odest/katip/commit/2e6bc7fa0381e64ce149adc0051eb5b30b15ceb9))
* remove title and description from HomePage and SettingsPage ([f81998d](https://github.com/odest/katip/commit/f81998d469b3e9833ce33fa7263b86962ae236e2))
* remove unused pages and i18n messages ([9c2be6f](https://github.com/odest/katip/commit/9c2be6f903524f68ce8b63dad8172746c7ebcb11))
* rename audio/model stores, add Tauri fs scope and drop support ([4029b8f](https://github.com/odest/katip/commit/4029b8f503abdda3a622be202604d740ac40942a))
* rename FileUploadCard to AudioSelectCard and selection logic ([49ac0a7](https://github.com/odest/katip/commit/49ac0a7c7c0cec1b43ef6c339dce1138e4bc906e))
* **ui:** reorganize UI components, drop unused code, add advanced options ([f63da3f](https://github.com/odest/katip/commit/f63da3f66a3224682735f2b30c67142358a14909))

## [0.1.6](https://github.com/odest/katip/compare/v0.1.5...v0.1.6) (2025-12-12)


### Features

* add copy to clipboard support to transcription views ([b14b7b7](https://github.com/odest/katip/commit/b14b7b77c62778591b8c07fd9d625b4dacbb3db8))
* add editing, export, and clipboard support with new toolbar and segment list ([0e53894](https://github.com/odest/katip/commit/0e5389438cf84cf2fb4874799c9b0a2ad69e07ce))
* add per-file download progress UI and translation keys ([61a7187](https://github.com/odest/katip/commit/61a7187930452d61a081ccb001b68c88b5f88f8a))
* add recordings migration, pagination, and remove color column ([2749506](https://github.com/odest/katip/commit/2749506445063a4fba30a2917d92c21e0645cd40))
* add segment editing and export as file ([75c91d2](https://github.com/odest/katip/commit/75c91d21ba20f91b31475dee18eb0c267bf7b11c))
* **auth:** add forgot password and reset password flow ([412d089](https://github.com/odest/katip/commit/412d089cea4776bb09a7ded419ee8f0a8396bf19))
* **auth:** Add Supabase auth, UI components, and OTP flow ([a272ad1](https://github.com/odest/katip/commit/a272ad1b571e5eba20d083aad20c05da66e88a35))
* **auth:** enable account deletion with validation ([209e0f8](https://github.com/odest/katip/commit/209e0f8628f8880baf0d3b68ec97b01740529251))
* **auth:** enable avatar upload/remove with validation ([3633a7e](https://github.com/odest/katip/commit/3633a7e7fca856dee30ab880937694e1bb271672))
* **auth:** enable password update with validation ([3c729c5](https://github.com/odest/katip/commit/3c729c5f06a19720e218a6d4947f9f9a2497a228))
* **auth:** enable update email with validation ([61c5080](https://github.com/odest/katip/commit/61c508071096c0d5bb3e848bd5dc1305afddd47d))
* **auth:** enable update name with validation ([89914d1](https://github.com/odest/katip/commit/89914d1feae68119a6e124b225524dff87fead81))
* **auth:** fix session management, db init and local user cleanup ([f91c9cc](https://github.com/odest/katip/commit/f91c9cc30e1b2a5f518f1de3c3a7e31c76ac8403))
* **auth:** implement comprehensive authentication system and user settings ([186b2ea](https://github.com/odest/katip/commit/186b2ea36ed9a7709fc0d35e327d35a86ddfbdc2))
* **db:** implement soft delete with restore functionality and sync fix ([295e782](https://github.com/odest/katip/commit/295e7829f5d0cd1114eafec5915dbb84c79f2293))
* **i18n:** add missing translations to panels and pickers ([caea6ee](https://github.com/odest/katip/commit/caea6eeed44f74a629eafae0c50d5a320ddeb07a))
* improve audio processing and resolve RSC security vulnerabilities ([4795b77](https://github.com/odest/katip/commit/4795b778aba018ed7af96ffc1f77b8c9667a51e4))
* **native:** replace hound with symphonia to support multiple formats ([d85f9e4](https://github.com/odest/katip/commit/d85f9e47a2b1a3ffb81319d1df67921fed8ad54b))
* **settings:** Add AI provider card to settings page ([1f12892](https://github.com/odest/katip/commit/1f12892de539a3c9d80965e64ce32bc48e46593b))
* **sync:** add push recording sync support ([cf02c0f](https://github.com/odest/katip/commit/cf02c0fca887c94b6d3eb7f8c0a4c2ad801d46b5))
* **sync:** implement synchronization logic with pull & push recordings ([1c80123](https://github.com/odest/katip/commit/1c8012389c491a478de1f01bf4feb1719671d3d0))
* **transcription:** add basic transcription logic and UI ([8e2f44d](https://github.com/odest/katip/commit/8e2f44d0d20b6030da0893523f2e8894f838a3cf))
* **transcription:** implement desktop and web transcription support ([c5a7099](https://github.com/odest/katip/commit/c5a70994aa84411b972aa8089c6ae766e7df8770))
* **transcription:** support web transcription with transformers.js ([2bfaed4](https://github.com/odest/katip/commit/2bfaed408ba3dcab34a6a6199dde81f830ba86d7))
* **ui:** add account settings ui card with image, info, password, delete ([05266cb](https://github.com/odest/katip/commit/05266cb347a8a7e2448d7079a5c62a0325e7359d))
* **ui:** add basic recordings page with pagination and navigation ([15da692](https://github.com/odest/katip/commit/15da6920cdd2b1d1b6d59e602b7a08b98aad9eff))
* **ui:** add basic transcribe page, navigation and UI enhancements ([59f45e9](https://github.com/odest/katip/commit/59f45e9393de8690bf195d1aaee866a5e454c3d3))
* **ui:** add browser capabilities badge & hook, update i18n ([90b92d8](https://github.com/odest/katip/commit/90b92d8e7a1965403ea0ea2c1f212e02da8864a1))
* **ui:** add file upload component and toast wrapper ([071cfd9](https://github.com/odest/katip/commit/071cfd9a6b81a29c7fa9525e84bc3e925c9ee0df))
* **ui:** add language and performance selection components ([fc7d90a](https://github.com/odest/katip/commit/fc7d90a58b9201ac098da8fcf48920ae9c0dd7f2))
* **ui:** add local LLM summarization and action item extraction ([103f04c](https://github.com/odest/katip/commit/103f04cc10c3ca428776c6dfdf5ec60ee62a6c9f))
* **ui:** add local LLM summarization support ([ab48911](https://github.com/odest/katip/commit/ab489119734d2227717bd319671c2656ad67d15d))
* **ui:** add ModelSelectCard component and localization strings ([ee5c4af](https://github.com/odest/katip/commit/ee5c4af352799c20b04e2c7e54c7b144d43c270b))
* **ui:** add recording toolbar with search, sort, persist sort preference ([2efeb38](https://github.com/odest/katip/commit/2efeb388d2f7f2db5cb33ada141dfec1292ec445))
* **ui:** add settings store, persist selected tab, profile link ([b60483a](https://github.com/odest/katip/commit/b60483af80db49643c410698ca4591cc19d35ec4))
* **ui:** add sideviews for summary and actions ([9dc1c83](https://github.com/odest/katip/commit/9dc1c8376cf340c80fec1c30694a72dd50a047cd))
* **ui:** add user navigation with sign-in/sign-up forms ([0d0aa24](https://github.com/odest/katip/commit/0d0aa241ca08f592f60ee3168ca68b4ec585af10))
* **web:** add cached model indicators in model selection ([b6470c4](https://github.com/odest/katip/commit/b6470c4b8145bace6bc966b2369e976b002c075c))
* **web:** add cached models card to manage cached models ([e99baff](https://github.com/odest/katip/commit/e99baff87706f070b543f0ca29aacaf2cb59109e))


### Bug Fixes

* **deps:** upgrade next.js and react to resolve CVE-2025-55182 ([c73377a](https://github.com/odest/katip/commit/c73377a6d66ca3110096119df418dee7e367368d))
* **deps:** upgrade next.js and react to resolve new RSC vulnerabilities ([bb3d376](https://github.com/odest/katip/commit/bb3d37699c0ffcfdf394daba2e0046c57674a6eb))


### Code Refactoring

* introduce toolbar and segment list for transcription views ([9093dfc](https://github.com/odest/katip/commit/9093dfc33a65bab87715792d111c93d7d26d895a))
* overhaul transcription state and database logic ([2e6bc7f](https://github.com/odest/katip/commit/2e6bc7fa0381e64ce149adc0051eb5b30b15ceb9))
* remove title and description from HomePage and SettingsPage ([f81998d](https://github.com/odest/katip/commit/f81998d469b3e9833ce33fa7263b86962ae236e2))
* remove unused pages and i18n messages ([9c2be6f](https://github.com/odest/katip/commit/9c2be6f903524f68ce8b63dad8172746c7ebcb11))
* rename audio/model stores, add Tauri fs scope and drop support ([4029b8f](https://github.com/odest/katip/commit/4029b8f503abdda3a622be202604d740ac40942a))
* rename FileUploadCard to AudioSelectCard and selection logic ([49ac0a7](https://github.com/odest/katip/commit/49ac0a7c7c0cec1b43ef6c339dce1138e4bc906e))
* **ui:** reorganize UI components, drop unused code, add advanced options ([f63da3f](https://github.com/odest/katip/commit/f63da3f66a3224682735f2b30c67142358a14909))

## [0.1.5](https://github.com/odest/katip/compare/v0.1.4...v0.1.5) (2025-12-10)


### Features

* add copy to clipboard support to transcription views ([b14b7b7](https://github.com/odest/katip/commit/b14b7b77c62778591b8c07fd9d625b4dacbb3db8))
* add editing, export, and clipboard support with new toolbar and segment list ([0e53894](https://github.com/odest/katip/commit/0e5389438cf84cf2fb4874799c9b0a2ad69e07ce))
* add per-file download progress UI and translation keys ([61a7187](https://github.com/odest/katip/commit/61a7187930452d61a081ccb001b68c88b5f88f8a))
* add recordings migration, pagination, and remove color column ([2749506](https://github.com/odest/katip/commit/2749506445063a4fba30a2917d92c21e0645cd40))
* add segment editing and export as file ([75c91d2](https://github.com/odest/katip/commit/75c91d21ba20f91b31475dee18eb0c267bf7b11c))
* **auth:** add forgot password and reset password flow ([412d089](https://github.com/odest/katip/commit/412d089cea4776bb09a7ded419ee8f0a8396bf19))
* **auth:** Add Supabase auth, UI components, and OTP flow ([a272ad1](https://github.com/odest/katip/commit/a272ad1b571e5eba20d083aad20c05da66e88a35))
* **auth:** enable account deletion with validation ([209e0f8](https://github.com/odest/katip/commit/209e0f8628f8880baf0d3b68ec97b01740529251))
* **auth:** enable avatar upload/remove with validation ([3633a7e](https://github.com/odest/katip/commit/3633a7e7fca856dee30ab880937694e1bb271672))
* **auth:** enable password update with validation ([3c729c5](https://github.com/odest/katip/commit/3c729c5f06a19720e218a6d4947f9f9a2497a228))
* **auth:** enable update email with validation ([61c5080](https://github.com/odest/katip/commit/61c508071096c0d5bb3e848bd5dc1305afddd47d))
* **auth:** enable update name with validation ([89914d1](https://github.com/odest/katip/commit/89914d1feae68119a6e124b225524dff87fead81))
* **auth:** fix session management, db init and local user cleanup ([f91c9cc](https://github.com/odest/katip/commit/f91c9cc30e1b2a5f518f1de3c3a7e31c76ac8403))
* **auth:** implement comprehensive authentication system and user settings ([186b2ea](https://github.com/odest/katip/commit/186b2ea36ed9a7709fc0d35e327d35a86ddfbdc2))
* **db:** implement soft delete with restore functionality and sync fix ([295e782](https://github.com/odest/katip/commit/295e7829f5d0cd1114eafec5915dbb84c79f2293))
* **i18n:** add missing translations to panels and pickers ([caea6ee](https://github.com/odest/katip/commit/caea6eeed44f74a629eafae0c50d5a320ddeb07a))
* **settings:** Add AI provider card to settings page ([1f12892](https://github.com/odest/katip/commit/1f12892de539a3c9d80965e64ce32bc48e46593b))
* **sync:** add push recording sync support ([cf02c0f](https://github.com/odest/katip/commit/cf02c0fca887c94b6d3eb7f8c0a4c2ad801d46b5))
* **sync:** implement synchronization logic with pull & push recordings ([1c80123](https://github.com/odest/katip/commit/1c8012389c491a478de1f01bf4feb1719671d3d0))
* **transcription:** add basic transcription logic and UI ([8e2f44d](https://github.com/odest/katip/commit/8e2f44d0d20b6030da0893523f2e8894f838a3cf))
* **transcription:** implement desktop and web transcription support ([c5a7099](https://github.com/odest/katip/commit/c5a70994aa84411b972aa8089c6ae766e7df8770))
* **transcription:** support web transcription with transformers.js ([2bfaed4](https://github.com/odest/katip/commit/2bfaed408ba3dcab34a6a6199dde81f830ba86d7))
* **ui:** add account settings ui card with image, info, password, delete ([05266cb](https://github.com/odest/katip/commit/05266cb347a8a7e2448d7079a5c62a0325e7359d))
* **ui:** add basic recordings page with pagination and navigation ([15da692](https://github.com/odest/katip/commit/15da6920cdd2b1d1b6d59e602b7a08b98aad9eff))
* **ui:** add basic transcribe page, navigation and UI enhancements ([59f45e9](https://github.com/odest/katip/commit/59f45e9393de8690bf195d1aaee866a5e454c3d3))
* **ui:** add browser capabilities badge & hook, update i18n ([90b92d8](https://github.com/odest/katip/commit/90b92d8e7a1965403ea0ea2c1f212e02da8864a1))
* **ui:** add file upload component and toast wrapper ([071cfd9](https://github.com/odest/katip/commit/071cfd9a6b81a29c7fa9525e84bc3e925c9ee0df))
* **ui:** add language and performance selection components ([fc7d90a](https://github.com/odest/katip/commit/fc7d90a58b9201ac098da8fcf48920ae9c0dd7f2))
* **ui:** add local LLM summarization and action item extraction ([103f04c](https://github.com/odest/katip/commit/103f04cc10c3ca428776c6dfdf5ec60ee62a6c9f))
* **ui:** add local LLM summarization support ([ab48911](https://github.com/odest/katip/commit/ab489119734d2227717bd319671c2656ad67d15d))
* **ui:** add ModelSelectCard component and localization strings ([ee5c4af](https://github.com/odest/katip/commit/ee5c4af352799c20b04e2c7e54c7b144d43c270b))
* **ui:** add recording toolbar with search, sort, persist sort preference ([2efeb38](https://github.com/odest/katip/commit/2efeb388d2f7f2db5cb33ada141dfec1292ec445))
* **ui:** add settings store, persist selected tab, profile link ([b60483a](https://github.com/odest/katip/commit/b60483af80db49643c410698ca4591cc19d35ec4))
* **ui:** add sideviews for summary and actions ([9dc1c83](https://github.com/odest/katip/commit/9dc1c8376cf340c80fec1c30694a72dd50a047cd))
* **ui:** add user navigation with sign-in/sign-up forms ([0d0aa24](https://github.com/odest/katip/commit/0d0aa241ca08f592f60ee3168ca68b4ec585af10))
* **web:** add cached model indicators in model selection ([b6470c4](https://github.com/odest/katip/commit/b6470c4b8145bace6bc966b2369e976b002c075c))
* **web:** add cached models card to manage cached models ([e99baff](https://github.com/odest/katip/commit/e99baff87706f070b543f0ca29aacaf2cb59109e))


### Bug Fixes

* **deps:** upgrade next.js and react to resolve CVE-2025-55182 ([c73377a](https://github.com/odest/katip/commit/c73377a6d66ca3110096119df418dee7e367368d))


### Code Refactoring

* introduce toolbar and segment list for transcription views ([9093dfc](https://github.com/odest/katip/commit/9093dfc33a65bab87715792d111c93d7d26d895a))
* overhaul transcription state and database logic ([2e6bc7f](https://github.com/odest/katip/commit/2e6bc7fa0381e64ce149adc0051eb5b30b15ceb9))
* remove title and description from HomePage and SettingsPage ([f81998d](https://github.com/odest/katip/commit/f81998d469b3e9833ce33fa7263b86962ae236e2))
* remove unused pages and i18n messages ([9c2be6f](https://github.com/odest/katip/commit/9c2be6f903524f68ce8b63dad8172746c7ebcb11))
* rename audio/model stores, add Tauri fs scope and drop support ([4029b8f](https://github.com/odest/katip/commit/4029b8f503abdda3a622be202604d740ac40942a))
* rename FileUploadCard to AudioSelectCard and selection logic ([49ac0a7](https://github.com/odest/katip/commit/49ac0a7c7c0cec1b43ef6c339dce1138e4bc906e))
* **ui:** reorganize UI components, drop unused code, add advanced options ([f63da3f](https://github.com/odest/katip/commit/f63da3f66a3224682735f2b30c67142358a14909))

## [0.1.4](https://github.com/odest/katip/compare/v0.1.3...v0.1.4) (2025-12-10)


### Features

* add recordings migration, pagination, and remove color column ([2749506](https://github.com/odest/katip/commit/2749506445063a4fba30a2917d92c21e0645cd40))
* **auth:** fix session management, db init and local user cleanup ([f91c9cc](https://github.com/odest/katip/commit/f91c9cc30e1b2a5f518f1de3c3a7e31c76ac8403))
* **db:** implement soft delete with restore functionality and sync fix ([295e782](https://github.com/odest/katip/commit/295e7829f5d0cd1114eafec5915dbb84c79f2293))
* **sync:** add push recording sync support ([cf02c0f](https://github.com/odest/katip/commit/cf02c0fca887c94b6d3eb7f8c0a4c2ad801d46b5))
* **sync:** implement synchronization logic with pull & push recordings ([1c80123](https://github.com/odest/katip/commit/1c8012389c491a478de1f01bf4feb1719671d3d0))
* **ui:** add basic recordings page with pagination and navigation ([15da692](https://github.com/odest/katip/commit/15da6920cdd2b1d1b6d59e602b7a08b98aad9eff))
* **ui:** add recording toolbar with search, sort, persist sort preference ([2efeb38](https://github.com/odest/katip/commit/2efeb388d2f7f2db5cb33ada141dfec1292ec445))


### Bug Fixes

* **deps:** upgrade next.js and react to resolve CVE-2025-55182 ([c73377a](https://github.com/odest/katip/commit/c73377a6d66ca3110096119df418dee7e367368d))


### Code Refactoring

* overhaul transcription state and database logic ([2e6bc7f](https://github.com/odest/katip/commit/2e6bc7fa0381e64ce149adc0051eb5b30b15ceb9))

## [0.1.3](https://github.com/odest/katip/compare/v0.1.2...v0.1.3) (2025-11-28)


### Features

* add copy to clipboard support to transcription views ([b14b7b7](https://github.com/odest/katip/commit/b14b7b77c62778591b8c07fd9d625b4dacbb3db8))
* add editing, export, and clipboard support with new toolbar and segment list ([0e53894](https://github.com/odest/katip/commit/0e5389438cf84cf2fb4874799c9b0a2ad69e07ce))
* add per-file download progress UI and translation keys ([61a7187](https://github.com/odest/katip/commit/61a7187930452d61a081ccb001b68c88b5f88f8a))
* add segment editing and export as file ([75c91d2](https://github.com/odest/katip/commit/75c91d21ba20f91b31475dee18eb0c267bf7b11c))
* **auth:** add forgot password and reset password flow ([412d089](https://github.com/odest/katip/commit/412d089cea4776bb09a7ded419ee8f0a8396bf19))
* **auth:** Add Supabase auth, UI components, and OTP flow ([a272ad1](https://github.com/odest/katip/commit/a272ad1b571e5eba20d083aad20c05da66e88a35))
* **auth:** enable account deletion with validation ([209e0f8](https://github.com/odest/katip/commit/209e0f8628f8880baf0d3b68ec97b01740529251))
* **auth:** enable avatar upload/remove with validation ([3633a7e](https://github.com/odest/katip/commit/3633a7e7fca856dee30ab880937694e1bb271672))
* **auth:** enable password update with validation ([3c729c5](https://github.com/odest/katip/commit/3c729c5f06a19720e218a6d4947f9f9a2497a228))
* **auth:** enable update email with validation ([61c5080](https://github.com/odest/katip/commit/61c508071096c0d5bb3e848bd5dc1305afddd47d))
* **auth:** enable update name with validation ([89914d1](https://github.com/odest/katip/commit/89914d1feae68119a6e124b225524dff87fead81))
* **auth:** implement comprehensive authentication system and user settings ([186b2ea](https://github.com/odest/katip/commit/186b2ea36ed9a7709fc0d35e327d35a86ddfbdc2))
* **i18n:** add missing translations to panels and pickers ([caea6ee](https://github.com/odest/katip/commit/caea6eeed44f74a629eafae0c50d5a320ddeb07a))
* **settings:** Add AI provider card to settings page ([1f12892](https://github.com/odest/katip/commit/1f12892de539a3c9d80965e64ce32bc48e46593b))
* **transcription:** add basic transcription logic and UI ([8e2f44d](https://github.com/odest/katip/commit/8e2f44d0d20b6030da0893523f2e8894f838a3cf))
* **transcription:** implement desktop and web transcription support ([c5a7099](https://github.com/odest/katip/commit/c5a70994aa84411b972aa8089c6ae766e7df8770))
* **transcription:** support web transcription with transformers.js ([2bfaed4](https://github.com/odest/katip/commit/2bfaed408ba3dcab34a6a6199dde81f830ba86d7))
* **ui:** add account settings ui card with image, info, password, delete ([05266cb](https://github.com/odest/katip/commit/05266cb347a8a7e2448d7079a5c62a0325e7359d))
* **ui:** add basic transcribe page, navigation and UI enhancements ([59f45e9](https://github.com/odest/katip/commit/59f45e9393de8690bf195d1aaee866a5e454c3d3))
* **ui:** add browser capabilities badge & hook, update i18n ([90b92d8](https://github.com/odest/katip/commit/90b92d8e7a1965403ea0ea2c1f212e02da8864a1))
* **ui:** add file upload component and toast wrapper ([071cfd9](https://github.com/odest/katip/commit/071cfd9a6b81a29c7fa9525e84bc3e925c9ee0df))
* **ui:** add language and performance selection components ([fc7d90a](https://github.com/odest/katip/commit/fc7d90a58b9201ac098da8fcf48920ae9c0dd7f2))
* **ui:** add local LLM summarization and action item extraction ([103f04c](https://github.com/odest/katip/commit/103f04cc10c3ca428776c6dfdf5ec60ee62a6c9f))
* **ui:** add local LLM summarization support ([ab48911](https://github.com/odest/katip/commit/ab489119734d2227717bd319671c2656ad67d15d))
* **ui:** add ModelSelectCard component and localization strings ([ee5c4af](https://github.com/odest/katip/commit/ee5c4af352799c20b04e2c7e54c7b144d43c270b))
* **ui:** add settings store, persist selected tab, profile link ([b60483a](https://github.com/odest/katip/commit/b60483af80db49643c410698ca4591cc19d35ec4))
* **ui:** add sideviews for summary and actions ([9dc1c83](https://github.com/odest/katip/commit/9dc1c8376cf340c80fec1c30694a72dd50a047cd))
* **ui:** add user navigation with sign-in/sign-up forms ([0d0aa24](https://github.com/odest/katip/commit/0d0aa241ca08f592f60ee3168ca68b4ec585af10))
* **web:** add cached model indicators in model selection ([b6470c4](https://github.com/odest/katip/commit/b6470c4b8145bace6bc966b2369e976b002c075c))
* **web:** add cached models card to manage cached models ([e99baff](https://github.com/odest/katip/commit/e99baff87706f070b543f0ca29aacaf2cb59109e))


### Code Refactoring

* introduce toolbar and segment list for transcription views ([9093dfc](https://github.com/odest/katip/commit/9093dfc33a65bab87715792d111c93d7d26d895a))
* remove title and description from HomePage and SettingsPage ([f81998d](https://github.com/odest/katip/commit/f81998d469b3e9833ce33fa7263b86962ae236e2))
* remove unused pages and i18n messages ([9c2be6f](https://github.com/odest/katip/commit/9c2be6f903524f68ce8b63dad8172746c7ebcb11))
* rename audio/model stores, add Tauri fs scope and drop support ([4029b8f](https://github.com/odest/katip/commit/4029b8f503abdda3a622be202604d740ac40942a))
* rename FileUploadCard to AudioSelectCard and selection logic ([49ac0a7](https://github.com/odest/katip/commit/49ac0a7c7c0cec1b43ef6c339dce1138e4bc906e))
* **ui:** reorganize UI components, drop unused code, add advanced options ([f63da3f](https://github.com/odest/katip/commit/f63da3f66a3224682735f2b30c67142358a14909))

## [0.1.2](https://github.com/odest/katip/compare/v0.1.1...v0.1.2) (2025-11-28)


### Features

* add copy to clipboard support to transcription views ([b14b7b7](https://github.com/odest/katip/commit/b14b7b77c62778591b8c07fd9d625b4dacbb3db8))
* add editing, export, and clipboard support with new toolbar and segment list ([0e53894](https://github.com/odest/katip/commit/0e5389438cf84cf2fb4874799c9b0a2ad69e07ce))
* add per-file download progress UI and translation keys ([61a7187](https://github.com/odest/katip/commit/61a7187930452d61a081ccb001b68c88b5f88f8a))
* add segment editing and export as file ([75c91d2](https://github.com/odest/katip/commit/75c91d21ba20f91b31475dee18eb0c267bf7b11c))
* **auth:** add forgot password and reset password flow ([412d089](https://github.com/odest/katip/commit/412d089cea4776bb09a7ded419ee8f0a8396bf19))
* **auth:** Add Supabase auth, UI components, and OTP flow ([a272ad1](https://github.com/odest/katip/commit/a272ad1b571e5eba20d083aad20c05da66e88a35))
* **auth:** enable account deletion with validation ([209e0f8](https://github.com/odest/katip/commit/209e0f8628f8880baf0d3b68ec97b01740529251))
* **auth:** enable avatar upload/remove with validation ([3633a7e](https://github.com/odest/katip/commit/3633a7e7fca856dee30ab880937694e1bb271672))
* **auth:** enable password update with validation ([3c729c5](https://github.com/odest/katip/commit/3c729c5f06a19720e218a6d4947f9f9a2497a228))
* **auth:** enable update email with validation ([61c5080](https://github.com/odest/katip/commit/61c508071096c0d5bb3e848bd5dc1305afddd47d))
* **auth:** enable update name with validation ([89914d1](https://github.com/odest/katip/commit/89914d1feae68119a6e124b225524dff87fead81))
* **auth:** implement comprehensive authentication system and user settings ([186b2ea](https://github.com/odest/katip/commit/186b2ea36ed9a7709fc0d35e327d35a86ddfbdc2))
* **i18n:** add missing translations to panels and pickers ([caea6ee](https://github.com/odest/katip/commit/caea6eeed44f74a629eafae0c50d5a320ddeb07a))
* **settings:** Add AI provider card to settings page ([1f12892](https://github.com/odest/katip/commit/1f12892de539a3c9d80965e64ce32bc48e46593b))
* **transcription:** add basic transcription logic and UI ([8e2f44d](https://github.com/odest/katip/commit/8e2f44d0d20b6030da0893523f2e8894f838a3cf))
* **transcription:** implement desktop and web transcription support ([c5a7099](https://github.com/odest/katip/commit/c5a70994aa84411b972aa8089c6ae766e7df8770))
* **transcription:** support web transcription with transformers.js ([2bfaed4](https://github.com/odest/katip/commit/2bfaed408ba3dcab34a6a6199dde81f830ba86d7))
* **ui:** add account settings ui card with image, info, password, delete ([05266cb](https://github.com/odest/katip/commit/05266cb347a8a7e2448d7079a5c62a0325e7359d))
* **ui:** add basic transcribe page, navigation and UI enhancements ([59f45e9](https://github.com/odest/katip/commit/59f45e9393de8690bf195d1aaee866a5e454c3d3))
* **ui:** add browser capabilities badge & hook, update i18n ([90b92d8](https://github.com/odest/katip/commit/90b92d8e7a1965403ea0ea2c1f212e02da8864a1))
* **ui:** add file upload component and toast wrapper ([071cfd9](https://github.com/odest/katip/commit/071cfd9a6b81a29c7fa9525e84bc3e925c9ee0df))
* **ui:** add language and performance selection components ([fc7d90a](https://github.com/odest/katip/commit/fc7d90a58b9201ac098da8fcf48920ae9c0dd7f2))
* **ui:** add local LLM summarization and action item extraction ([103f04c](https://github.com/odest/katip/commit/103f04cc10c3ca428776c6dfdf5ec60ee62a6c9f))
* **ui:** add local LLM summarization support ([ab48911](https://github.com/odest/katip/commit/ab489119734d2227717bd319671c2656ad67d15d))
* **ui:** add ModelSelectCard component and localization strings ([ee5c4af](https://github.com/odest/katip/commit/ee5c4af352799c20b04e2c7e54c7b144d43c270b))
* **ui:** add settings store, persist selected tab, profile link ([b60483a](https://github.com/odest/katip/commit/b60483af80db49643c410698ca4591cc19d35ec4))
* **ui:** add sideviews for summary and actions ([9dc1c83](https://github.com/odest/katip/commit/9dc1c8376cf340c80fec1c30694a72dd50a047cd))
* **ui:** add user navigation with sign-in/sign-up forms ([0d0aa24](https://github.com/odest/katip/commit/0d0aa241ca08f592f60ee3168ca68b4ec585af10))
* **web:** add cached model indicators in model selection ([b6470c4](https://github.com/odest/katip/commit/b6470c4b8145bace6bc966b2369e976b002c075c))
* **web:** add cached models card to manage cached models ([e99baff](https://github.com/odest/katip/commit/e99baff87706f070b543f0ca29aacaf2cb59109e))


### Code Refactoring

* introduce toolbar and segment list for transcription views ([9093dfc](https://github.com/odest/katip/commit/9093dfc33a65bab87715792d111c93d7d26d895a))
* remove title and description from HomePage and SettingsPage ([f81998d](https://github.com/odest/katip/commit/f81998d469b3e9833ce33fa7263b86962ae236e2))
* remove unused pages and i18n messages ([9c2be6f](https://github.com/odest/katip/commit/9c2be6f903524f68ce8b63dad8172746c7ebcb11))
* rename audio/model stores, add Tauri fs scope and drop support ([4029b8f](https://github.com/odest/katip/commit/4029b8f503abdda3a622be202604d740ac40942a))
* rename FileUploadCard to AudioSelectCard and selection logic ([49ac0a7](https://github.com/odest/katip/commit/49ac0a7c7c0cec1b43ef6c339dce1138e4bc906e))
* **ui:** reorganize UI components, drop unused code, add advanced options ([f63da3f](https://github.com/odest/katip/commit/f63da3f66a3224682735f2b30c67142358a14909))

## [0.1.1](https://github.com/odest/katip/compare/v0.1.0...v0.1.1) (2025-11-28)


### Features

* add copy to clipboard support to transcription views ([b14b7b7](https://github.com/odest/katip/commit/b14b7b77c62778591b8c07fd9d625b4dacbb3db8))
* add editing, export, and clipboard support with new toolbar and segment list ([0e53894](https://github.com/odest/katip/commit/0e5389438cf84cf2fb4874799c9b0a2ad69e07ce))
* add per-file download progress UI and translation keys ([61a7187](https://github.com/odest/katip/commit/61a7187930452d61a081ccb001b68c88b5f88f8a))
* add segment editing and export as file ([75c91d2](https://github.com/odest/katip/commit/75c91d21ba20f91b31475dee18eb0c267bf7b11c))
* **auth:** add forgot password and reset password flow ([412d089](https://github.com/odest/katip/commit/412d089cea4776bb09a7ded419ee8f0a8396bf19))
* **auth:** Add Supabase auth, UI components, and OTP flow ([a272ad1](https://github.com/odest/katip/commit/a272ad1b571e5eba20d083aad20c05da66e88a35))
* **auth:** enable account deletion with validation ([209e0f8](https://github.com/odest/katip/commit/209e0f8628f8880baf0d3b68ec97b01740529251))
* **auth:** enable avatar upload/remove with validation ([3633a7e](https://github.com/odest/katip/commit/3633a7e7fca856dee30ab880937694e1bb271672))
* **auth:** enable password update with validation ([3c729c5](https://github.com/odest/katip/commit/3c729c5f06a19720e218a6d4947f9f9a2497a228))
* **auth:** enable update email with validation ([61c5080](https://github.com/odest/katip/commit/61c508071096c0d5bb3e848bd5dc1305afddd47d))
* **auth:** enable update name with validation ([89914d1](https://github.com/odest/katip/commit/89914d1feae68119a6e124b225524dff87fead81))
* **auth:** implement comprehensive authentication system and user settings ([186b2ea](https://github.com/odest/katip/commit/186b2ea36ed9a7709fc0d35e327d35a86ddfbdc2))
* **i18n:** add missing translations to panels and pickers ([caea6ee](https://github.com/odest/katip/commit/caea6eeed44f74a629eafae0c50d5a320ddeb07a))
* **settings:** Add AI provider card to settings page ([1f12892](https://github.com/odest/katip/commit/1f12892de539a3c9d80965e64ce32bc48e46593b))
* **transcription:** add basic transcription logic and UI ([8e2f44d](https://github.com/odest/katip/commit/8e2f44d0d20b6030da0893523f2e8894f838a3cf))
* **transcription:** implement desktop and web transcription support ([c5a7099](https://github.com/odest/katip/commit/c5a70994aa84411b972aa8089c6ae766e7df8770))
* **transcription:** support web transcription with transformers.js ([2bfaed4](https://github.com/odest/katip/commit/2bfaed408ba3dcab34a6a6199dde81f830ba86d7))
* **ui:** add account settings ui card with image, info, password, delete ([05266cb](https://github.com/odest/katip/commit/05266cb347a8a7e2448d7079a5c62a0325e7359d))
* **ui:** add basic transcribe page, navigation and UI enhancements ([59f45e9](https://github.com/odest/katip/commit/59f45e9393de8690bf195d1aaee866a5e454c3d3))
* **ui:** add browser capabilities badge & hook, update i18n ([90b92d8](https://github.com/odest/katip/commit/90b92d8e7a1965403ea0ea2c1f212e02da8864a1))
* **ui:** add file upload component and toast wrapper ([071cfd9](https://github.com/odest/katip/commit/071cfd9a6b81a29c7fa9525e84bc3e925c9ee0df))
* **ui:** add language and performance selection components ([fc7d90a](https://github.com/odest/katip/commit/fc7d90a58b9201ac098da8fcf48920ae9c0dd7f2))
* **ui:** add local LLM summarization and action item extraction ([103f04c](https://github.com/odest/katip/commit/103f04cc10c3ca428776c6dfdf5ec60ee62a6c9f))
* **ui:** add local LLM summarization support ([ab48911](https://github.com/odest/katip/commit/ab489119734d2227717bd319671c2656ad67d15d))
* **ui:** add ModelSelectCard component and localization strings ([ee5c4af](https://github.com/odest/katip/commit/ee5c4af352799c20b04e2c7e54c7b144d43c270b))
* **ui:** add settings store, persist selected tab, profile link ([b60483a](https://github.com/odest/katip/commit/b60483af80db49643c410698ca4591cc19d35ec4))
* **ui:** add sideviews for summary and actions ([9dc1c83](https://github.com/odest/katip/commit/9dc1c8376cf340c80fec1c30694a72dd50a047cd))
* **ui:** add user navigation with sign-in/sign-up forms ([0d0aa24](https://github.com/odest/katip/commit/0d0aa241ca08f592f60ee3168ca68b4ec585af10))
* **web:** add cached model indicators in model selection ([b6470c4](https://github.com/odest/katip/commit/b6470c4b8145bace6bc966b2369e976b002c075c))
* **web:** add cached models card to manage cached models ([e99baff](https://github.com/odest/katip/commit/e99baff87706f070b543f0ca29aacaf2cb59109e))


### Code Refactoring

* introduce toolbar and segment list for transcription views ([9093dfc](https://github.com/odest/katip/commit/9093dfc33a65bab87715792d111c93d7d26d895a))
* remove title and description from HomePage and SettingsPage ([f81998d](https://github.com/odest/katip/commit/f81998d469b3e9833ce33fa7263b86962ae236e2))
* remove unused pages and i18n messages ([9c2be6f](https://github.com/odest/katip/commit/9c2be6f903524f68ce8b63dad8172746c7ebcb11))
* rename audio/model stores, add Tauri fs scope and drop support ([4029b8f](https://github.com/odest/katip/commit/4029b8f503abdda3a622be202604d740ac40942a))
* rename FileUploadCard to AudioSelectCard and selection logic ([49ac0a7](https://github.com/odest/katip/commit/49ac0a7c7c0cec1b43ef6c339dce1138e4bc906e))
* **ui:** reorganize UI components, drop unused code, add advanced options ([f63da3f](https://github.com/odest/katip/commit/f63da3f66a3224682735f2b30c67142358a14909))
