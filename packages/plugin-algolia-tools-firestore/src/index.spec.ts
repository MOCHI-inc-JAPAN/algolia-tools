import AlgoliaModule from '@mochi-inc-japan/algolia-tools'
import FirestorePlugin from './plugin/FirestorePlugin'
import indexManagers from '../fixtures/indexManagers'
import algoliaSearch from 'algoliasearch'

describe('plugin work', () => {
  it('passed algoliaIndexManager and args', async () => {
    const algoliaModule = AlgoliaModule(
      {
        client: algoliaSearch('', ''),
        indexNamespace: 'test',
      },
      indexManagers,
      {
        plugins: [FirestorePlugin],
      }
    )
    expect(algoliaModule.firestorePlugin.algoliaIndexManager).toBeTruthy()
  })
  it('passed algoliaIndexManager and args', async () => {
    const algoliaModule = AlgoliaModule(
      {
        client: algoliaSearch('', ''),
        indexNamespace: 'test',
      },
      indexManagers,
      {
        plugins: [[FirestorePlugin, { batchTimeKey: 'changeKey' }]],
      }
    )
    expect(algoliaModule.firestorePlugin.algoliaIndexManager).toBeTruthy()
    expect(algoliaModule.firestorePlugin.batchTimeKey).toEqual('changeKey')
  })
})
