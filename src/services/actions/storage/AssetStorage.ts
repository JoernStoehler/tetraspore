/**
 * Asset Storage Interface
 * 
 * Defines the contract for storing and retrieving generated assets.
 * Implementation can be local filesystem, S3, or other storage providers.
 */

import { AssetMetadata, StoredAsset } from '../executors/types';

export interface AssetStorage {
  /**
   * Store binary asset data with metadata tracking
   *
   * Why separate from JSON: Binary data requires different upload strategies
   * and content-type handling for efficient browser serving.
   */
  store(data: Buffer | Uint8Array, metadata: AssetMetadata): Promise<StoredAsset>;

  /**
   * Store JSON data with automatic serialization
   *
   * Why separate method: JSON needs validation and pretty-printing
   * for debugging, plus different caching strategies than binary assets.
   */
  storeJSON(data: object, metadata: AssetMetadata): Promise<StoredAsset>;

  /**
   * Generate public URL for browser access
   *
   * Why async: URL generation may require signed URLs or CDN cache warming
   * depending on storage implementation.
   */
  getUrl(id: string): Promise<string>;

  /**
   * Get the duration of an audio asset (if available)
   */
  getDuration(id: string): Promise<number | undefined>;

  /**
   * Verify asset availability before usage
   *
   * Why needed: Prevents broken references when assets are cleaned up
   * or when working with external storage that may have failures.
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