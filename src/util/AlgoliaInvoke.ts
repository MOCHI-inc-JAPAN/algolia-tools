import { Settings } from '@algolia/client-search'
import { AlgoliaToolsModule } from '../types'
import * as path from 'path'
import * as fs from 'fs'

export type AlgoliaInvokeInternal = {
  algoliaManager: AlgoliaToolsModule['algoliaManager']
  indices: AlgoliaToolsModule['indices']
}

export default class AlgoliaInvokeClass {
  public constructor(args: AlgoliaToolsModule) {
    this.algoliaManager = args.algoliaManager
    this.indices = args.indices
  }
  public algoliaManager: AlgoliaInvokeInternal['algoliaManager']
  public indices: AlgoliaInvokeInternal['indices']

  private settingParse(data: string) {
    const setting = JSON.parse(data)

    const replicas = setting.replicas
      ? setting.replicas.map((replica: string) => {
          return { replicas: this.algoliaManager.getIndexName(replica) }
        })
      : undefined

    const primary = setting.primary
      ? { primary: this.algoliaManager.getIndexName(setting.primary) }
      : undefined

    return {
      ...setting,
      ...replicas,
      ...primary,
    }
  }

  public async seeAlgoliaIndexSetting(args: string[]) {
    const results = await this.algoliaManager.getIndexSetting(args)
    console.log(JSON.stringify(results, null, 2))
  }

  public async backupAlgoliaIndexSetting(args: string[]) {
    const results = await this.algoliaManager.getIndexSetting(args)
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
              const params = {
                ...setting,
                ...this.omitNamespaceFromReplicasConfig(setting),
                ...this.omitNamespaceFromPrimaryConfig(setting),
              }
              fs.writeFile(_path, JSON.stringify(params, null, 2), (err) => {
                if (err) return reject(err.message)
                console.log(`${args[index]}: are written to ${_path}`)
                return resolve('success')
              })
            })
        )
      ).catch(console.error)

      console.log(promises)
    }
  }

  public async provisionAlgoliaIndex(args: string[]) {
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
            resolve(this.settingParse(data))
          })
        })
      })
    )
    const results = await Promise.all(
      settings.map((setting, i) => {
        return new Promise((resolve, reject) => {
          resolve(
            this.algoliaManager.updateIndexSetting({
              indexName: args[i],
              setting,
            })
          )
        })
      })
    ).catch(console.error)
    if (!results || results.some((v) => v === false))
      console.log('provision algolia index was failed.')
  }

  // NOTE: インデックスの適用順序を変更する
  private applySortValue(value: any) {
    if ('replicas' in value) return 2
    if ('primary' in value) return 3
    return 1
  }

  public async provisionAlgoliaIndexAll() {
    const fileNames = fs.readdirSync(
      path.join(process.cwd(), 'algolia', 'indices')
    )
    const settings = await Promise.all(
      fileNames.map((fileName, i) => {
        const _path = path.join(process.cwd(), 'algolia', 'indices', fileName)
        return new Promise((resolve, reject) => {
          fs.readFile(_path, 'utf8', (test, data) => {
            resolve(this.settingParse(data))
          })
        })
      })
    )
    const _settings = settings.sort((a, b) => {
      return this.applySortValue(a) - this.applySortValue(b)
    })
    const results = await Promise.all(
      _settings.map((setting, i) => {
        return new Promise((resolve, reject) => {
          resolve(
            this.algoliaManager.updateIndexSetting({
              indexName: fileNames[i].replace('.json', ''),
              setting: setting as Settings,
            })
          )
        })
      })
    ).catch(console.error)
    if (!results || results.some((v) => v === false))
      console.log('provision algolia index was failed.')
  }

  public async updateAlgoliaIndexSetting(args: string[]) {
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
            const result = await this.algoliaManager.updateIndexSetting({
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
  }

  public async replicateIndex(indexName: string, replicas: string[]) {
    const result = await this.algoliaManager.replicateIndex({
      indexName,
      replicas,
    })
    if (!result) console.log('replica replication was failed.')
  }

  public async deleteIndex(indexName: string[]) {
    const result = await this.algoliaManager.deleteIndex(indexName)
    if (!result) console.log('deleteIndex was failed.')
  }

  public async syncAlgoliaFromStorage(indexName: string[]) {
    const results = await Promise.all(
      indexName.map((_indexName) => this.indices[_indexName].batchSendToIndex())
    )
    if (results.some((v) => v === false)) console.log('deleteIndex was failed.')
  }

  private omitNamespaceFromReplicasConfig(setting: any) {
    if (setting.replicas)
      return {
        replicas: setting.replicas.map((replica: string) =>
          this.algoliaManager.omitNameSpaceIndex(replica)
        ),
      }
    return undefined
  }

  private omitNamespaceFromPrimaryConfig(setting: any) {
    if (setting.primary)
      return {
        primary: this.algoliaManager.omitNameSpaceIndex(setting.primary),
      }
    return undefined
  }

  public async backupAlgoliaIndexSettingAll() {
    const indices = await this.algoliaManager.getIndexNames()
    if (!indices) throw Error('indices have not been found')
    const inputs = indices.items
      .filter((v) => v.name.includes(`${this.algoliaManager.indexNamespace}`))
      .map((index) => index.name as string)
    const results = await this.algoliaManager.getIndexSetting(inputs, true)
    if (results && Array.isArray(results)) {
      const promises = await Promise.all(
        results.map(
          async (setting, index) =>
            new Promise((resolve, reject) => {
              const indexName = this.algoliaManager.omitNameSpaceIndex(
                inputs[index] as string
              )
              const _path = path.join(
                process.cwd(),
                'algolia',
                'indices',
                `${indexName}.json`
              )
              const params = {
                ...setting,
                ...this.omitNamespaceFromReplicasConfig(setting),
                ...this.omitNamespaceFromPrimaryConfig(setting),
              }

              fs.writeFile(_path, JSON.stringify(params, null, 2), (err) => {
                if (err) return reject(err.message)
                console.log(`${indexName}: are written to ${_path}`)
                return resolve('success')
              })
            })
        )
      )
      console.log(promises)
    }
  }
}
