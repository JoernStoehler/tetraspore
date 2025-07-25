/**
 * Local Asset Storage Implementation
 * 
 * Stores assets in the local filesystem under public/assets/
 * for development and testing purposes.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { AssetMetadata, StoredAsset, StorageError } from '../executors/types';
import { AssetStorage } from './AssetStorage';

export class LocalAssetStorage implements AssetStorage {
  private readonly baseDir: string;
  private readonly baseUrl: string;
  private readonly metadataExtensions = new Set(['json']);

  constructor(
    baseDir: string = 'public/assets',
    baseUrl: string = '/assets'
  ) {
    this.baseDir = baseDir;
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  /**
   * Initialize storage directory
   */
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
      console.log(`Asset storage initialized at: ${this.baseDir}`);
    } catch (error) {
      throw new StorageError(
        `Failed to initialize storage directory: ${this.baseDir}`,
        'initialize',
        error
      );
    }
  }

  /**
   * Store binary asset data
   */
  async store(data: Buffer | Uint8Array, metadata: AssetMetadata): Promise<StoredAsset> {
    await this.initialize();

    try {
      const extension = this.getFileExtension(metadata);
      const filename = `${metadata.id}.${extension}`;
      const filepath = path.join(this.baseDir, filename);

      // Convert Uint8Array to Buffer if needed
      const buffer = data instanceof Buffer ? data : Buffer.from(data);

      // Write file
      await fs.writeFile(filepath, buffer);

      // Store metadata
      await this.storeMetadata(metadata);

      const storedAsset: StoredAsset = {
        id: metadata.id,
        url: `${this.baseUrl}/${filename}`,
        metadata
      };

      console.log(`Stored asset: ${filename} (${buffer.length} bytes)`);
      return storedAsset;

    } catch (error) {
      throw new StorageError(
        `Failed to store asset ${metadata.id}`,
        'store',
        error
      );
    }
  }

  /**
   * Store JSON data
   */
  async storeJSON(data: object, metadata: AssetMetadata): Promise<StoredAsset> {
    await this.initialize();

    try {
      const filename = `${metadata.id}.json`;
      const filepath = path.join(this.baseDir, filename);

      // Write JSON file
      await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');

      // Store metadata
      await this.storeMetadata(metadata);

      const storedAsset: StoredAsset = {
        id: metadata.id,
        url: `${this.baseUrl}/${filename}`,
        metadata
      };

      console.log(`Stored JSON asset: ${filename}`);
      return storedAsset;

    } catch (error) {
      throw new StorageError(
        `Failed to store JSON asset ${metadata.id}`,
        'storeJSON',
        error
      );
    }
  }

  /**
   * Get the public URL for an asset
   */
  async getUrl(id: string): Promise<string> {
    if (!(await this.exists(id))) {
      throw new StorageError(
        `Asset not found: ${id}`,
        'getUrl'
      );
    }

    // Find the file with the correct extension
    const files = await this.listFiles();
    const file = files.find(f => f.startsWith(`${id}.`));
    
    if (!file) {
      throw new StorageError(
        `Asset file not found: ${id}`,
        'getUrl'
      );
    }

    return `${this.baseUrl}/${file}`;
  }

  /**
   * Get the duration of an audio asset
   */
  async getDuration(id: string): Promise<number | undefined> {
    try {
      const metadata = await this.getMetadata(id);
      return metadata?.duration;
    } catch (error) {
      console.warn(`Failed to get duration for asset ${id}:`, error);
      return undefined;
    }
  }

  /**
   * Check if an asset exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const files = await this.listFiles();
      return files.some(file => file.startsWith(`${id}.`));
    } catch (error) {
      console.warn(`Failed to check existence of asset ${id}:`, error);
      return false;
    }
  }

  /**
   * Delete an asset and its metadata
   */
  async delete(id: string): Promise<void> {
    try {
      const files = await this.listFiles();
      const assetFiles = files.filter(file => file.startsWith(`${id}.`));

      for (const file of assetFiles) {
        const filepath = path.join(this.baseDir, file);
        await fs.unlink(filepath);
      }

      // Delete metadata
      await this.deleteMetadata(id);

      console.log(`Deleted asset: ${id} (${assetFiles.length} files)`);

    } catch (error) {
      throw new StorageError(
        `Failed to delete asset ${id}`,
        'delete',
        error
      );
    }
  }

  /**
   * List all stored assets
   */
  async list(): Promise<StoredAsset[]> {
    try {
      await this.initialize();
      const files = await this.listFiles();
      const assets: StoredAsset[] = [];

      // Group files by ID
      const filesByid = new Map<string, string[]>();
      for (const file of files) {
        const [id] = file.split('.');
        if (!filesByid.has(id)) {
          filesByid.set(id, []);
        }
        filesByid.get(id)!.push(file);
      }

      // Create asset entries for non-metadata files
      for (const [id, idFiles] of filesByid) {
        const assetFile = idFiles.find(f => !this.metadataExtensions.has(path.extname(f).slice(1)));
        if (assetFile) {
          const metadata = await this.getMetadata(id);
          if (metadata) {
            assets.push({
              id,
              url: `${this.baseUrl}/${assetFile}`,
              metadata
            });
          }
        }
      }

      return assets;

    } catch (error) {
      throw new StorageError(
        'Failed to list assets',
        'list',
        error
      );
    }
  }

  /**
   * Store metadata as a separate JSON file
   */
  private async storeMetadata(metadata: AssetMetadata): Promise<void> {
    const metadataFile = path.join(this.baseDir, `${metadata.id}.meta.json`);
    const metadataWithTimestamp = {
      ...metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await fs.writeFile(
      metadataFile, 
      JSON.stringify(metadataWithTimestamp, null, 2), 
      'utf-8'
    );
  }

  /**
   * Load metadata from file
   */
  private async getMetadata(id: string): Promise<AssetMetadata | null> {
    try {
      const metadataFile = path.join(this.baseDir, `${id}.meta.json`);
      const content = await fs.readFile(metadataFile, 'utf-8');
      return JSON.parse(content) as AssetMetadata;
    } catch {
      return null;
    }
  }

  /**
   * Delete metadata file
   */
  private async deleteMetadata(id: string): Promise<void> {
    try {
      const metadataFile = path.join(this.baseDir, `${id}.meta.json`);
      await fs.unlink(metadataFile);
    } catch {
      // Ignore if metadata file doesn't exist
    }
  }

  /**
   * List all files in storage directory
   */
  private async listFiles(): Promise<string[]> {
    try {
      await this.initialize();
      return await fs.readdir(this.baseDir);
    } catch {
      return [];
    }
  }

  /**
   * Get file extension from metadata
   */
  private getFileExtension(metadata: AssetMetadata): string {
    if (metadata.format) {
      return metadata.format;
    }

    // Default extensions by type
    const defaultExtensions: Record<string, string> = {
      image: 'png',
      audio: 'mp3',
      cutscene: 'json'
    };

    return defaultExtensions[metadata.type] || 'bin';
  }

  /**
   * Get storage statistics (for debugging)
   */
  async getStats(): Promise<{
    totalAssets: number;
    totalSize: number;
    byType: Record<string, number>;
  }> {
    try {
      const assets = await this.list();
      let totalSize = 0;
      const byType: Record<string, number> = {};

      for (const asset of assets) {
        // Count by type
        byType[asset.metadata.type] = (byType[asset.metadata.type] || 0) + 1;

        // Calculate size (approximate)
        try {
          const filepath = path.join(this.baseDir, path.basename(asset.url));
          const stats = await fs.stat(filepath);
          totalSize += stats.size;
        } catch {
          // Ignore files that can't be stat'd
        }
      }

      return {
        totalAssets: assets.length,
        totalSize,
        byType
      };

    } catch {
      return {
        totalAssets: 0,
        totalSize: 0,
        byType: {}
      };
    }
  }
}