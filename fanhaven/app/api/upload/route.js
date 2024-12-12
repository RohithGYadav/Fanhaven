import multer from 'multer';
import { Readable } from 'stream';
import cloudinary from '@/lib/cloudinary';
import { NextResponse } from 'next/server';

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const config = {
  api: {
    bodyParser: false,
  },
};

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

function bufferToStream(buffer) {
  const readable = new Readable();
  readable._read = () => {}; 
  readable.push(buffer);
  readable.push(null);
  return readable;
}

export async function POST(req) {
  const res = new Response();

  try {
    await runMiddleware(req, res, upload.single('file')); // Ensure 'file' matches FormData

    if (!req.file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const uploadedResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'fanhaven-uploads',
          upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            reject(new Error('Cloudinary upload failed'));
          } else {
            resolve(result);
          }
        }
      );

      bufferToStream(req.file.buffer).pipe(uploadStream);
    });

    return NextResponse.json({ secure_url: uploadedResponse.secure_url });
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
