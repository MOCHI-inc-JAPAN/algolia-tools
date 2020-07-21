#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { CommanderStatic } from 'commander'
// import { admin } from "../firebase/config";
import { Settings } from '@algolia/client-search'
import algoliaFirebaseManager, {
  ALGOLIA_ID,
  ALGOLIA_ADMIN_KEY,
  ALGOLIA_SEARCH_KEY,
  PROJECT_ID,
} from './account'

const algoliaManager = algoliaFirebaseManager.algoliaManager
const firebaseManager = algoliaFirebaseManager.firebaseManager

export default function (commander: CommanderStatic) {
  commander.command('seeAlgoliaAccount').action(async () => {
    console.log(ALGOLIA_ID)
    console.log(ALGOLIA_ADMIN_KEY)
    console.log(ALGOLIA_SEARCH_KEY)
    process.exit()
  })

  commander
    .command('seeAlgoliaIndexSetting <indices...>')
    .action(async (args) => {
      const results = await algoliaManager.getIndexSetting(args)
      console.log(JSON.stringify(results, null, 2))
      process.exit()
    })

  commander
    .command('backupAlgoliaIndexSetting <indices...>')
    .action(async (args) => {
      const results = await algoliaManager.getIndexSetting(args)
      if (results && Array.isArray(results)) {
        const promises = await Promise.all(
          results.map(
            async (setting, index) =>
              new Promise((resolve, reject) => {
                const _path = path.join(
                  process.cwd(),
                  'algolia',
                  'indices',
                  `${args[index]}.json`
                )
                fs.writeFile(_path, JSON.stringify(setting, null, 2), (err) => {
                  if (err) return reject(err.message)
                  console.log(`${args[index]}: are written to ${_path}`)
                  return resolve('success')
                })
              })
          )
        )
        console.log(promises)
      }
      process.exit()
    })

  commander.command('backupAlgoliaIndexSettingAll').action(async (args) => {
    const indices = await algoliaManager.getIndexNames()
    if (!indices) throw Error('indices have not been found')
    const inputs = indices.items
      .filter((v) => v.name.includes(`${PROJECT_ID}_`))
      .map((index) => index.name as string)
    const results = await algoliaManager.getIndexSetting(inputs, true)
    if (results && Array.isArray(results)) {
      const promises = await Promise.all(
        results.map(
          async (setting, index) =>
            new Promise((resolve, reject) => {
              const indexName = (inputs[index] as string).replace(
                `${PROJECT_ID}_`,
                ''
              )
              const _path = path.join(
                process.cwd(),
                'algolia',
                'indices',
                `${indexName}.json`
              )
              fs.writeFile(_path, JSON.stringify(setting, null, 2), (err) => {
                if (err) return reject(err.message)
                console.log(`${indexName}: are written to ${_path}`)
                return resolve('success')
              })
            })
        )
      )
      console.log(promises)
    }
    process.exit()
  })

  const settingParse = (data: any) => {
    const setting = JSON.parse(data)
    if (setting.replicas) {
      const replicas = setting.replicas.map((replica: string) => {
        return `${PROJECT_ID}${replica.slice(replica.indexOf('_'))}`
      })
      return {
        ...setting,
        replicas,
      }
    }
    return setting
  }

  commander
    .command('provisionAlgoliaIndex <indices...>')
    .action(async (args) => {
      const settings = await Promise.all<Settings>(
        args.map((v: string, _i: number) => {
          const _path = path.join(
            process.cwd(),
            'algolia',
            'indices',
            `${v}.json`
          )
          return new Promise((resolve, reject) => {
            fs.readFile(_path, 'utf8', (_test, data) => {
              resolve(settingParse(data))
            })
          })
        })
      )
      const results = await Promise.all(
        settings.map((setting, i) => {
          return new Promise((resolve, reject) => {
            resolve(
              algoliaManager.updateIndexSetting({
                indexName: args[i],
                setting,
              })
            )
          })
        })
      )
      if (results.some((v) => v === false))
        console.log('provision algolia index was failed.')
      process.exit()
    })

  commander.command('provisionAlgoliaIndexAll').action(async () => {
    const fileNames = fs.readdirSync(
      path.join(process.cwd(), 'algolia', 'indices')
    )
    const settings = await Promise.all(
      fileNames.map((fileName, i) => {
        const _path = path.join(process.cwd(), 'algolia', 'indices', fileName)
        return new Promise((resolve, reject) => {
          fs.readFile(_path, 'utf8', (test, data) => {
            resolve(settingParse(data))
          })
        })
      })
    )
    const results = await Promise.all(
      settings.map((setting, i) => {
        return new Promise((resolve, reject) => {
          resolve(
            algoliaManager.updateIndexSetting({
              indexName: fileNames[i].replace('.json', ''),
              setting: setting as Settings,
            })
          )
        })
      })
    )
    if (results.some((v) => v === false))
      console.log('provision algolia index was failed.')
    process.exit()
  })

  commander
    .command('updateAlgoliaIndexSetting <indices...>')
    .action(async (args) => {
      const promises = await Promise.all(
        args.map(async (fileName: string, index: number) => {
          return new Promise((resolve, reject) => {
            const _path = path.join(
              process.cwd(),
              'algolia',
              'indices',
              `${fileName}.json`
            )
            fs.readFile(_path, 'utf8', async (err, _setting) => {
              if (err) return reject(err.message)
              const setting: Settings = JSON.parse(_setting)
              const result = await algoliaManager.updateIndexSetting({
                indexName: args[index] as string,
                setting,
              })
              console.log(setting)
              if (result) {
                resolve('success')
              } else {
                reject('index uddate failed')
              }
            })
          })
        })
      )
      console.log(promises)
      process.exit()
    })

  commander
    .command('replicateIndex <indexName> <replicaNames...>')
    .action(async (indexName, replicas) => {
      const result = await algoliaManager.replicateIndex({
        indexName,
        replicas,
      })
      if (!result) console.log('replica replication was failed.')
      process.exit()
    })

  commander.command('deleteIndex <indexName...> ').action(async (indexName) => {
    const result = await algoliaManager.deleteIndex(indexName)
    if (!result) console.log('deleteIndex was failed.')
    process.exit()
  })

  commander
    .command('syncAlgoliaFromFirestore <indexName...> ')
    .action(async (indexName: string[]) => {
      const results = await Promise.all(
        indexName.map((_indexName) =>
          algoliaFirebaseManager.indices[_indexName].batchSendToIndex()
        )
      )
      if (results.some((v) => v === false))
        console.log('deleteIndex was failed.')
      process.exit()
    })

  commander
    .command('removeAllDataFromIndex <indexName...> ')
    .action(async (indexName) => {
      let results = await Promise.all(
        indexName.map((_indexName: string) =>
          algoliaManager.removeAllDataFromIndex(_indexName)
        )
      )
      if (results.some((v) => v === false))
        console.log('deleteIndex was failed.')
      results = await Promise.all(
        indexName.map((_indexName: string) =>
          firebaseManager.admin
            .database()
            .ref(`indexBatchExecuted/${_indexName}`)
            .remove()
        )
      )
      if (results.some((v) => v === false))
        console.log('deleteIndex was failed.')
      process.exit()
    })
}
