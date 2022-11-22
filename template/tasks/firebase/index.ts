import algoliaModule from '../../account/algoliaAccount'
import '../../account/firebaseAccount'
import FirebaseInvoke from '../../../src/plugin/FirebaseInvoke'
import { createFirestoreCommanderPlugin } from '../../../src/generate-commands/firestore'

const algoliaManager = algoliaModule.algoliaManager

const firebaseManager = new FirebaseInvoke({
  algoliaManager,
})

export default createFirestoreCommanderPlugin(firebaseManager)
