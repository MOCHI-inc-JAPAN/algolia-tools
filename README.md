## What is this

Auto cli generator for general usage algolia from node.
This library mainly targets typescript but may be available as js module.

## Ready to use

### You need reading env setting

```
ALGOLIA_ID: your algolia id
ALGOLIA_ADMIN_KEY: your algolia admin key
ALGOLIA_SEARCH_KEY: our algolia search key
FIREBASE_SERVICE_ACCOUNT_PATH (Optional): path of firebase service account
INDEX_NAMESPACE (Optional):
```

### package.json

package.json
```package.json
  "aftools" : {
    "modulePath": "algoliaIndexManager"
  }
```

module: your algolia index manager relative module path from package.json. this is object consistes of IndexManager Class Constructor. It explained later and see example cases.

out (Optional): builded relative cli path from package.json. Default is `${projectRoot}/bin`.

firebaseServiceAccountPath (Optional):  relative firebase-service json path from package.json. FIREBASE_SERVICE_ACCOUNT_PATH valiable is prior than this. Default is `${projectRoot}/bin`.

### Example Index ManagerModules


Make algoliaIndexManager/userExample.ts (if you specify algoliaIndexManager as modulePath)

```algoliaIndexManager/userExample.ts
import { AlgoliaIndexManager, IndexInterface } from 'algolia-firebase-tools'

type UserSchema = {
  id: string
  name: string
}
export default class UserIndexManager implements IndexInterface {
  private algoliaManager: AlgoliaIndexManager
  public constructor(args: { algoliaManager: AlgoliaIndexManager }) {
    this.algoliaManager = args.algoliaManager
  }

  public sendIndex = async (userId: string, user: UserSchema) => {
    const result = await this.algoliaManager.sendIndex('users', user)
    if (result) {
      console.log(`users index has been updated: [userId:${user.id}]`)
      return true
    } else {
      console.error('users index update has been failed')
      return false
    }
  }

  public batchSendToIndex = async () => {
    const result = await this.algoliaManager.sendIndex('users', [])
    return result
  }

  public deleteIndexData = async (userIds: string[]) => {
    const result = await this.algoliaManager.deleteIndexData('users', userIds)
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

```algoliaIndexManager/index.ts
import users from './userExample'
export default {
  users // This exported as collectionName, so you should use named import specify to collection id
}
```

## Usage


### cli init

```
aftools-build
```

### cli run

```
aftools <scriptId>
```

### builtin script

(WIP) see aftools help directory.


### Usage as Modules

Your module can be used backend. We probide algoliaFirebaseManager default exported. So you can use same logic introduced in cli.

For example.

```example.ts
import algoliaFirebaseManager form 'algolia-firebase-tools'

const manager = algoliaFirebaseManager(
  {
    admin,
    client,
    indexNamespace,
  },
  algoliaProjectModule
)


manager.indices.users.batchSendIndex()

```
so on.


## Feature Plan

* This library should be able to use not depended on firebase. This is why it was used to be used by our product, and  used firebase realtime database storage, but it doesn't need it only, so we plan to remove the dependeny to use algolia indexManager independently and provide this monorepo.
