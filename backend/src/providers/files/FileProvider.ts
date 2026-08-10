export interface FileUploadResult {
  providerFileId: string;
  providerUrl: string;
  provider: string;
  fileSize?: number;
  mimeType?: string;
}

export interface FileProvider {
  name: string;
  upload(fileBuffer: Buffer, filename: string, mimeType: string, meta: Record<string, any>): Promise<FileUploadResult>;
  getUrl(providerFileId: string): Promise<string>;
  delete(providerFileId: string): Promise<void>;
}
