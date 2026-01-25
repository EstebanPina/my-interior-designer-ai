import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { RekognitionClient, DetectLabelsCommand } from '@aws-sdk/client-rekognition';

// Initialize AWS clients
const s3Client = new S3Client({});
const rekognitionClient = new RekognitionClient({});
const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

type Event = {
  Records: Array<{
    s3: {
      bucket: { name: string };
      object: { key: string };
    };
  }>;
};

export const handler = async (event: Event): Promise<any> => {
  try {
    for (const record of event.Records) {
      const bucket = record.s3.bucket.name;
      const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

      // Get the uploaded image
      const getObjectCommand = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const response = await s3Client.send(getObjectCommand);
      const imageBuffer = await response.Body?.transformToByteArray();

      if (!imageBuffer) {
        throw new Error('Failed to read image');
      }

      // Analyze image with Rekognition
      const detectLabelsCommand = new DetectLabelsCommand({
        Image: {
          Bytes: new Uint8Array(imageBuffer),
        },
        MaxLabels: 10,
        MinConfidence: 70,
      });

      const rekognitionResponse = await rekognitionClient.send(detectLabelsCommand);
      const labels = rekognitionResponse.Labels?.map(label => ({
        name: label.Name,
        confidence: label.Confidence,
      })) || [];

      // Create thumbnail
      const thumbnailBuffer = await createThumbnail(imageBuffer);
      
      // Save thumbnail
      const thumbnailKey = key.replace('/uploads/', '/thumbnails/');
      const putThumbnailCommand = new PutObjectCommand({
        Bucket: bucket,
        Key: thumbnailKey,
        Body: thumbnailBuffer,
        ContentType: 'image/jpeg',
        Metadata: {
          originalKey: key,
          labels: JSON.stringify(labels),
          processedAt: new Date().toISOString(),
        },
      });

      await s3Client.send(putThumbnailCommand);

      // Update metadata on original image
      const putOriginalCommand = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: imageBuffer,
        ContentType: 'image/jpeg',
        Metadata: {
          ...response.Metadata,
          labels: JSON.stringify(labels),
          processed: 'true',
          processedAt: new Date().toISOString(),
        },
      });

      await s3Client.send(putOriginalCommand);

      console.log(`Processed image: ${key}`);
      console.log(`Detected labels:`, labels);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Images processed successfully' }),
    };

  } catch (error) {
    console.error('Image processing error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process images' }),
    };
  }
};

async function createThumbnail(imageBuffer: ArrayBuffer): Promise<Uint8Array> {
  // In a real implementation, you would use an image processing library
  // For now, we'll just return the original buffer as placeholder
  // TODO: Implement actual thumbnail creation with sharp or similar
  
  return new Uint8Array(imageBuffer);
}