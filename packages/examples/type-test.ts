import algoliaManager, { FirestorePlugin } from 'algolia-firebase-tools'
import algoliaProjectModule from './indexManagers'
import algoliasearch from 'algoliasearch'

type Client = ReturnType<typeof algoliasearch>

const client: Client = ('' as unknown) as Client

const algoliaManagerExample = algoliaManager(
  {
    client,
    indexNamespace: '',
  },
  algoliaProjectModule,
  { plugins: [FirestorePlugin] }
)

algoliaManagerExample.firestorePlugin.batchSendDataToIndex
