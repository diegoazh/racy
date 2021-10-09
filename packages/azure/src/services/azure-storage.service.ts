import {
  BlobDeleteResponse,
  BlobSASPermissions,
  BlobServiceClient,
  generateBlobSASQueryParameters,
  SASProtocol,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';
import { Injectable } from '@shared/decorators';
import { IStorageConfig } from '@shared/interfaces/storage-config.interface';
import { ConfigService } from './config.service';

@Injectable()
export class AzureStorageService {
  private config: IStorageConfig;

  private sharedKeyCredential: StorageSharedKeyCredential;

  private blobServiceClient: BlobServiceClient;

  constructor(private configService: ConfigService) {
    this.config = this.configService.get<IStorageConfig>('storage');

    this.sharedKeyCredential = new StorageSharedKeyCredential(
      this.config.storageAccountName,
      this.config.storageAccountKey,
    );

    this.blobServiceClient = new BlobServiceClient(
      this.config.storageAccountURL,
      this.sharedKeyCredential,
    );
  }

  public async listBlobs(
    prefix: string,
    containerName = 'requirement-reports',
  ): Promise<string[]> {
    const containerClient =
      this.blobServiceClient.getContainerClient(containerName);

    const blobs = containerClient.listBlobsFlat({ prefix });

    const files = [];
    for await (const blob of blobs) {
      files.push(blob.name);
    }

    return files;
  }

  public async deleteBlob(
    fileName: string,
    containerName = 'requirement-reports',
  ): Promise<BlobDeleteResponse> {
    const containerClient =
      this.blobServiceClient.getContainerClient(containerName);

    return containerClient.deleteBlob(fileName, {});
  }

  public async getBlobSAS(
    fileName: string,
    permissions: string,
    containerName = 'requirement-reports',
    expires = 30,
  ): Promise<string> {
    const startDate = new Date();
    const expiryDate = new Date(startDate);
    expiryDate.setMinutes(startDate.getMinutes() + expires);
    startDate.setMinutes(startDate.getMinutes() - expires);

    const queryParams = generateBlobSASQueryParameters(
      {
        blobName: fileName,
        containerName,
        permissions: BlobSASPermissions.parse(permissions),
        protocol: SASProtocol.Https,
        startsOn: startDate,
        expiresOn: expiryDate,
        version: '2019-12-12', // TODO: this is hardcoded should be reviewed
      },
      this.sharedKeyCredential,
    );

    return `${
      this.config.storageAccountURL
    }/${containerName}/${fileName}?${queryParams.toString()}`;
  }
}
