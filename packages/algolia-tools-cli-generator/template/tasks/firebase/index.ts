import algoliaModule from '../../account/algoliaAccount'
import { useFirebaseAccount } from '../../account/firebaseAccount'
import FirestorePlugin from '../../../src/plugin/FirestorePlugin'
import { createFirestoreCommanderPlugin } from '../../../src/plugin/generate-commands/firestore'
import { Command } from 'commander'

const algoliaIndexManager = algoliaModule.algoliaIndexManager

const firebaseManager = useFirebaseAccount
  ? new FirestorePlugin({
      algoliaIndexManager,
    })
  : undefined

export default (commander: Command) => {
  if (firebaseManager) {
    createFirestoreCommanderPlugin(firebaseManager)(commander)
  }
}
