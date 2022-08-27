import { Settings } from '@algolia/client-search'
import { AlgoliaInvokeInternal, AlgoliaToolsModule } from '../types'
import * as path from 'path'
import * as fs from 'fs'

export default class AlgoliaInvokeClass {
  public constructor(args: AlgoliaToolsModule) {
    this.algoliaManager = args.algoliaManager
    this.indices = args.indices
    this.indexConfigDir = args.indexConfigDir
      ? path.resolve(args.indexConfigDir)
      : path.join(process.cwd(), 'algolia', 'indices')
  }
  public algoliaManager: AlgoliaInvokeInternal['algoliaManager']
  public indices: AlgoliaInvokeInternal['indices']
  private indexConfigDir: string

  private settingParse(data: string) {
    const setting = JSON.parse(data)

    const replicas = setting.replicas
      ? {
          replicas: setting.replicas.map((replica: string) => {
            return this.algoliaManager.getIndexName(replica)
          }),
        }
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

  private indexJsonFilePath(file: string) {
    return path.join(this.indexConfigDir, file)
  }

  public async seeAlgoliaIndexSetting(args: string[]): Promise<void> {
    const results = await this.algoliaManager.getIndexSetting(args)
    console.log(JSON.stringify(results, null, 2))
  }

  public async backupAlgoliaIndexSetting(args: string[]): Promise<void> {
    const results = await this.algoliaManager.getIndexSetting(args)
    if (results && Array.isArray(results)) {
      const promises = await Promise.all(
        results.map(
          async (setting, index) =>
            new Promise((resolve, reject) => {
              const _path = this.indexJsonFilePath(`${args[index]}.json`)
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

  public async provisionAlgoliaIndex(args: string[]): Promise<void> {
    const settings = await Promise.all<Settings>(
      args.map((v: string, _i: number) => {
        const _path = this.indexJsonFilePath(`${v}.json`)
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

  public async provisionAlgoliaIndexAll(): Promise<void> {
    const fileNames = fs.readdirSync(this.indexConfigDir)
    const settings = await Promise.all(
      fileNames.map(async (fileName, i) => {
        const _path = path.join(this.indexConfigDir, fileName)
        const data = await fs.promises.readFile(_path, 'utf8')
        return this.settingParse(data)
      })
    )
    const _settings = settings.sort((a, b) => {
      return this.applySortValue(a) - this.applySortValue(b)
    })
    const results = await Promise.all(
      _settings.map((setting: Settings, i) => {
        const indexName = fileNames[i].replace('.json', '')
        return this.algoliaManager.updateIndexSetting({
          indexName: indexName,
          setting: setting as Settings,
        })
      })
    ).catch(console.error)
    if (!results || results.some((v) => v === false))
      console.log('provision algolia index was failed.')
  }

  public async updateAlgoliaIndexSetting(args: string[]): Promise<void> {
    const promises = await Promise.all(
      args.map(async (fileName: string, index: number) => {
        const _path = this.indexJsonFilePath(`${fileName}.json`)
        const _setting = await fs.promises.readFile(_path, 'utf8')
        const setting: Settings = JSON.parse(_setting)
        console.log(setting)
        return this.algoliaManager.updateIndexSetting({
          indexName: args[index] as string,
          setting,
        })
      })
    )
    console.log(promises)
  }

  public async replicateIndex(
    indexName: string,
    replicas: string[]
  ): Promise<void> {
    const result = await this.algoliaManager.replicateIndex({
      indexName,
      replicas,
    })
    if (!result) console.log('replica replication was failed.')
  }

  public async deleteIndex(indexName: string[]): Promise<void> {
    const result = await this.algoliaManager.deleteIndex(indexName)
    if (!result) console.log('deleteIndex was failed.')
  }

  public async listIndexNames(options?: {
    omitNameSpace?: boolean
  }): Promise<string[]> {
    const indices = await this.algoliaManager.getIndexNames()
    if (!indices) throw Error('indices have not been found')

    const records = indices.items
      .filter((v) =>
        v.name.match(new RegExp(`^${this.algoliaManager.indexNamespace}`))
      )
      .map((index) => index.name as string)

    if (options?.omitNameSpace) {
      return records.map((indexName) => {
        return indexName.replace(
          new RegExp(`^${this.algoliaManager.indexNamespace}`),
          ''
        )
      })
    }
    return records
  }

  public async syncAlgoliaFromStorage(indexName: string[]): Promise<void> {
    const results = await Promise.all(
      indexName.map((_indexName) => this.indices[_indexName].batchSendToIndex())
    )
    if (results.some((v) => v === false)) console.log('deleteIndex was failed.')
  }

  private omitNamespaceFromReplicasConfig(
    setting: any
  ): { replicas: any } | undefined {
    if (setting.replicas)
      return {
        replicas: setting.replicas.map((replica: string) =>
          this.algoliaManager.omitNameSpaceIndex(replica)
        ),
      }
    return undefined
  }

  private omitNamespaceFromPrimaryConfig(
    setting: any
  ): { primary: string } | undefined {
    if (setting.primary)
      return {
        primary: this.algoliaManager.omitNameSpaceIndex(setting.primary),
      }
    return undefined
  }

  public async backupAlgoliaIndexSettingAll(): Promise<void> {
    const inputs = await this.listIndexNames()
    const results = await this.algoliaManager.getIndexSetting(inputs, true)
    if (results && Array.isArray(results)) {
      const promises = results.map((setting, index) => {
        const indexName = this.algoliaManager.omitNameSpaceIndex(inputs[index])
        const _path = this.indexJsonFilePath(`${indexName}.json`)
        const params = {
          ...setting,
          ...this.omitNamespaceFromReplicasConfig(setting),
          ...this.omitNamespaceFromPrimaryConfig(setting),
        }
        return fs.promises
          .writeFile(_path, JSON.stringify(params, null, 2))
          .then(() => {
            return {
              path: _path,
              params,
            }
          })
      })
      await Promise.all(promises)
        .then((v) => {
          v.forEach((r) => {
            console.log(`${r.path} is created`)
          })
        })
        .catch(console.error)
    }
  }
}
