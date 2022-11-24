import algoliaManager from '@mochi-inc-japan/algolia-tools'
import { FirestorePlugin } from '@mochi-inc-japan/plugin-algolia-tools-firestore'
import algoliaProjectModule from './indexManagers'
import algoliasearch from 'algoliasearch'

type Client = ReturnType<typeof algoliasearch>

const client: Client = '' as unknown as Client

const algoliaManagerExample = algoliaManager(
  {
    client,
    indexNamespace: '',
  },
  algoliaProjectModule,
  { plugins: [FirestorePlugin] }
)

algoliaManagerExample.firestorePlugin.batchSendDataToIndex
