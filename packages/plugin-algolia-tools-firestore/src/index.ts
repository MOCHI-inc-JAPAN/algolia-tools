import { Command } from 'commander'
import {initialize} from './account/firebaseAccount'
import FirestorePlugin from './plugin/FirestorePlugin'
import { createFirestoreCommanderPlugin } from './plugin/FirestoreCommanderPlugin'
import {} from '@mochi-inc-japan/algolia-tools';

export { FirestorePlugin }

export function FirestoreCommanderPlugin(algoliaModule) {
  initialize()
  return (commander: Command) {
    if (firebaseManager) {
      createFirestoreCommanderPlugin(firebaseManager)(commander)
    }
  }
}
