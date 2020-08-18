import { CommanderStatic } from 'commander'
import algoliaModule from '../account/algoliaAccount'
import admin from '../account/firebaseAccount'
import FirebaseInvoke from '../../src/plugin/FirebaseInvoke'

const algoliaManager = algoliaModule.algoliaManager

const firebaseManager = new FirebaseInvoke({
  algoliaManager,
  admin,
})

export default function (commander: CommanderStatic) {
  commander
    .command('batchSendDataToIndex <indexName...> ')
    .action(async (indexName) => {
      try {
        await firebaseManager.batchSendDataToIndex({
          index: indexName,
          collection: admin.firestore().collection(indexName),
        })
      } catch (e) {
        process.exit()
      }
    })
  commander
    .command('resetBatchTime <indexName...> ')
    .action(async (indexName) => {
      try {
        await firebaseManager.resetBatchTime(indexName)
      } catch (e) {
        process.exit()
      }
    })
  commander
    .command('removeAllDataFromAndStorageIndex <indexName...> ')
    .action(async (indexName) => {
      try {
        await firebaseManager.removeAllDataFromIndex(indexName)
      } catch (e) {
        process.exit()
      }
    })
}
