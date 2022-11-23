import { AlgoliaIndexManager } from './util/AlgoliaIndexManager'
export interface IndexInterface<T extends any = any> {
  deleteIndexData(id: string | string[]): Promise<boolean>
  sendIndex(id: string, data: T): Promise<boolean>
  batchSendToIndex(): Promise<boolean>
}

export interface IndexConstructor<Ex = unknown> {
  new (
    args: {
      algoliaManager: AlgoliaIndexManager
    } & Ex
  ): IndexInterface
}

export interface AlgoliaToolsModule {
  algoliaManager: AlgoliaIndexManager
  indices: {
    [collectionName: string]: IndexInterface
  }
  indexConfigDir?: string
}

export type AlgoliaProjectManagerInternal = {
  algoliaManager: AlgoliaToolsModule['algoliaManager']
  indices: AlgoliaToolsModule['indices']
}

export type ExPlugin<PluginId extends string, PluginType> = {
  id: PluginId
  new (a: any): PluginType
  prototype: PluginType
}
