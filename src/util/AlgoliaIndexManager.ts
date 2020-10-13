import { SearchClient } from 'algoliasearch'
import { Settings } from '@algolia/client-search'

interface ReplicateSetting {
  indexName: string
  replicas: string[]
}

export interface AlgoliaIndexManagerInternal {
  client: SearchClient
  indexNamespace: string
}

interface IndexArgument {
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

  public sendIndex = async <T extends Record<string, unknown>>(
    indexName: string,
    data: T | T[]
  ) => {
    const index = this.client.initIndex(`${this.indexNamespace}${indexName}`)
    try {
      if (Array.isArray(data)) {
        await index.saveObjects(data)
      } else {
        await index.saveObject(data)
      }
      return true
    } catch (e) {
      console.error(e.message)
      return false
    }
  }

  public deleteIndexData = async <T extends string>(
    indexName: string,
    ids: T | T[]
  ) => {
    const index = this.client.initIndex(`${this.indexNamespace}${indexName}`)
    try {
      if (Array.isArray(ids)) {
        await index.deleteObjects(ids)
      } else {
        await index.deleteObject(ids)
      }
      return true
    } catch (e) {
      console.error(e.message)
      return false
    }
  }

  public deleteIndex = async (indexName: string | string[]) => {
    try {
      const index = this.client.initIndex(`${this.indexNamespace}${indexName}`)
      if (Array.isArray(indexName)) {
        const _ = await Promise.all(
          indexName.map((_indexName) => index.delete())
        )
      } else {
        const _ = await index.delete()
      }
      return true
    } catch (e) {
      console.error(e.message)
      return false
    }
  }

  public updateIndexSetting = async (
    indexSetting: IndexArgument | IndexArgument[]
  ) => {
    try {
      if (Array.isArray(indexSetting)) {
        for (const _indexSetting of indexSetting) {
          const index = this.client.initIndex(
            `${this.indexNamespace}${_indexSetting.indexName}`
          )
          await index.setSettings(_indexSetting.setting)
        }
      } else {
        const index = this.client.initIndex(
          `${this.indexNamespace}${indexSetting.indexName}`
        )
        await index.setSettings(indexSetting.setting)
      }
      return true
    } catch (e) {
      console.error(e.message)
      return false
    }
  }

  public replicateIndex = async (replicateSetting: ReplicateSetting) => {
    try {
      const result = await this.updateIndexSetting({
        indexName: replicateSetting.indexName,
        setting: {
          replicas: replicateSetting.replicas.map(
            (indexName) =>
              `${this.indexNamespace}${replicateSetting.indexName}_${indexName}`
          ),
        },
      })
      return result
    } catch (e) {
      console.error(e.message)
      return false
    }
  }

  public removeAllDataFromIndex = async (indexName: string) => {
    try {
      if (Array.isArray(indexName)) {
        for (const _indexName of indexName) {
          const index = this.client.initIndex(
            `${this.indexNamespace}${_indexName}`
          )
          await index.clearObjects()
        }
      } else {
        const index = this.client.initIndex(
          `${this.indexNamespace}${indexName}`
        )
        await index.clearObjects()
      }
      return true
    } catch (e) {
      console.error(e.message)
      return false
    }
  }

  public getIndexSetting = async (
    indexNames: string | string[],
    noPrefix?: boolean
  ) => {
    try {
      const result = []
      if (Array.isArray(indexNames)) {
        for (const _indexName of indexNames) {
          const index = this.client.initIndex(
            noPrefix ? _indexName : `${this.indexNamespace}${_indexName}`
          )
          const _result = await index.getSettings()
          result.push(_result)
        }
      } else {
        const index = this.client.initIndex(
          noPrefix ? indexNames : `${this.indexNamespace}${indexNames}`
        )
        const _result = await index.getSettings()
        result.push(_result)
      }
      return result
    } catch (e) {
      console.error(e.message)
      return false
    }
  }

  public getIndexNames = async () => {
    try {
      const result = await this.client.listIndices()
      return result
    } catch (e) {
      console.error(e.message)
      return false
    }
  }
}
