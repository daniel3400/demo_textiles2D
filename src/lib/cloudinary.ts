// src/lib/cloudinary.ts
import { Cloudinary } from '@cloudinary/url-gen';

const cld = new Cloudinary({
  cloud: {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dsmht9avs' // Tu cloud name como fallback
  },
  url: {
    secure: true // Forzar HTTPS
  }
});

export default cld;
