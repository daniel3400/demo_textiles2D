// src/components/ElementEditorPanel.tsx
import Image from 'next/image';
import { AdvancedImage } from '@cloudinary/react';
import cld from '@/lib/cloudinary';
import { DesignElement } from '@/types/elements';
import { fill } from "@cloudinary/url-gen/actions/resize";
import { format, quality } from "@cloudinary/url-gen/actions/delivery";
import { auto } from "@cloudinary/url-gen/qualifiers/format";
import { auto as qAuto } from "@cloudinary/url-gen/qualifiers/quality";
import { useState } from 'react'; // Importar useState

interface ElementEditorPanelProps {
  onAddElement: (elementPublicId: string, elementType: string, localSrc?: string) => void; // Modificado para incluir localSrc
  selectedElement?: DesignElement | null;
  onRemoveElement: () => void;
  onElementPropertyChange: (elementId: string, property: keyof DesignElement, value: DesignElement[keyof DesignElement]) => void; // Corregido: tipo para value
}

// Lista de bolsillos disponibles con Public IDs de Cloudinary y localSrc
// DEBES REEMPLAZAR ESTOS PUBLIC IDs CON LOS TUYOS Y ASEGURARTE QUE localSrc APUNTE A IMÁGENES EXISTENTES
const availablePockets: Array<Omit<DesignElement, 'id' | 'x' | 'y' | 'width' | 'height' | 'rotation' | 'color' | 'zIndex' | 'texturePublicId'> & { name: string, localSrc?: string }> = [
  {
    name: 'Bolsillo Clásico',
    type: 'pocket',
    publicId: '', // Vaciado para priorizar localSrc para el demo
    localSrc: '/images/elementos/bolsillos/bolsillo_1.png' 
  },
  {
    name: 'Bolsillo Moderno',
    type: 'pocket',
    publicId: '', // Vaciado para priorizar localSrc para el demo
    localSrc: '/images/elementos/bolsillos/bolsillo_2.png'
  },
  {
    name: 'Bolsillo Cargo',
    type: 'pocket',
    publicId: '', // Vaciado para priorizar localSrc para el demo
    localSrc: '/images/elementos/bolsillos/bolsillo_3.png'
  },
  {
    name: 'Bolsillo Pequeño',
    type: 'pocket',
    publicId: '', 
    localSrc: '/images/elementos/bolsillos/bolsillo_4.png'
  },
  {
    name: 'Bolsillo Grande',
    type: 'pocket',
    publicId: '', 
    localSrc: '/images/elementos/bolsillos/bolsillo_5.png'
  },
  {
    name: 'Bolsillo Decorativo',
    type: 'pocket',
    publicId: '', 
    localSrc: '/images/elementos/bolsillos/bolsillo_6.png'
  }
  // ... más bolsillos
];

export default function ElementEditorPanel({ 
  onAddElement, 
  selectedElement, 
  onRemoveElement, 
  onElementPropertyChange 
}: ElementEditorPanelProps) {
  const [isPocketsOpen, setIsPocketsOpen] = useState(true); // Estado para el desplegable de bolsillos

  const handlePropertyChange = (property: keyof DesignElement, value: DesignElement[keyof DesignElement]) => { // Corregido: tipo para value
    if (selectedElement) {
      onElementPropertyChange(selectedElement.id, property, value);
    }
  };

  return (
    <div className="w-80 h-full bg-gray-50 p-4 border-r border-gray-300 overflow-y-auto shadow-lg">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">Editor de Elementos</h2>
      
      {selectedElement && (
        <button
          onClick={onRemoveElement}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md mb-6 text-sm transition-colors duration-150"
        >
          Eliminar Elemento
        </button>
      )}

      {selectedElement && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-white shadow">
          <h3 className="text-lg font-medium mb-3 text-gray-700">Propiedades: {selectedElement.type}</h3>
          
          <div className="mb-3">
            <label htmlFor="elementColor" className="block text-sm font-medium text-gray-600 mb-1">Color:</label>
            <input 
              type="color" 
              id="elementColor"
              name="elementColor"
              value={selectedElement.color || '#ffffff'} 
              onChange={(e) => handlePropertyChange('color', e.target.value)}
              className="mt-1 block w-full h-10 p-1 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="elementRotation" className="block text-sm font-medium text-gray-600 mb-1">Rotación:</label>
            <input 
              type="range" 
              id="elementRotation"
              name="elementRotation"
              min="0" 
              max="360" 
              step="1"
              value={selectedElement.rotation || 0}
              onChange={(e) => handlePropertyChange('rotation', parseInt(e.target.value, 10))}
              className="mt-1 block w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <p className="text-xs text-gray-500 text-right">{selectedElement.rotation || 0}°</p>
          </div>
          
          {/* Más propiedades como zIndex, texturePublicId podrían ir aquí */}
          <p className="text-xs text-gray-500 mt-2">ID: {selectedElement.id.substring(0,8)}...</p>
        </div>
      )}

      <h3 className="text-lg font-medium mb-3 text-gray-700">Añadir Elementos</h3>
      <div className="space-y-4">
        <div>
          <button 
            onClick={() => setIsPocketsOpen(!isPocketsOpen)}
            className="w-full flex justify-between items-center text-left text-md font-semibold mb-2 text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            Bolsillos
            {/* Icono de flecha simple */}
            <span className={`transform transition-transform duration-200 ${isPocketsOpen ? 'rotate-180' : 'rotate-0'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </span>
          </button>
          {isPocketsOpen && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
              {availablePockets.map((pocket) => {
                let thumbnailComponent;
                if (pocket.publicId) {
                  const pocketImageCld = cld.image(pocket.publicId)
                    .resize(fill().width(80).height(80))
                    .delivery(format(auto()))
                    .delivery(quality(qAuto()));
                  thumbnailComponent = <AdvancedImage cldImg={pocketImageCld} className="w-16 h-16 object-contain mb-1" alt={pocket.name} />;
                } else if (pocket.localSrc) {
                  thumbnailComponent = <Image src={pocket.localSrc} alt={pocket.name} width={80} height={80} className="w-16 h-16 object-contain mb-1" />;
                } else {
                  thumbnailComponent = <div className="w-16 h-16 flex items-center justify-center bg-gray-200 text-gray-500 text-xs mb-1">No img</div>;
                }

                return (
                  <button 
                    key={pocket.name} // Cambiado a pocket.name o asegurar ID único si localSrc puede no ser único
                    onClick={() => onAddElement(pocket.publicId, pocket.type as string, pocket.localSrc)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150 flex flex-col items-center shadow-sm hover:shadow-md"
                    title={`Agregar ${pocket.name}`}
                  >
                    {thumbnailComponent}
                    <span className="text-xs text-gray-600">{pocket.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {/* Aquí irían otras categorías de elementos como botones, cremalleras (podrían seguir el mismo patrón de desplegable) */}
      </div>

      {!selectedElement && (
         <p className="text-sm text-gray-500 mt-8 text-center">Seleccione un elemento en el lienzo para editar sus propiedades.</p>
      )}
    </div>
  );
}
