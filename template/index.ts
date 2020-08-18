import algoliaTask from './tasks/algolia'
import firebaseTask from './tasks/firebase'
import { CommanderStatic } from 'commander'
import { useFirebaseAccount } from './account/firebaseAccount'

export default function (commander: CommanderStatic) {
  algoliaTask(commander)
  if (useFirebaseAccount) {
    firebaseTask(commander)
  }
}
