# algolia-firebase-tools

Easy creator algolia index management utility functions with wrapped algolia client.

### Setup Example

Make algoliaIndexManager/userExample.ts (if you specify ./algoliaIndexManager as modulePath)
This class can arbitrarily implement how stored data exported to algolia.

```ts:algoliaIndexManager/userExample.ts
import { AlgoliaIndexManager, IndexInterface } from '@moch-inc-japan/algolia-tools'

type UserSchema = {
  id: string
  name: string
}
export default class UserIndexManager implements IndexInterface {
  private algoliaIndexManager: AlgoliaIndexManager
  public constructor(args: { algoliaIndexManager: AlgoliaIndexManager }) {
    this.algoliaIndexManager = args.algoliaIndexManager
  }

  public sendIndex = async (userId: string, user: UserSchema) => {
    const result = await this.algoliaIndexManager.sendIndex('users', user)
    if (result) {
      console.log(`users index has been updated: [userId:${user.id}]`)
      return true
    } else {
      console.error('users index update has been failed')
      return false
    }
  }

  public batchSendToIndex = async () => {
    const result = await this.algoliaIndexManager.sendIndex('users', [])
    return result
  }

  public deleteIndexData = async (userIds: string[]) => {
    const result = await this.algoliaIndexManager.deleteIndexData('users', userIds)
    if (result) {
      console.log(`user index has been deleted: [userIds:${userIds}]`)
      return true
    } else {
      console.error('user index delete has been failed')
      return false
    }
  }
}
```

And you make algoliaIndexManager/index.ts

```ts:algoliaIndexManager/index.ts
import users from './userExample'
export default {
  users // This exported as collectionName, so you should use named import specify to collection id
}
```

Your index modules can be used via algoliaModule in this library's api. We provide algoliaModule default exported.

```ts:example.ts
import algoliaModule from '@mochi-inc-japan/algolia-firebase-tools'
import indexManagers from './algoliaIndexManager'

const manager = algoliaModule(
  {
    client,
    indexNamespace,
  },
  indexManagers
)

manager.indices.users.batchSendIndex()

```

You can control algolia indices with same interface and having index namespace.

### AlgoliaProjectManager

AlgoliaProjectManager extend api using AlgoliaModule

```ts
import AlgoliaModule, {
  createAlgoliaCommanderPlugin,
} from '@mochi-inc-japan/algolia-firebase-tools'
import indexManagers from './algoliaIndexManager'
import commander from 'commander'

const algoliaModule = AlgoliaModule(
  {
    client,
    indexNamespace,
  },
  indexManagers,
  {
    plugin: [FirestorePlugin],
  }
)

const algoliaProjectManager = new AlgoliaProjectManager(algoliaModule)
```

AlgoliaManager can manage your indice.

- remove index data all
- update index setting
- store index setting json file to local storage from algolia platform
- restore index setting from local json file to algolia platform
- replicate index
- sync index data from storage

so on.

## Plugin Extension

AlgoliaModuleApi can be extended by two type plugins.

### AlogliaModule Plugin

It add extra DI instances to IndexManager.

### Commander Plugin

It add commands creator to commander.

See each packages readme file, in more detail.
