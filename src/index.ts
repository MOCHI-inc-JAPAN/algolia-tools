import { IndexManager, IndexManagerConstructor } from './types'
import {
  AlgoliaIndexManager,
  AlgoliaIndexManagerInternal,
} from './util/AlgoliaIndexManager'
import FirebaseManager, { FirebaseInvoke } from './util/FirebaseInvoke'

export interface AlgoliaFirebaseManager {
  algoliaManager: AlgoliaIndexManager
  firebaseManager: FirebaseManager
  indices: {
    [collectionName: string]: IndexManager
  }
}

export default (
  args: AlgoliaIndexManagerInternal & Omit<FirebaseInvoke, 'algoliaManager'>,
  indices: {
    [collectionName: string]: IndexManagerConstructor
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
          algoliaManager,
        }),
      }
    }, {}),
  }
}
