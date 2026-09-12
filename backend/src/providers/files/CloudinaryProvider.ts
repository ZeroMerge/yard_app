import { Injectable, Logger } from '@nestjs/common';
import { FileProvider, FileUploadResult } from './FileProvider';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudinaryProvider implements FileProvider {
  name = 'cloudinary';
  private readonly logger = new Logger(CloudinaryProvider.name);

  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async upload(
    fileBuffer: Buffer,
    filename: string,
    mimeType: string,
    meta: Record<string, any>
  ): Promise<FileUploadResult> {
    this.logger.log(`Uploading file ${filename} to Cloudinary`);
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'yard',
          resource_type: 'auto',
          context: meta,
        },
        (error, result) => {
          if (error) {
            this.logger.error('Cloudinary upload failed', error);
            return reject(error);
          }
          if (!result) {
            return reject(new Error('No result returned from Cloudinary'));
          }
          resolve({
            providerFileId: result.public_id,
            providerUrl: result.secure_url,
            provider: this.name,
            fileSize: result.bytes,
            mimeType: result.resource_type,
          });
        }
      );
      uploadStream.end(fileBuffer);
    });
  }

  async getUrl(providerFileId: string): Promise<string> {
    return cloudinary.url(providerFileId, { secure: true });
  }

  async delete(providerFileId: string): Promise<void> {
    this.logger.log(`Deleting file ${providerFileId} from Cloudinary`);
    await cloudinary.uploader.destroy(providerFileId);
  }
}
