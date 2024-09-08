import { SettingsResponse as Settings } from '@algolia/client-search'
import { AlgoliaToolsModule } from '../types'
import * as path from 'path'
import * as fs from 'fs'

export default class AlgoliaProjectManager<
  ExModule extends AlgoliaToolsModule = AlgoliaToolsModule
> {
  public constructor(
    args: ExModule,
    option?: {
      indexConfigDir?: string
    }
  ) {
    this.algoliaModule = args
    this.indices = args.indices
    this.indexConfigDir = option?.indexConfigDir
      ? path.resolve(option.indexConfigDir)
      : path.join(process.cwd(), 'algolia', 'indices')
  }
  public algoliaModule: ExModule
  private indices: AlgoliaToolsModule['indices']
  private indexConfigDir: string

  private settingParse(data: string) {
    const setting = JSON.parse(data)

    const replicas = setting.replicas
      ? {
          replicas: setting.replicas.map((replica: string) => {
            return this.algoliaModule.algoliaIndexManager.getIndexName(replica)
          }),
        }
      : undefined

    const primary = setting.primary
      ? {
          primary: this.algoliaModule.algoliaIndexManager.getIndexName(
            setting.primary
          ),
        }
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
    const results =
      await this.algoliaModule.algoliaIndexManager.getIndexSetting(args)
    console.log(JSON.stringify(results, null, 2))
  }

  public async backupAlgoliaIndexSetting(args: string[]): Promise<void> {
    const results =
      await this.algoliaModule.algoliaIndexManager.getIndexSetting(args)
    if (results && Array.isArray(results)) {
      const promises = await Promise.all(
        results.map(async (setting, index) => {
          const _path = this.indexJsonFilePath(`${args[index]}.json`)
          const params: Settings = {
            ...setting,
            ...this.omitNamespaceFromReplicasConfig(setting),
            ...this.omitNamespaceFromPrimaryConfig(setting),
          }
          return fs.promises
            .writeFile(_path, JSON.stringify(params, null, 2))
            .then(() => {
              console.log(`${args[index]}: are written to ${_path}`)
              return 'success'
            })
            .catch(console.error)
        })
      ).catch(console.error)

      console.log(promises)
    }
  }

  public async provisionAlgoliaIndex(args: string[]): Promise<void> {
    const settings = await Promise.all<Settings>(
      args.map(async (v: string, _i: number) => {
        const _path = this.indexJsonFilePath(`${v}.json`)
        const data = await fs.promises.readFile(_path, 'utf8')
        return this.settingParse(data)
      })
    )
    const results = await Promise.all(
      settings.map((setting, i) => {
        return this.algoliaModule.algoliaIndexManager.updateIndexSetting({
          indexName: args[i],
          setting,
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

  // NOTE: 削除インデックスの適用順序を変更する
  private deleteSortValue(value: any) {
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
        return {
          indexName: fileName.replace('.json', ''),
          setting: this.settingParse(data),
        }
      })
    )
    const _settings = settings.sort((a, b) => {
      return this.applySortValue(a.setting) - this.applySortValue(b.setting)
    })
    const result = await this.algoliaModule.algoliaIndexManager
      .updateIndexSetting(_settings)
      .catch(console.error)
    if (!result) console.log('provision algolia index was failed.')
  }

  public async updateAlgoliaIndexSetting(args: string[]): Promise<void> {
    const promises = await Promise.all(
      args.map(async (fileName: string, index: number) => {
        const _path = this.indexJsonFilePath(`${fileName}.json`)
        const _setting = await fs.promises.readFile(_path, 'utf8')
        const setting: Settings = JSON.parse(_setting)
        console.log(setting)
        return this.algoliaModule.algoliaIndexManager.updateIndexSetting({
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
    const result = await this.algoliaModule.algoliaIndexManager.replicateIndex({
      indexName,
      replicas,
    })
    if (!result) console.log('replica replication was failed.')
  }

  public async deleteIndex(indexName: string[]): Promise<void> {
    const result = await this.algoliaModule.algoliaIndexManager.deleteIndex(
      indexName
    )
    if (!result) console.log('deleteIndex was failed.')
  }

  public async deleteIndexAll(): Promise<void> {
    const fileNames = fs.readdirSync(this.indexConfigDir)
    const settings = await Promise.all(
      fileNames.map(async (fileName, i) => {
        const _path = path.join(this.indexConfigDir, fileName)
        const data = await fs.promises.readFile(_path, 'utf8')
        return {
          indexName: fileName.replace('.json', ''),
          setting: this.settingParse(data),
        }
      })
    )
    const indexNames = settings
      .sort((a, b) => {
        return this.deleteSortValue(a.setting) - this.deleteSortValue(b.setting)
      })
      .map((r) => r.indexName)
    const result = await this.algoliaModule.algoliaIndexManager.deleteIndex(
      indexNames
    )
    if (!result) console.log('deleteIndex was failed.')
  }

  public async listIndexNames(options?: {
    omitNameSpace?: boolean
  }): Promise<string[]> {
    const indices = await this.algoliaModule.algoliaIndexManager.getIndexNames()
    if (!indices) throw Error('indices have not been found')

    const records = indices.items
      .filter((v: { name: string }) =>
        v.name.match(
          new RegExp(
            `^${this.algoliaModule.algoliaIndexManager.indexNamespace}`
          )
        )
      )
      .map((index: { name: string }) => index.name as string)

    if (options?.omitNameSpace) {
      return records.map((indexName: string) => {
        return indexName.replace(
          new RegExp(
            `^${this.algoliaModule.algoliaIndexManager.indexNamespace}`
          ),
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
    if (results.some((v) => v === false))
      console.log('syncAlgoliaFromStorage was failed.')
  }

  private omitNamespaceFromReplicasConfig(
    setting: any
  ): { replicas: any } | undefined {
    if (setting.replicas)
      return {
        replicas: setting.replicas.map((replica: string) =>
          this.algoliaModule.algoliaIndexManager.omitNameSpaceIndex(replica)
        ),
      }
    return undefined
  }

  private omitNamespaceFromPrimaryConfig(
    setting: any
  ): { primary: string } | undefined {
    if (setting.primary)
      return {
        primary: this.algoliaModule.algoliaIndexManager.omitNameSpaceIndex(
          setting.primary
        ),
      }
    return undefined
  }

  public async backupAlgoliaIndexSettingAll(): Promise<void> {
    const inputs = await this.listIndexNames()
    const results =
      await this.algoliaModule.algoliaIndexManager.getIndexSetting(inputs, true)
    if (results && Array.isArray(results)) {
      const promises = results.map((setting, index) => {
        const indexName =
          this.algoliaModule.algoliaIndexManager.omitNameSpaceIndex(
            inputs[index]
          )
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
