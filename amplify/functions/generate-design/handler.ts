import { OpenAI } from 'openai';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Initialize S3
const s3Client = new S3Client({});
const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

type Event = {
  body: string;
  requestContext: {
    authorizer: {
      claims: {
        sub: string;
        'cognito:groups': string[];
        'custom:subscription': string;
        'custom:designsCount': string;
      };
    };
  };
};

type HandlerResponse = {
  statusCode: number;
  headers: { [key: string]: string };
  body: string;
};

export const handler = async (event: Event): Promise<HandlerResponse> => {
  try {
    const { image, style, prompt } = JSON.parse(event.body);
    const { sub: userId, 'cognito:groups': groups, 'custom:subscription': subscription } = event.requestContext.authorizer.claims;

    // Check subscription limits
    if (subscription === 'free') {
      // Check if user has exceeded monthly limit
      const currentCount = parseInt(event.requestContext.authorizer.claims['custom:designsCount'] || '0');
      if (currentCount >= 3) {
        return {
          statusCode: 403,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            error: 'Monthly design limit exceeded. Upgrade to premium for unlimited designs.' 
          })
        };
      }
    }

    // Download image from S3
    const imageKey = image.replace(`https://${BUCKET_NAME}.s3.amazonaws.com/`, '');
    const getObjectCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: imageKey
    });

    const imageObject = await s3Client.send(getObjectCommand);
    const imageBuffer = await imageObject.Body?.transformToByteArray();
    
    if (!imageBuffer) {
      throw new Error('Failed to download image');
    }

    // Convert to base64 for OpenAI
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    const imageDataUrl = `data:image/jpeg;base64,${imageBase64}`;

    // Generate design with OpenAI
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "url",
    });

    const generatedImageUrl = imageResponse.data[0]?.url;
    if (!generatedImageUrl) {
      throw new Error('Failed to generate image');
    }

    // Download generated image
    const response = await fetch(generatedImageUrl);
    const generatedImageBuffer = await response.arrayBuffer();

    // Upload generated image to S3
    const generatedImageKey = `designs/${userId}/${Date.now()}_generated.jpg`;
    const putObjectCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: generatedImageKey,
      Body: new Uint8Array(generatedImageBuffer),
      ContentType: 'image/jpeg',
      Metadata: {
        userId,
        style,
        generatedAt: new Date().toISOString()
      }
    });

    await s3Client.send(putObjectCommand);

    // Generate recommendations with GPT-4
    const recommendationsResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Eres un experto en diseño interior y recomendaciones de productos. Analiza diseños y sugiere productos específicos con enlaces de Amazon."
        },
        {
          role: "user",
          content: `Basado en el diseño de ${style} que hemos generado, recomienda 5-8 productos específicos de Amazon que complementarían este diseño. Formatea la respuesta como JSON con la siguiente estructura:
{
  "recommendations": [
    {
      "name": "Nombre del producto",
      "description": "Breve descripción",
      "category": "categoría",
      "priceRange": "rango de precio",
      "amazonUrl": "url de búsqueda de Amazon"
    }
  ]
}`
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const recommendations = JSON.parse(
      recommendationsResponse.choices[0]?.message?.content || '{"recommendations": []}'
    );

    // Update user's design count (this would typically be done in a separate function)
    // TODO: Call updateDesignCount function

    const result = {
      success: true,
      generatedImage: `https://${BUCKET_NAME}.s3.amazonaws.com/${generatedImageKey}`,
      originalImage: image,
      recommendations: recommendations.recommendations,
      style: style,
      userId: userId
    };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('Design generation error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Failed to generate design',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};