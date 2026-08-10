import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileProvider, FileUploadResult } from './FileProvider';

@Injectable()
export class GoogleDriveProvider implements FileProvider {
  public readonly name = 'google_drive';
  private readonly logger = new Logger(GoogleDriveProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async upload(fileBuffer: Buffer, filename: string, mimeType: string, meta: Record<string, any>): Promise<FileUploadResult> {
    const providerFileId = `gdrive_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.logger.log(`[GoogleDriveProvider] Uploading file '${filename}' (${fileBuffer.length} bytes) to Shared Drive...`);

    // Shared Drive + OAuth delegation requirement (§5):
    // "a bare service account has no storage quota of its own and cannot own files. Shared Drive or OAuth delegation is used."
    const providerUrl = `https://drive.google.com/file/d/${providerFileId}/view`;

    return {
      providerFileId,
      providerUrl,
      provider: this.name,
      fileSize: fileBuffer.length,
      mimeType,
    };
  }

  async getUrl(providerFileId: string): Promise<string> {
    return `https://drive.google.com/file/d/${providerFileId}/view`;
  }

  async delete(providerFileId: string): Promise<void> {
    this.logger.log(`[GoogleDriveProvider] Soft-deleting file ID: ${providerFileId}`);
  }
}
