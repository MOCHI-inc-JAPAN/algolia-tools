## @mochi-inc-japan/plugin-algolia-tools-firestore

Auto cli generator for general usage algolia from node.
This library mainly targets typescript but may be available as js module.

## Usage

Add algolia-tools.config.js in your project aloglia-tools-cli-generator.

```typescript
const Plugins = require('@mochi-inc-japan/plugin-algolia-tools-firestore')
module.exports = {
  plugins: [Plugins.FirestorePlugin], // or plugins: [[Plugins.FirestorePlugin, {optinos}]]
  commanderPlugins: [Plugins.FirestoreCommanderPlugin],
}
```

### Extension for Commander

If you use commader, you can extend it by defined commands in this library.

```ts
import AlgoliaModule from '@mochi-inc-japan/algolia-tools'
import { createAlgoliaCommanderPlugin } from '@mochi-inc-japan/algolia-cli-tools'
import { createAlgoliaCommanderPlugin } from '@mochi-inc-japan/plugin-algolia-tools-firestore'
import indexManagers from './algoliaIndexManager'
import commander from 'commander'

const algoliaModule = AlgoliaModule(
  {
    client,
    indexNamespace,
  },
  indexManagers,
  {
    plugin: [FirestorePlugin], // or plugins: [[FirestorePlugin, {optinos}]]
  }
)

const algoliaProjectManager = new AlgoliaProjectManager(algoliaModule)

// extended to commander commands
createAlgoliaCommanderPlugin(algoliaProjectManager)(commander)
createFirestoreCommanderPlugin(algoliaProjectManager.algoliaModule)(commander) // optional if you use firestore
```
