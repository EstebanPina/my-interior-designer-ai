import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import OpenAI from 'openai';
import { DESIGN_STYLES } from '@/const/DesignStyles';

// Initialize MongoDB
const MONGODB_URI = process.env.MONGODB_URI!;
const mongoClient = new MongoClient(MONGODB_URI);

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// POST - Generar diseño con imagen y estilo
export async function POST(request: NextRequest) {
  let mongoConnection: any;
  
  try {
    // Parsear FormData (para imagen) y JSON
    let imageBuffer: Buffer | null = null;
    let style: string | null = null;
    
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('multipart/form-data')) {
      // Procesar FormData con imagen
      const formData = await request.formData();
      const image = formData.get('image') as File;
      style = formData.get('style') as string;
      
      if (image) {
        const bytes = await image.arrayBuffer();
        imageBuffer = Buffer.from(bytes);
      }
    } else {
      // Procesar JSON (chat sin imagen)
      const body = await request.json();
      style = body.style;
    }

    if (!style) {
      return NextResponse.json(
        { error: 'Style is required' },
        { status: 400 }
      );
    }

    // Conectar a MongoDB
    mongoConnection = await mongoConnection.connect();
    const db = mongoConnection.db('MID-AI');

    // Buscar el estilo en MongoDB o usar la constante
    let designStyle: any = null;
    const designStylesCollection = db.collection('designstyles');
    
    try {
      designStyle = await designStylesCollection.findOne({ 
        slug: style.toLowerCase(), 
        isActive: true 
      });
    } catch (dbError) {
      console.log('MongoDB styles collection not found, using constant');
    }

    // Si no está en MongoDB, usar la constante
    if (!designStyle) {
      const allStyles: any = DESIGN_STYLES;
      for (const [categoryKey, categoryData] of Object.entries(allStyles)) {
        for (const [styleKey, styleData] of Object.entries(categoryData)) {
          if (styleKey === style && typeof styleData === 'object' && styleData.name) {
            designStyle = {
              name: styleData.name,
              description: styleData.description,
              category: (categoryData as any).name || categoryKey
            };
            break;
          }
        }
        if (designStyle) break;
      }
    }

    if (!designStyle) {
      return NextResponse.json(
        { error: 'Style not found' },
        { status: 404 }
      );
    }

    let result: any = {
      success: true,
      style: designStyle.name,
      styleSlug: style,
      description: designStyle.description
    };

    // Si hay imagen, procesarla con DALL-E 3
    if (imageBuffer) {
      console.log('🎨 Processing image with style:', designStyle.name);
      
      // Optimizar el prompt según el estilo
      const prompt = `Transform this room interior with ${designStyle.name.toLowerCase()} style: ${designStyle.description.toLowerCase()}. 
Requirements:
1. Keep room structure (walls, windows, doors)
2. Apply ${designStyle.name.toLowerCase()} decor and furniture
3. Ensure realistic, livable design
4. Generate high-quality room image
5. Maintain natural lighting and perspective

After image, provide 5-8 Amazon products for this ${designStyle.name.toLowerCase()} style:
- Product name
- Brief description  
- Category (furniture, lighting, decor)
- Price range
- Amazon search URL`;

      // Generar imagen con OpenAI
      console.log('🤖 Calling DALL-E 3...');
      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "url",
      });

      if (!imageResponse.data || imageResponse.data.length === 0) {
        throw new Error('Failed to generate image');
      }

      const imageData = imageResponse.data[0];
      if (!imageData || !imageData.url) {
        throw new Error('No image URL returned');
      }

      const imageUrl = imageData.url;
      console.log('✅ Image generated:', imageUrl);

      // Descargar imagen generada
      const imageDownloadResponse = await fetch(imageUrl);
      if (!imageDownloadResponse.ok) {
        throw new Error('Failed to download generated image');
      }
      
      const generatedImageBuffer = await imageDownloadResponse.arrayBuffer();
      const generatedImageBase64 = Buffer.from(generatedImageBuffer).toString('base64');
      const generatedImageDataUrl = `image/png;base64,${generatedImageBase64}`;

      // Generar recomendaciones con GPT-4
      console.log('🛒 Generating recommendations...');
      const recommendationsResponse = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Eres un experto en diseño interior y recomendaciones de productos de Amazon. Genera recomendaciones en formato JSON."
          },
          {
            role: "user",
            content: `Generate 5-8 Amazon product recommendations for ${designStyle.name.toLowerCase()} interior design.
  
Format as JSON:
{
  "recommendations": [
    {
      "name": "product name",
      "description": "brief description",
      "category": "furniture|lighting|decor|textiles",
      "priceRange": "$X-$Y",
      "amazonUrl": "search url"
    }
  ]
}`
          }
        ],
        max_tokens: 800,
        temperature: 0.7,
      });

      const messageContent = recommendationsResponse.choices[0]?.message?.content || '{"recommendations": []}';
      
      let recommendations;
      try {
        recommendations = JSON.parse(messageContent);
      } catch (parseError) {
        console.error('Error parsing recommendations:', parseError);
        const jsonMatch = messageContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          recommendations = JSON.parse(jsonMatch[0]);
        } else {
          recommendations = { recommendations: [] };
        }
      }

      console.log('🛍️ Recommendations generated');

      // Guardar diseño en MongoDB
      const designsCollection = db.collection('designs');
      const designDocument = {
        style: style,
        styleName: designStyle.name,
        originalImage: imageBuffer ? `data:image/jpeg;base64,${imageBuffer.toString('base64')}` : null,
        generatedImage: generatedImageDataUrl,
        recommendations: recommendations.recommendations || [],
        category: designStyle.category || 'unknown',
        createdAt: new Date(),
        status: 'completed'
      };
      
      await designsCollection.insertOne(designDocument);

      result = {
        ...result,
        generatedImage: generatedImageDataUrl,
        recommendations: recommendations.recommendations || [],
        originalImage: `data:image/jpeg;base64,${imageBuffer.toString('base64')}`,
        processedAt: new Date()
      };

      await mongoConnection.close();
      return NextResponse.json(result);

    } else {
      // Si no hay imagen, solo devolver información del estilo
      console.log('📋 Style info request:', designStyle.name);
      await mongoConnection.close();
      return NextResponse.json(result);
    }

    } catch (error) {
      console.error('❌ Design API error:', error);
      
      try {
        if (mongoConnection) {
          await mongoConnection.close();
        }
      } catch (closeError) {
        console.error('Error closing connection:', closeError);
      }
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Error processing design request',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

// GET - Obtener estilos disponibles
export async function GET(request: NextRequest) {
  let mongoConnection: any;
  
  try {
    // Conectar a MongoDB
    mongoConnection = await mongoConnection.connect();
    const db = mongoConnection.db('MID-AI');

    // Intentar obtener estilos desde MongoDB
    let styles: any = {};
    let categories: any = {};
    
    try {
      const designStylesCollection = db.collection('designstyles');
      const dbStyles = await designStylesCollection.find({ isActive: true }).toArray();
      
      if (dbStyles.length > 0) {
        // Usar estilos desde MongoDB
        dbStyles.forEach((style: any) => {
          styles[style.slug] = style.description;
          
          if (!categories[style.category]) {
            categories[style.category] = [];
          }
          categories[style.category].push({
            slug: style.slug,
            name: style.name,
            description: style.description
          });
        });
      } else {
        console.log('No styles in MongoDB, using constants');
        throw new Error('No styles found');
      }
    } catch (dbError) {
      console.log('Using design styles from constants');
      
      // Usar estilos desde el archivo constante
      const allStyles: Record<string, any> = DESIGN_STYLES;
      
      Object.entries(allStyles).forEach(([categoryKey, categoryData]) => {
        const categoryObj = categoryData as any;
        const categoryName = categoryObj.name || categoryKey;
        
        if (!categories[categoryName]) {
          categories[categoryName] = [];
        }
        
        Object.entries(categoryObj).forEach(([styleKey, styleData]) => {
          if (styleKey !== 'name' && typeof styleData === 'object' && styleData && (styleData as any).name) {
            const styleObj = styleData as any;
            styles[styleKey] = styleObj.description;
            categories[categoryName].push({
              slug: styleKey,
              name: styleObj.name,
              description: styleObj.description
            });
          }
        });
      });
    }

    if (mongoConnection) {
      await mongoConnection.close();
    }

    return NextResponse.json({
      success: true,
      styles: Object.keys(styles),
      descriptions: styles,
      categories: categories
    });

  } catch (error) {
    console.error('❌ Styles fetch error:', error);
    
    return NextResponse.json(
      { 
        error: 'Error fetching styles',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}