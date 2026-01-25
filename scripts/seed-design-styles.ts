import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { DESIGN_STYLES } from '../const/DesignStyles';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

// Configuración directa para el script
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/my-interior-designer-ai';

// Definir el schema directamente para el script
const DesignStyleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const DesignStyle = mongoose.models.DesignStyle || mongoose.model('DesignStyle', DesignStyleSchema);

// Extraer estilos del archivo const
const extractStylesFromConst = () => {
  const styles: any[] = [];
  
  Object.entries(DESIGN_STYLES).forEach(([categoryKey, categoryData]) => {
    const categoryName = (categoryData as any).name;
    
    Object.entries(categoryData as any).forEach(([styleKey, styleData]: [string, any]) => {
      if (typeof styleData === 'object' && styleData.name && styleKey !== 'name') {
        const category = categoryName || 'Sin categoría';
        styles.push({
          name: styleData.name,
          slug: styleKey,
          description: styleData.description,
          category: category
        });
      }
    });
  });
  
  return styles;
};

async function seedDesignStyles() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
    
    console.log('🌱 Iniciando siembra de estilos de diseño...');
    
    // Extraer estilos del archivo const
    const stylesToInsert = extractStylesFromConst();
    console.log(`📊 Se encontraron ${stylesToInsert.length} estilos en el archivo const`);
    
    // Limpiar estilos existentes
    await DesignStyle.deleteMany({});
    console.log('🗑️ Estilos existentes eliminados');
    
    // Insertar nuevos estilos
    const insertedStyles = await DesignStyle.insertMany(stylesToInsert);
    console.log(`✅ ${insertedStyles.length} estilos de diseño insertados exitosamente`);
    
    console.log('📋 Estilos insertados:');
    insertedStyles.forEach(style => {
      console.log(`  - ${style.name} (${style.slug}) - ${style.category}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al sembrar estilos de diseño:', error);
    process.exit(1);
  }
}

// Ejecutar el script
seedDesignStyles();