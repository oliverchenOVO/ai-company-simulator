# Compensation behavior compatibility

Old application0.1.0 / save envelope schema1 / simulation1. New application0.1.1 / save envelope schema1 / simulation2 for new companies. Existing world.meta.simulationVersion selects unchanged v1 behavior on restore and replay; no migration or silent expectation rewrite. Continuing an imported old game intentionally retains old compensation including its known exploit. Recruitment UI labels legacy behavior. Export may carry current appVersion while retaining simulation1; app version is not the replay selector.

Simulation constructor third parameter explicitly selects behavior for tooling/tests. Default is2. Both engines share scheduler, RNG streams and systems; only recruitment/compensation behavior legitimately changed. Meta selector is included in existing hashed world. V1 config/command shapes remain unchanged; adding config defaults for version would have changed old hashes, so behavior selector lives in the existing meta field.

Original tests/fixtures/golden.json and real phase1-0.1.0.save.json stay byte-for-byte unchanged. Golden tests explicitly run original scenarios under1 with all assertions retained. New tests/fixtures/golden-v2.json intentionally records rejected then accepted offers and years1/3/5, with its own generator; original generator must explicitly select1. New tests retain the exact original exported hash, validate/load/replay and separately verify v2 accepted/rejected/cut command histories. Unknown simulation versions fail schema validation. V1 hashes must never be regenerated to accommodate new behavior.

Future equation changes require another explicit supported behavior version or a clearly documented opted-in migration. Do not infer behavior from appVersion. A schema change concerns structural decoding, not economic semantics. No automatic upgrade from v1 to2 is provided because that would change historical outcomes and should be a separate product decision.

## Exact historical save hash

Original0.1.0export final SHA-256: `682ebb2bb014ce8d1cb963c067fed35969375e43583864debdf94b017f68dbb1`. The retained fixture validates/restores/replays to this exact hash; no expected value regeneration.

## Version-specific golden outputs

V1 passive original fixture; V2 rejected then accepted hiring fixture (different explicit histories). These are regression expectations, not a same-command causal comparison.

|Version|Seed|Day|SHA-256|
|---|---|---:|---|
|1|golden-001|365|`32b938ecfcedcb0ade245919644aee8f71f5638321797afd192db3e0a8b275f6`|
|1|golden-001|1096|`1ea68eaed461af3da572df7ed23b0c1a0f97f3f9bd9ed2acd230d1b399b2e356`|
|1|golden-001|1826|`6f3eb86e6f67f5ab9954ee6ae9918592bf7e53e3244e721ea18525a30e411e49`|
|1|golden-002|365|`c59f484a31468af5315257470e30afc7c809f8a1a15621fa255e2a7977e2002c`|
|1|golden-002|1096|`f1fe1c3a2fae898b50cb8f5b6453585f6a9a0e5c3fd2cf2eadb5a3d5d54ac1cc`|
|1|golden-002|1826|`12559914a79cdc6358a2c137a225ee85f323e1a96ef7edd674f07f3d21b731f1`|
|1|golden-003|365|`4c09e42ae7e6d9d3ede2187d38e614b8d6a20469436273bf28c4061200caec46`|
|1|golden-003|1096|`f3cd1ddfba9d1dd3101a2737a1242e0a8da58c23d080de6d0425522197adc356`|
|1|golden-003|1826|`b3159149be88e42d8bbd23ab3d690f8c64fda53363bfc8f3f4f28c559a960ae7`|
|2|golden-001|365|`46aee753b9d63bc592546cac89331a17732f22887db0b70854cd23000e6b045c`|
|2|golden-001|1096|`5d023b71ed0bf468f140c5199128f0af562b6b9a5b742c0c81616af55d19831f`|
|2|golden-001|1826|`02b1a7b7041b790e41c820bcddc35c1cf993ed6b929239bd20ab9d338b69dbe4`|
|2|golden-002|365|`15710c789a78e678861a960338ad06a1b4ce6791f26971e8b8af49344f268c4b`|
|2|golden-002|1096|`c2466d0d0d1d4bb38f0ce2cb7a094c2852cef84f09a61f594d5eda8e8f0c72f7`|
|2|golden-002|1826|`405c04c04d24931dd864d823edfab56bc557077159d2787a786b565167dcd508`|
|2|golden-003|365|`79c9ce8a1d6c9e4c30a3ebea92f4241ed4ad46835e42d7ad45e71da44d92a8e9`|
|2|golden-003|1096|`0e0578aeb19cad5d779125c7ac7d4d4da22caf1ee57bb593ca6bd26fa09e4d94`|
|2|golden-003|1826|`eab833d466c9dd22c339132178b32e731b93e1aeae7060460eae9d2c070ea12e`|
