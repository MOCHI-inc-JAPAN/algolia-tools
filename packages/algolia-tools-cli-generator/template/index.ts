import algoliaTask from './tasks/algolia'
import { Command } from 'commander'

export default function (commander: Command) {
  algoliaTask(commander)
}
