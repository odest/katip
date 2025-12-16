# Changelog

## [0.1.9](https://github.com/odest/katip/compare/v0.1.8...v0.1.9) (2025-12-16)


### Features

* **ai:** add cloud LLM provider support with API key auth ([c8edd84](https://github.com/odest/katip/commit/c8edd841ac9d6caea10537180f061c667175f479))
* **android:** enable Transformers.js transcription on Android ([c91653b](https://github.com/odest/katip/commit/c91653b6eafa19ecf770aa5a7c83229b2a777f09))
* transcription improvements, unified routing, and UX enhancements ([c1594b9](https://github.com/odest/katip/commit/c1594b9a4e3909d71754dcb3f55fb856943716d8))


### Bug Fixes

* **native:** sort migrations by filename for cross-platform consistency ([6e86723](https://github.com/odest/katip/commit/6e86723d4dff99695991a57ac5f9a091f3c2dcbb))


### Code Refactoring

* **native:** simplify model selection to single file picker ([a520d5a](https://github.com/odest/katip/commit/a520d5a6565bb03433749de65d270fb322aade2a))
* **routing:** unify home route to /home for both web and native ([8ea750e](https://github.com/odest/katip/commit/8ea750e7d0b4430a108235d9c2cd205d7c292214))

## [0.1.8](https://github.com/odest/katip/compare/v0.1.7...v0.1.8) (2025-12-12)


### Features

* improve audio processing and resolve RSC security vulnerabilities ([4795b77](https://github.com/odest/katip/commit/4795b778aba018ed7af96ffc1f77b8c9667a51e4))
* **native:** replace hound with symphonia to support multiple formats ([d85f9e4](https://github.com/odest/katip/commit/d85f9e47a2b1a3ffb81319d1df67921fed8ad54b))


### Bug Fixes

* **deps:** upgrade next.js and react to resolve new RSC vulnerabilities ([bb3d376](https://github.com/odest/katip/commit/bb3d37699c0ffcfdf394daba2e0046c57674a6eb))

## [0.1.7](https://github.com/odest/katip/compare/v0.1.6...v0.1.7) (2025-12-12)


### Features

* add copy to clipboard support to transcription views ([b14b7b7](https://github.com/odest/katip/commit/b14b7b77c62778591b8c07fd9d625b4dacbb3db8))
* add editing, export, and clipboard support with new toolbar and segment list ([0e53894](https://github.com/odest/katip/commit/0e5389438cf84cf2fb4874799c9b0a2ad69e07ce))
* add recordings migration, pagination, and remove color column ([2749506](https://github.com/odest/katip/commit/2749506445063a4fba30a2917d92c21e0645cd40))
* add segment editing and export as file ([75c91d2](https://github.com/odest/katip/commit/75c91d21ba20f91b31475dee18eb0c267bf7b11c))
* **auth:** add GitHub OAuth provider for signin and signup ([d2858b3](https://github.com/odest/katip/commit/d2858b3a8c803e5ebebb682424343a68ddd291b1))
* **auth:** Add Supabase auth, UI components, and OTP flow ([a272ad1](https://github.com/odest/katip/commit/a272ad1b571e5eba20d083aad20c05da66e88a35))
* **auth:** implement comprehensive authentication system and user settings ([186b2ea](https://github.com/odest/katip/commit/186b2ea36ed9a7709fc0d35e327d35a86ddfbdc2))
* **db:** add basic database stack with drizzle, sqlocal, sqlite, postgres ([e9fb499](https://github.com/odest/katip/commit/e9fb4999a5198cb1e863dfb9a2c0e3140e5262b1))
* **db:** add initial migration files and schema for SQLite and Postgres ([b2284f0](https://github.com/odest/katip/commit/b2284f069272e123ae13f6a21c8c35e58f56bb66))
* **db:** add SQL plugin, Drizzle proxy and multi-platform database setup ([30db4f0](https://github.com/odest/katip/commit/30db4f05e770e794efc6c81e4019fd1c77ff1a3a))
* **db:** add sqlocal support for local web db and configure migrations ([5a54b68](https://github.com/odest/katip/commit/5a54b6847fbc9cddfbd0acb31a2bcd5dc7030808))
* **db:** integrate persistence with database hooks ([63c26ed](https://github.com/odest/katip/commit/63c26ed77fde8ad37cb8fdabfb55c25b63fd3630))
* **gpu:** add Vulkan GPU acceleration support ([31a5e79](https://github.com/odest/katip/commit/31a5e799ce469ec3847d5dcf7048ab7b31221f53))
* improve audio processing and resolve RSC security vulnerabilities ([4795b77](https://github.com/odest/katip/commit/4795b778aba018ed7af96ffc1f77b8c9667a51e4))
* **native:** add dialog and fs plugins and audio picker component ([d7be847](https://github.com/odest/katip/commit/d7be84753afbc22b560d98af9cc68bb5cc268fe5))
* **native:** add whisper transcribe support for native desktop ([6152560](https://github.com/odest/katip/commit/615256061e692c0aa86177b731d9f420af10323d))
* **native:** replace hound with symphonia to support multiple formats ([d85f9e4](https://github.com/odest/katip/commit/d85f9e47a2b1a3ffb81319d1df67921fed8ad54b))
* **transcription:** add basic transcription logic and UI ([8e2f44d](https://github.com/odest/katip/commit/8e2f44d0d20b6030da0893523f2e8894f838a3cf))
* **transcription:** implement desktop and web transcription support ([c5a7099](https://github.com/odest/katip/commit/c5a70994aa84411b972aa8089c6ae766e7df8770))
* **ui:** add basic recordings page with pagination and navigation ([15da692](https://github.com/odest/katip/commit/15da6920cdd2b1d1b6d59e602b7a08b98aad9eff))
* **ui:** add basic transcribe page, navigation and UI enhancements ([59f45e9](https://github.com/odest/katip/commit/59f45e9393de8690bf195d1aaee866a5e454c3d3))
* **ui:** add browser capabilities badge & hook, update i18n ([90b92d8](https://github.com/odest/katip/commit/90b92d8e7a1965403ea0ea2c1f212e02da8864a1))
* **ui:** add file upload component and toast wrapper ([071cfd9](https://github.com/odest/katip/commit/071cfd9a6b81a29c7fa9525e84bc3e925c9ee0df))
* **ui:** add local LLM summarization and action item extraction ([103f04c](https://github.com/odest/katip/commit/103f04cc10c3ca428776c6dfdf5ec60ee62a6c9f))
* **ui:** add local LLM summarization support ([ab48911](https://github.com/odest/katip/commit/ab489119734d2227717bd319671c2656ad67d15d))
* **utils:** add file utils and unify database ([3c74b80](https://github.com/odest/katip/commit/3c74b808900994cfb22530f9a1795a273a862e62))
* **web:** add whisper wasm transcribe support for web ([320e1a7](https://github.com/odest/katip/commit/320e1a7bd3bc0e5e85685bc102267c356f6d1fc5))


### Bug Fixes

* **deps:** upgrade next.js and react to resolve CVE-2025-55182 ([c73377a](https://github.com/odest/katip/commit/c73377a6d66ca3110096119df418dee7e367368d))
* **deps:** upgrade next.js and react to resolve new RSC vulnerabilities ([bb3d376](https://github.com/odest/katip/commit/bb3d37699c0ffcfdf394daba2e0046c57674a6eb))


### Code Refactoring

* remove unused pages and i18n messages ([9c2be6f](https://github.com/odest/katip/commit/9c2be6f903524f68ce8b63dad8172746c7ebcb11))
* rename audio/model stores, add Tauri fs scope and drop support ([4029b8f](https://github.com/odest/katip/commit/4029b8f503abdda3a622be202604d740ac40942a))
* rename project to katip and update versions ([969d76a](https://github.com/odest/katip/commit/969d76a34d0d19214b0c8fe43dbbee44b4d1b14c))

## [0.1.6](https://github.com/odest/katip/compare/v0.1.5...v0.1.6) (2025-12-10)


### Features

* add copy to clipboard support to transcription views ([b14b7b7](https://github.com/odest/katip/commit/b14b7b77c62778591b8c07fd9d625b4dacbb3db8))
* add editing, export, and clipboard support with new toolbar and segment list ([0e53894](https://github.com/odest/katip/commit/0e5389438cf84cf2fb4874799c9b0a2ad69e07ce))
* add recordings migration, pagination, and remove color column ([2749506](https://github.com/odest/katip/commit/2749506445063a4fba30a2917d92c21e0645cd40))
* add segment editing and export as file ([75c91d2](https://github.com/odest/katip/commit/75c91d21ba20f91b31475dee18eb0c267bf7b11c))
* **auth:** add GitHub OAuth provider for signin and signup ([d2858b3](https://github.com/odest/katip/commit/d2858b3a8c803e5ebebb682424343a68ddd291b1))
* **auth:** Add Supabase auth, UI components, and OTP flow ([a272ad1](https://github.com/odest/katip/commit/a272ad1b571e5eba20d083aad20c05da66e88a35))
* **auth:** implement comprehensive authentication system and user settings ([186b2ea](https://github.com/odest/katip/commit/186b2ea36ed9a7709fc0d35e327d35a86ddfbdc2))
* **db:** add basic database stack with drizzle, sqlocal, sqlite, postgres ([e9fb499](https://github.com/odest/katip/commit/e9fb4999a5198cb1e863dfb9a2c0e3140e5262b1))
* **db:** add initial migration files and schema for SQLite and Postgres ([b2284f0](https://github.com/odest/katip/commit/b2284f069272e123ae13f6a21c8c35e58f56bb66))
* **db:** add SQL plugin, Drizzle proxy and multi-platform database setup ([30db4f0](https://github.com/odest/katip/commit/30db4f05e770e794efc6c81e4019fd1c77ff1a3a))
* **db:** add sqlocal support for local web db and configure migrations ([5a54b68](https://github.com/odest/katip/commit/5a54b6847fbc9cddfbd0acb31a2bcd5dc7030808))
* **db:** integrate persistence with database hooks ([63c26ed](https://github.com/odest/katip/commit/63c26ed77fde8ad37cb8fdabfb55c25b63fd3630))
* **gpu:** add Vulkan GPU acceleration support ([31a5e79](https://github.com/odest/katip/commit/31a5e799ce469ec3847d5dcf7048ab7b31221f53))
* **native:** add dialog and fs plugins and audio picker component ([d7be847](https://github.com/odest/katip/commit/d7be84753afbc22b560d98af9cc68bb5cc268fe5))
* **native:** add whisper transcribe support for native desktop ([6152560](https://github.com/odest/katip/commit/615256061e692c0aa86177b731d9f420af10323d))
* **transcription:** add basic transcription logic and UI ([8e2f44d](https://github.com/odest/katip/commit/8e2f44d0d20b6030da0893523f2e8894f838a3cf))
* **transcription:** implement desktop and web transcription support ([c5a7099](https://github.com/odest/katip/commit/c5a70994aa84411b972aa8089c6ae766e7df8770))
* **ui:** add basic recordings page with pagination and navigation ([15da692](https://github.com/odest/katip/commit/15da6920cdd2b1d1b6d59e602b7a08b98aad9eff))
* **ui:** add basic transcribe page, navigation and UI enhancements ([59f45e9](https://github.com/odest/katip/commit/59f45e9393de8690bf195d1aaee866a5e454c3d3))
* **ui:** add browser capabilities badge & hook, update i18n ([90b92d8](https://github.com/odest/katip/commit/90b92d8e7a1965403ea0ea2c1f212e02da8864a1))
* **ui:** add file upload component and toast wrapper ([071cfd9](https://github.com/odest/katip/commit/071cfd9a6b81a29c7fa9525e84bc3e925c9ee0df))
* **ui:** add local LLM summarization and action item extraction ([103f04c](https://github.com/odest/katip/commit/103f04cc10c3ca428776c6dfdf5ec60ee62a6c9f))
* **ui:** add local LLM summarization support ([ab48911](https://github.com/odest/katip/commit/ab489119734d2227717bd319671c2656ad67d15d))
* **utils:** add file utils and unify database ([3c74b80](https://github.com/odest/katip/commit/3c74b808900994cfb22530f9a1795a273a862e62))
* **web:** add whisper wasm transcribe support for web ([320e1a7](https://github.com/odest/katip/commit/320e1a7bd3bc0e5e85685bc102267c356f6d1fc5))


### Bug Fixes

* **deps:** upgrade next.js and react to resolve CVE-2025-55182 ([c73377a](https://github.com/odest/katip/commit/c73377a6d66ca3110096119df418dee7e367368d))


### Code Refactoring

* remove unused pages and i18n messages ([9c2be6f](https://github.com/odest/katip/commit/9c2be6f903524f68ce8b63dad8172746c7ebcb11))
* rename audio/model stores, add Tauri fs scope and drop support ([4029b8f](https://github.com/odest/katip/commit/4029b8f503abdda3a622be202604d740ac40942a))
* rename project to katip and update versions ([969d76a](https://github.com/odest/katip/commit/969d76a34d0d19214b0c8fe43dbbee44b4d1b14c))

## [0.1.5](https://github.com/odest/katip/compare/v0.1.4...v0.1.5) (2025-12-10)


### Features

* add recordings migration, pagination, and remove color column ([2749506](https://github.com/odest/katip/commit/2749506445063a4fba30a2917d92c21e0645cd40))
* **ui:** add basic recordings page with pagination and navigation ([15da692](https://github.com/odest/katip/commit/15da6920cdd2b1d1b6d59e602b7a08b98aad9eff))


### Bug Fixes

* **deps:** upgrade next.js and react to resolve CVE-2025-55182 ([c73377a](https://github.com/odest/katip/commit/c73377a6d66ca3110096119df418dee7e367368d))

## [0.1.4](https://github.com/odest/katip/compare/v0.1.3...v0.1.4) (2025-12-02)


### Features

* **db:** add basic database stack with drizzle, sqlocal, sqlite, postgres ([e9fb499](https://github.com/odest/katip/commit/e9fb4999a5198cb1e863dfb9a2c0e3140e5262b1))
* **db:** add initial migration files and schema for SQLite and Postgres ([b2284f0](https://github.com/odest/katip/commit/b2284f069272e123ae13f6a21c8c35e58f56bb66))
* **db:** add SQL plugin, Drizzle proxy and multi-platform database setup ([30db4f0](https://github.com/odest/katip/commit/30db4f05e770e794efc6c81e4019fd1c77ff1a3a))
* **db:** add sqlocal support for local web db and configure migrations ([5a54b68](https://github.com/odest/katip/commit/5a54b6847fbc9cddfbd0acb31a2bcd5dc7030808))
* **db:** integrate persistence with database hooks ([63c26ed](https://github.com/odest/katip/commit/63c26ed77fde8ad37cb8fdabfb55c25b63fd3630))
* **utils:** add file utils and unify database ([3c74b80](https://github.com/odest/katip/commit/3c74b808900994cfb22530f9a1795a273a862e62))

## [0.1.3](https://github.com/odest/katip/compare/v0.1.2...v0.1.3) (2025-11-28)


### Features

* add copy to clipboard support to transcription views ([b14b7b7](https://github.com/odest/katip/commit/b14b7b77c62778591b8c07fd9d625b4dacbb3db8))
* add editing, export, and clipboard support with new toolbar and segment list ([0e53894](https://github.com/odest/katip/commit/0e5389438cf84cf2fb4874799c9b0a2ad69e07ce))
* add segment editing and export as file ([75c91d2](https://github.com/odest/katip/commit/75c91d21ba20f91b31475dee18eb0c267bf7b11c))
* **auth:** add GitHub OAuth provider for signin and signup ([d2858b3](https://github.com/odest/katip/commit/d2858b3a8c803e5ebebb682424343a68ddd291b1))
* **auth:** Add Supabase auth, UI components, and OTP flow ([a272ad1](https://github.com/odest/katip/commit/a272ad1b571e5eba20d083aad20c05da66e88a35))
* **auth:** implement comprehensive authentication system and user settings ([186b2ea](https://github.com/odest/katip/commit/186b2ea36ed9a7709fc0d35e327d35a86ddfbdc2))
* **gpu:** add Vulkan GPU acceleration support ([31a5e79](https://github.com/odest/katip/commit/31a5e799ce469ec3847d5dcf7048ab7b31221f53))
* **transcription:** add basic transcription logic and UI ([8e2f44d](https://github.com/odest/katip/commit/8e2f44d0d20b6030da0893523f2e8894f838a3cf))
* **transcription:** implement desktop and web transcription support ([c5a7099](https://github.com/odest/katip/commit/c5a70994aa84411b972aa8089c6ae766e7df8770))
* **ui:** add basic transcribe page, navigation and UI enhancements ([59f45e9](https://github.com/odest/katip/commit/59f45e9393de8690bf195d1aaee866a5e454c3d3))
* **ui:** add browser capabilities badge & hook, update i18n ([90b92d8](https://github.com/odest/katip/commit/90b92d8e7a1965403ea0ea2c1f212e02da8864a1))
* **ui:** add file upload component and toast wrapper ([071cfd9](https://github.com/odest/katip/commit/071cfd9a6b81a29c7fa9525e84bc3e925c9ee0df))
* **ui:** add local LLM summarization and action item extraction ([103f04c](https://github.com/odest/katip/commit/103f04cc10c3ca428776c6dfdf5ec60ee62a6c9f))
* **ui:** add local LLM summarization support ([ab48911](https://github.com/odest/katip/commit/ab489119734d2227717bd319671c2656ad67d15d))


### Code Refactoring

* remove unused pages and i18n messages ([9c2be6f](https://github.com/odest/katip/commit/9c2be6f903524f68ce8b63dad8172746c7ebcb11))
* rename audio/model stores, add Tauri fs scope and drop support ([4029b8f](https://github.com/odest/katip/commit/4029b8f503abdda3a622be202604d740ac40942a))

## [0.1.2](https://github.com/odest/katip/compare/v0.1.1...v0.1.2) (2025-10-20)


### Features

* **native:** add dialog and fs plugins and audio picker component ([d7be847](https://github.com/odest/katip/commit/d7be84753afbc22b560d98af9cc68bb5cc268fe5))
* **native:** add whisper transcribe support for native desktop ([6152560](https://github.com/odest/katip/commit/615256061e692c0aa86177b731d9f420af10323d))
* **web:** add whisper wasm transcribe support for web ([320e1a7](https://github.com/odest/katip/commit/320e1a7bd3bc0e5e85685bc102267c356f6d1fc5))

## [0.1.1](https://github.com/odest/katip/compare/v0.1.0...v0.1.1) (2025-10-17)


### Code Refactoring

* rename project to katip and update versions ([969d76a](https://github.com/odest/katip/commit/969d76a34d0d19214b0c8fe43dbbee44b4d1b14c))
