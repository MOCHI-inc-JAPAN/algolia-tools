import { Command } from 'commander'
import algoliaModule from '../../account/algoliaAccount'
import '../../account/firebaseAccount'
import FirebaseInvoke from '../../../src/plugin/FirebaseInvoke'

const algoliaManager = algoliaModule.algoliaManager

const firebaseManager = new FirebaseInvoke({
  algoliaManager,
})

export default function (commander: Command) {
  commander
    .command('batchSendDataToIndex <indexName...> ')
    .action(async (indexName: string[]) => {
      try {
        await Promise.all(
          indexName.map((_indexName) =>
            firebaseManager.batchSendDataToIndex({
              index: _indexName,
              collection: firebaseManager.firestore.collection(_indexName),
            })
          )
        )
      } catch (e) {
        console.error(e)
      } finally {
        process.exit()
      }
    })
  commander
    .command('resetBatchTime <indexName...> ')
    .action(async (indexName: string[]) => {
      try {
        await Promise.all(
          indexName.map((_indexName) =>
            firebaseManager.resetBatchTime(_indexName)
          )
        )
      } catch (e) {
        console.error(e)
      } finally {
        process.exit()
      }
    })
  commander
    .command('removeAllDataFromIndex <indexName...> ')
    .action(async (indexName: string[]) => {
      try {
        await firebaseManager.removeAllDataFromIndex(indexName)
      } catch (e) {
        console.error(e)
      } finally {
        process.exit()
      }
    })
}
