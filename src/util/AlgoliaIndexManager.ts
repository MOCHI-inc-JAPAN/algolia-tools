import { SearchClient } from 'algoliasearch'
import { Settings, ListIndicesResponse } from '@algolia/client-search'

export interface ReplicateSetting {
  indexName: string
  replicas: string[]
}

export interface AlgoliaIndexManagerInternal {
  client: SearchClient
  indexNamespace: string
}

export interface IndexArgument {
  indexName: string
  setting: Settings
}

export class AlgoliaIndexManager {
  public client: AlgoliaIndexManagerInternal['client']
  public indexNamespace: AlgoliaIndexManagerInternal['indexNamespace']

  public constructor(args: AlgoliaIndexManagerInternal) {
    this.client = args.client
    this.indexNamespace = args.indexNamespace || ''
  }

  public getIndexName<T extends string>(indexName: T): string {
    return `${this.indexNamespace}${indexName}`
  }

  public omitNameSpaceIndex(indexName: string): string {
    return indexName.replace(this.indexNamespace, '')
  }

  public sendIndex = async <T extends Record<string, unknown>>(
    indexName: string,
    data: T | T[]
  ): Promise<boolean> => {
    const index = this.client.initIndex(this.getIndexName(indexName))
    try {
      if (Array.isArray(data)) {
        await index.saveObjects(data)
      } else {
        await index.saveObject(data)
      }
      return true
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message)
      } else {
        console.error(e)
      }
      return false
    }
  }

  public deleteIndexData = async <T extends string>(
    indexName: string,
    ids: T | T[]
  ): Promise<boolean> => {
    const index = this.client.initIndex(this.getIndexName(indexName))
    try {
      if (Array.isArray(ids)) {
        await index.deleteObjects(ids)
      } else {
        await index.deleteObject(ids)
      }
      return true
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message)
      } else {
        console.error(e)
      }
      return false
    }
  }

  public deleteIndex = async (
    indexName: string | string[]
  ): Promise<boolean> => {
    try {
      const indices = Array.isArray(indexName)
        ? indexName.map((_name) =>
            this.client.initIndex(this.getIndexName(_name))
          )
        : [this.client.initIndex(this.getIndexName(indexName))]
      for await (const index of indices) {
        console.log(index.indexName)
        await index.delete()
      }
      return true
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message)
      } else {
        console.error(e)
      }
      return false
    }
  }

  public updateIndexSetting = async (
    indexSetting: IndexArgument | IndexArgument[]
  ): Promise<boolean> => {
    const _indexSettings = Array.isArray(indexSetting)
      ? indexSetting
      : [indexSetting]
    try {
      for await (const _indexSetting of _indexSettings) {
        const indexName = this.getIndexName(_indexSetting.indexName)
        console.log(`${indexName} start applying`)
        const index = this.client.initIndex(indexName)
        await index.setSettings(_indexSetting.setting)
        console.log(`${indexName} was applyied`)
      }
      return true
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message)
      } else {
        console.error(e)
      }
      return false
    }
  }

  public replicateIndex = async (
    replicateSetting: ReplicateSetting
  ): Promise<boolean> => {
    try {
      const result = await this.updateIndexSetting({
        indexName: replicateSetting.indexName,
        setting: {
          replicas: replicateSetting.replicas.map((indexName: string) =>
            this.getIndexName(indexName)
          ),
        },
      })
      return result
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message)
      } else {
        console.error(e)
      }
      return false
    }
  }

  public removeAllDataFromIndex = async (
    indexName: string
  ): Promise<boolean> => {
    try {
      if (Array.isArray(indexName)) {
        for (const _indexName of indexName) {
          const index = this.client.initIndex(this.getIndexName(_indexName))
          await index.clearObjects()
        }
      } else {
        const index = this.client.initIndex(this.getIndexName(indexName))
        await index.clearObjects()
      }
      return true
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message)
      } else {
        console.error(e)
      }
      return false
    }
  }

  public getIndexSetting = async (
    indexNames: string | string[],
    noPrefix?: boolean
  ): Promise<false | Settings[]> => {
    try {
      const result = []
      const _indexNames = Array.isArray(indexNames) ? indexNames : [indexNames]

      for (const _indexName of _indexNames) {
        const index = this.client.initIndex(
          noPrefix ? _indexName : this.getIndexName(_indexName)
        )
        const _result = await index.getSettings()
        result.push(_result)
      }
      return result
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message)
      } else {
        console.error(e)
      }
      return false
    }
  }

  public getIndexNames = async (): Promise<ListIndicesResponse | false> => {
    try {
      const result = await this.client.listIndices()
      return result
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message)
      } else {
        console.error(e)
      }
      return false
    }
  }
}
