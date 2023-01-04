import { AlgoliaIndexManager } from './util/AlgoliaIndexManager'

export interface IndexInterface<T = any> {
  deleteIndexData(id: string | string[]): Promise<boolean>
  sendIndex(id: string, data: T): Promise<boolean>
  batchSendToIndex(): Promise<boolean>
}

export interface IndexConstructor<Ex = unknown> {
  new (
    args: {
      algoliaIndexManager: AlgoliaIndexManager
    } & Ex
  ): IndexInterface
}

export type AlgoliaToolsModule<Ex = unknown> = {
  algoliaIndexManager: AlgoliaIndexManager
  indices: {
    [collectionName: string]: IndexInterface
  }
} & Ex

export type ExPlugin<PluginId extends string, PluginType> = {
  id: PluginId
  new (a: {
    [key: string]: any
    algoliaIndexManager: AlgoliaIndexManager
  }): PluginType
  prototype: PluginType
}

export type ExPluginInput<PluginId extends string, PluginType, Config = any> =
  | ExPlugin<PluginId, PluginType>
  | [ExPlugin<PluginId, PluginType>, Config]
