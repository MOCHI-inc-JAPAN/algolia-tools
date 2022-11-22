import algoliaModule from '../../account/algoliaAccount'
import { useFirebaseAccount } from '../../account/firebaseAccount'
import FirebaseInvoke from '../../../src/plugin/FirebaseInvoke'
import { createFirestoreCommanderPlugin } from '../../../src/plugin/generate-commands/firestore'
import { Command } from 'commander'

const algoliaManager = algoliaModule.algoliaManager

const firebaseManager = useFirebaseAccount
  ? new FirebaseInvoke({
      algoliaManager,
    })
  : undefined

export default (commander: Command) => {
  if (firebaseManager) {
    createFirestoreCommanderPlugin(firebaseManager)(commander)
  }
}
