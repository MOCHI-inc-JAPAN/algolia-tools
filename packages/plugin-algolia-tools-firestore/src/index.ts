import { Command } from 'commander'
import { initializeAccount } from './account/firebaseAccount'
import FirestorePlugin from './plugin/FirestorePlugin'
import { createFirestoreCommanderPlugin } from './plugin/FirestoreCommanderPlugin'
import { AlgoliaToolsModule } from '@mochi-inc-japan/algolia-tools'

export { FirestorePlugin }

export { createFirestoreCommanderPlugin }

export function FirestoreCommanderPlugin(
  algoliaModule: AlgoliaToolsModule<{
    [key in Extract<typeof FirestorePlugin['id'], string>]?: FirestorePlugin
  }>
) {
  return (commander: Command) => {
    if (algoliaModule.firestorePlugin) {
      createFirestoreCommanderPlugin(algoliaModule.firestorePlugin)(commander)
    } else {
      console.warn('FirestorePlugin is not set in Algolia module')
    }
  }
}
