import type { IndexInterface, IndexConstructor } from './types'
import {
  AlgoliaIndexManager,
  AlgoliaIndexManagerInternal,
} from './util/AlgoliaIndexManager'
import FirebaseManager, { FirebaseInvoke } from './util/FirebaseInvoke'

export interface AlgoliaFirebaseManager {
  algoliaManager: AlgoliaIndexManager
  firebaseManager: FirebaseManager
  indices: {
    [collectionName: string]: IndexInterface
  }
}

export { IndexInterface, IndexConstructor, AlgoliaIndexManager }

export default (
  args: AlgoliaIndexManagerInternal & Omit<FirebaseInvoke, 'algoliaManager'>,
  indices: {
    [collectionName: string]: IndexConstructor
  }
): AlgoliaFirebaseManager => {
  const algoliaManager = new AlgoliaIndexManager(args)
  return {
    algoliaManager,
    firebaseManager: new FirebaseManager({
      admin: args.admin,
      algoliaManager,
    }),
    indices: Object.keys(indices).reduce((result, index) => {
      return {
        ...result,
        [index]: new indices[index]({
          algoliaManager: algoliaManager,
        }),
      }
    }, {}),
  }
}
