// src/components/GarmentOptionsPanel.tsx
import { AdvancedImage } from '@cloudinary/react';
import cld from '@/lib/cloudinary';
import { fill } from "@cloudinary/url-gen/actions/resize";
import { format, quality } from "@cloudinary/url-gen/actions/delivery";
import { auto } from "@cloudinary/url-gen/qualifiers/format";
import { auto as qAuto } from "@cloudinary/url-gen/qualifiers/quality";
import { GarmentProperties } from '@/types/elements'; // Importar GarmentProperties
import Image from 'next/image'; // Para fallback local

interface GarmentOptionsPanelProps {
  onGarmentChange: (publicId: string, localSrc?: string) => void; // Modificado para incluir localSrc
  garmentProps: GarmentProperties; // Usar GarmentProperties
  onGarmentPropertyChange: (property: keyof GarmentProperties, value: GarmentProperties[keyof GarmentProperties]) => void; // Corregido: tipo para value
}

// DEBES REEMPLAZAR ESTOS PUBLIC IDs CON LOS TUYOS Y AÑADIR localSrc SI ES NECESARIO
const availableGarments: Array<{ name: string, publicId: string, localSrc?: string, thumbnailUrl?: string }> = [
  {
    name: 'Camiseta Clásica',
    publicId: '', // Vaciado para priorizar localSrc para el demo
    localSrc: '/images/prendas/camiseta_1.jpg', 
    // thumbnailUrl: '' // Opcional, si tuvieras una miniatura específica en Cloudinary
  },
  {
    name: 'Camisa Formal',
    publicId: '', // Vaciado para priorizar localSrc para el demo
    localSrc: '/images/prendas/camisa_1.jpg',
    // thumbnailUrl: ''
  },
  {
    name: 'Pantalón Jean',
    publicId: '', // Vaciado para priorizar localSrc para el demo
    localSrc: '/images/prendas/pantalon__1.jpg', // Corregido el nombre del archivo si es necesario
    // thumbnailUrl: ''
  },
  // Añade más prendas locales si es necesario, por ejemplo:
  // {
  //   name: 'Otra Prenda Local',
  //   publicId: '',
  //   localSrc: '/images/prendas/otra_prenda.jpg',
  // },
];

export default function GarmentOptionsPanel({ 
  onGarmentChange, 
  garmentProps, 
  onGarmentPropertyChange 
}: GarmentOptionsPanelProps) {
  // El estado selectedGarment ya no es necesario aquí si garmentProps.publicId es la fuente de verdad

  const handleGarmentSelect = (publicId: string, localSrc?: string) => {
    onGarmentChange(publicId, localSrc);
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onGarmentPropertyChange('color', event.target.value);
  };

  return (
    <div className="w-80 h-full bg-gray-50 p-4 border-l border-gray-300 overflow-y-auto shadow-lg">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">Opciones de Prenda</h2>
      
      <div className="mb-6">
        <label htmlFor="garmentColor" className="block text-sm font-medium text-gray-600 mb-1">Color de la Prenda:</label>
        <input 
          type="color" 
          id="garmentColor"
          name="garmentColor"
          value={garmentProps.color || '#ffffff'} // Valor por defecto si no hay color
          onChange={handleColorChange}
          className="mt-1 block w-full h-10 p-1 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
        />
      </div>

      <h3 className="text-lg font-medium mb-3 text-gray-700">Seleccionar Prenda</h3>
      <div className="grid grid-cols-2 gap-3">
        {availableGarments.map((garment) => {
          let thumbnailComponent;
          if (garment.thumbnailUrl || garment.publicId) {
            const garmentThumbnailCld = cld.image(garment.thumbnailUrl || garment.publicId)
              .resize(fill().width(100).height(120))
              .delivery(format(auto()))
              .delivery(quality(qAuto()));
            thumbnailComponent = <AdvancedImage cldImg={garmentThumbnailCld} className="w-24 h-30 object-contain mb-1" alt={garment.name} />;
          } else if (garment.localSrc) {
            thumbnailComponent = <Image src={garment.localSrc} alt={garment.name} width={100} height={120} className="w-24 h-30 object-contain mb-1" />;
          } else {
            thumbnailComponent = <div className="w-24 h-30 flex items-center justify-center bg-gray-200 text-gray-500 text-xs mb-1">No img</div>;
          }

          return (
            <button
              key={garment.name} // Cambiado a garment.name como key
              onClick={() => handleGarmentSelect(garment.publicId, garment.localSrc)}
              className={`p-2 border rounded-lg hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150 flex flex-col items-center shadow-sm hover:shadow-md ${ 
                (garmentProps.publicId === garment.publicId && garment.publicId !== '') || // Si hay publicId y coincide
                (garmentProps.localSrc === garment.localSrc && garment.publicId === '') || // Si no hay publicId y localSrc coincide
                (garmentProps.localSrc === garment.localSrc && !garmentProps.publicId && !garment.publicId) // Si ambos son locales y coinciden
                 ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-300'}`}
              title={`Seleccionar ${garment.name}`}
            >
              {thumbnailComponent}
              <span className="text-xs text-gray-600 mt-1 text-center">{garment.name}</span>
            </button>
          );
        })}
      </div>
      
      {/* Más opciones aquí */}
      <p className="text-sm text-gray-500 mt-8 text-center">Más controles de prenda aparecerán aquí.</p>
    </div>
  );
}
