import algoliaTask from './tasks/algolia'
import firebaseTask from './tasks/firebase'
import { Command } from 'commander'
import { useFirebaseAccount } from './account/firebaseAccount'

export default function (commander: Command) {
  algoliaTask(commander)
  if (useFirebaseAccount) {
    firebaseTask(commander)
  }
}
