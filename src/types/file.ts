export interface FileMetadata {
    id: string;
    originalName: string;
    originalSize: number;
    compressedSize: number;
    originalPath: string;
    compressedPath: string;
    mimeType: string;
    createdAt: string;
}

export interface FileDB {
    files: FileMetadata[];
} 