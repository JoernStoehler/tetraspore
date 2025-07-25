/**
 * Asset Storage Interface
 * 
 * Defines the contract for storing and retrieving generated assets.
 * Implementation can be local filesystem, S3, or other storage providers.
 */

import { AssetMetadata, StoredAsset } from '../executors/types';

export interface AssetStorage {
  /**
   * Store binary asset data (images, audio)
   */
  store(data: Buffer | Uint8Array, metadata: AssetMetadata): Promise<StoredAsset>;

  /**
   * Store JSON data (cutscene definitions)
   */
  storeJSON(data: object, metadata: AssetMetadata): Promise<StoredAsset>;

  /**
   * Get the public URL for an asset
   */
  getUrl(id: string): Promise<string>;

  /**
   * Get the duration of an audio asset (if available)
   */
  getDuration(id: string): Promise<number | undefined>;

  /**
   * Check if an asset exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Delete an asset (optional)
   */
  delete?(id: string): Promise<void>;

  /**
   * List all assets (optional, for debugging)
   */
  list?(): Promise<StoredAsset[]>;
}