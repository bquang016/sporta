import React from 'react';
import { ImageUpload } from '../form/ImageUpload';
import type { ImageUploadProps } from '../form/ImageUpload';

export interface ImageUploaderProps extends ImageUploadProps {}

export const ImageUploader: React.FC<ImageUploaderProps> = (props) => {
  return <ImageUpload {...props} />;
};

ImageUploader.displayName = 'ImageUploader';
export default ImageUploader;
