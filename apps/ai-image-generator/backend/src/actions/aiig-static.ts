import { AppActionCallContext } from '@contentful/node-apps-toolkit';
import { AppActionCallResponse, Layouts, Upload } from '../types';
import { ImageEditResult } from './aiig-select-edit';

interface AppActionCallParameters {
  prompt: string;
}

export const handler = async (
  _payload: AppActionCallParameters,
  _context: AppActionCallContext
): Promise<AppActionCallResponse<ImageEditResult>> => {
  // Note: the contentful API type UploadSys is not compatible with the actual API data, so we have to coerce it
  // here with our fake static data
  const upload = {
    url: 'http://www.example.com',
    sys: {
      type: 'Upload',
      id: 'upload-1',
      space: {
        sys: {
          type: 'Link',
          linkType: 'Space',
          id: 'spaceid-1',
        },
      },
      expiresAt: '2015-05-18T11:29:46.809Z',
      createdAt: '2015-05-18T11:29:46.809Z',
      createdBy: {
        sys: {
          type: 'Link',
          linkType: 'User',
          id: '4FLrUHftHW3v2BLi9fzfjU',
        },
      },
    },
  } as unknown as Upload;

  const images = [
    {
      url: 'https://www.americanhumane.org/app/uploads/2021/12/Cat-8-1024x1024.png',
      imageType: 'png',
      upload,
      size: 1386522,
      dimensions: {
        width: 1024,
        height: 1024,
        ratio: 1,
        layout: 'square' as Layouts,
      },
    },
    {
      url: 'https://4kwallpapers.com/images/wallpapers/cat-kitten-pet-domestic-animals-cute-cat-portrait-fur-baby-1024x1024-3528.jpg',
      imageType: 'png',
      upload,
      size: 212992,
      dimensions: {
        width: 1024,
        height: 1024,
        ratio: 1,
        layout: 'square' as Layouts,
      },
    },
    {
      url: 'https://wallpaperaccess.com/full/2448381.jpg',
      imageType: 'png',
      upload,
      size: 2448381,
      dimensions: {
        width: 1024,
        height: 1024,
        ratio: 1,
        layout: 'square' as Layouts,
      },
    },
    {
      url: 'https://images.infoseemedia.com/wp-content/uploads/2022/02/Black-White-Cat-Image-1024x1024.jpg',
      imageType: 'png',
      upload,
      size: 189858,
      dimensions: {
        width: 1024,
        height: 1024,
        ratio: 1,
        layout: 'square' as Layouts,
      },
    },
  ];

  return {
    ok: true,
    data: {
      type: 'ImageEditResult',
      images,
    },
  };
};
