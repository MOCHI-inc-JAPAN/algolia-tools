## What is this

Auto cli generator for general usage algolia from node.
This library mainly targets typescript but may be available as js module.

## Ready to use

### You need reading env setting

```
ALGOLIA_ID: your algolia id
ALGOLIA_ADMIN_KEY: your algolia admin key
ALGOLIA_SEARCH_KEY: our algolia search key
FIREBASE_SERVICE_ACCOUNT_PATH (Optional): path of firebase service account, if you don't specify it, cli surpress firebase batch.
INDEX_NAMESPACE (Optional): prefix for algolia index, this is used to set different environments with one algolia account.
```

### package.json

package.json
```package.json
  "aftools" : {
    "modulePath": "algoliaIndexManager",
    "out": "dist",
    "dFiles": ["./internalAmbientFiles", "index.d.ts"],
    "envFile": ".env.some"
  }
```

modulePath: your algolia index manager relative module path from package.json. this is object consistes of IndexManager Class Constructor. It explained later and see example cases.

out (Optional): builded relative cli path from package.json. Default is `${projectRoot}/bin`.
types (Optional): project internal types. .

firebaseServiceAccountPath (Optional):  relative firebase-service json path from package.json. FIREBASE_SERVICE_ACCOUNT_PATH valiable is prior than this. Default is `${projectRoot}/bin`.

dFiles: string[] (Optional): For including ambient definition files through build, sometimes you need them using global type in your index modules. You can specify directory and .d.ts file path.

envFile (Optional): your env file specified, default is `.env`. If not specified, machine variables is used .

### Example Index ManagerModules


Make algoliaIndexManager/userExample.ts (if you specify ./algoliaIndexManager as modulePath)

```algoliaIndexManager/userExample.ts
import { AlgoliaIndexManager, IndexInterface } from '@moch-inc-japan/algolia-firebase-tools'

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


### cli init or update indexModules

```
aftools-build
```

This is typescript tsc wrapper so you can use tsc --option if your source code including ambient file and json Module like

```shell
aftools-build --typeRoots ${DFILE_PATH} --resolveJsonModule
```

and you can exec build command

```shell
aftools-build --verbose
```

### cli run

```
aftools <scriptId>
```

### builtin script

see aftools help.

```
npx aftools
```

### Usage as Modules

Your module can be used backend. We probide algoliaModule default exported. So you can use same logic introduced in cli.

For example.

```example.ts
import algoliaModule form 'algolia-firebase-tools'

const manager = algoliaModule(
  {
    client,
    indexNamespace,
  },
  algoliaProjectModule
)


manager.indices.users.batchSendIndex()

```
so on.


## **WARNING**

This library cli may include your secret files bundled code. So you should not include bundle task files in git repository your aftools-build code.
