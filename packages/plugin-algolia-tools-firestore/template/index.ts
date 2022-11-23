import algoliaTask from './tasks/algolia'
import firebaseTask from './tasks/firebase'
import { Command } from 'commander'

export default function (commander: Command) {
  algoliaTask(commander)
  firebaseTask(commander)
}
