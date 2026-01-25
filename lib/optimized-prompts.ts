// PROMPT OPTIMIZADO PARA REDUCIR COSTOS OPENAI
export const generateOptimizedPrompt = (styleName: string, styleDescription: string): string => {
  return `Redesign room with ${styleName.toLowerCase()} style: ${styleDescription.toLowerCase()}.
  
Requirements:
1. Keep room structure (walls, windows, doors)
2. Apply ${styleName.toLowerCase()} decor and furniture
3. Ensure realistic, livable design
4. Generate high-quality room image

After image, provide 5-8 Amazon products for this ${styleName.toLowerCase()} style:
- Product name
- Brief description  
- Category (furniture, lighting, decor)
- Price range
- Amazon search URL`;
};

// PROMPT PARA RECOMENDACIONES (más económico que GPT-4)
export const generateRecommendationsPrompt = (styleName: string): string => {
  return `Generate 5-8 Amazon product recommendations for ${styleName.toLowerCase()} interior design.
  
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
}`;
};