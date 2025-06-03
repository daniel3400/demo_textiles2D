// src/components/DesignCanvas.tsx
import { AdvancedImage } from '@cloudinary/react';
import cld from '@/lib/cloudinary';
import { DesignElement, GarmentProperties } from '@/types/elements'; // Importar GarmentProperties
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { fill } from "@cloudinary/url-gen/actions/resize";
import { Effect as CloudinaryEffect } from "@cloudinary/url-gen/actions/effect"; 
import { Rotate as CloudinaryRotate } from "@cloudinary/url-gen/actions/rotate"; // Corregido: Rotate con mayúscula
import { format, quality } from "@cloudinary/url-gen/actions/delivery";
import { auto } from "@cloudinary/url-gen/qualifiers/format";
import { auto as qAuto } from "@cloudinary/url-gen/qualifiers/quality";
import Image from 'next/image'; // Importar Next Image

interface DraggableElementProps {
  element: DesignElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onResize: (id: string, width: number, height: number) => void;
}

function DraggableElement({ element, isSelected, onSelect, onResize }: DraggableElementProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: element.id,
  });

  let imageComponent;
  // Estilo base para la imagen, la rotación se manejará específicamente
  const baseImageStyle = { 
    width: '100%', 
    height: '100%', 
    objectFit: 'contain' as const, // Corregido: prefer-as-const
  };

  if (element.publicId) {
    const cloudinaryImage = cld.image(element.publicId);
    cloudinaryImage
      .resize(fill().width(element.width).height(element.height))
      .delivery(format(auto()))
      .delivery(quality(qAuto()));

    if (element.color) {
      const colorValue = element.color.startsWith('#') ? element.color.substring(1) : element.color;
      cloudinaryImage.effect(CloudinaryEffect.colorize().color(colorValue).level(100));
    }

    if (element.rotation) { // Aplicar rotación para Cloudinary
      cloudinaryImage.rotate(CloudinaryRotate.byAngle(element.rotation)); 
    }
    // Para Cloudinary, la rotación se aplica en la transformación, no se necesita CSS transform adicional
    imageComponent = <AdvancedImage cldImg={cloudinaryImage} style={baseImageStyle} plugins={[]} />;
  } else if (element.localSrc) {
    const localImageStyle = { ...baseImageStyle, transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined }; 
    // Corregido: Usar Next Image para imágenes locales
    imageComponent = <Image src={element.localSrc} alt={element.type || 'design element'} layout="fill" style={localImageStyle} />;
  } else {
    imageComponent = <div style={{width: '100%', height: '100%', border: '1px dashed gray', display:'flex', alignItems:'center', justifyContent:'center'}}>No Image</div>;
  }

  const style = {
    transform: CSS.Translate.toString(transform),
    left: `${element.x}px`,
    top: `${element.y}px`,
    width: `${element.width}px`,
    height: `${element.height}px`,
    position: 'absolute' as const, // Corregido: prefer-as-const
    zIndex: isDragging ? 100 : (isSelected ? 50 : (element.zIndex || 1)),
    opacity: isDragging ? 0.8 : 1,
    border: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
    boxSizing: 'border-box' as const, // Corregido: prefer-as-const
    // La rotación del elemento en sí (div contenedor) no es necesaria si la imagen ya está rotada
  };

  const handleMouseDownOnResizeHandle = (event: React.MouseEvent) => {
    event.stopPropagation();
    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = element.width;
    const startHeight = element.height;

    const doDrag = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX);
      const newHeight = startHeight + (moveEvent.clientY - startY);
      onResize(element.id, Math.max(20, newWidth), Math.max(20, newHeight));
    };

    const stopDrag = () => {
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    };

    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(element.id);
      }}
    >
      <div {...listeners} {...attributes} style={{ width: '100%', height: '100%', cursor: 'grab' }}>
        {imageComponent}
      </div>
      {isSelected && (
        <>
          <div
            style={{
              position: 'absolute',
              bottom: '-5px',
              right: '-5px',
              width: '12px',
              height: '12px',
              backgroundColor: '#3b82f6',
              border: '2px solid white',
              borderRadius: '50%',
              cursor: 'nwse-resize',
              zIndex: (element.zIndex || 1) + 10, 
            }}
            onMouseDown={handleMouseDownOnResizeHandle}
          />
        </>
      )}
    </div>
  );
}

interface DesignCanvasProps {
  garmentProps: GarmentProperties; // Usar la interfaz GarmentProperties
  elements: DesignElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string) => void;
  onElementResize: (id: string, width: number, height: number) => void;
}

export default function DesignCanvas({ garmentProps, elements, selectedElementId, onSelectElement, onElementResize }: DesignCanvasProps) {
  let garmentImageComponent;
  const garmentBaseStyle: React.CSSProperties = {
    width: '100%', 
    height: '100%', 
    objectFit: 'contain' as const, // Corregido: prefer-as-const
  };

  if (garmentProps.publicId) {
    const garmentImageCld = cld.image(garmentProps.publicId)
      .resize(fill().width(500).height(700))
      .delivery(format(auto()))
      .delivery(quality(qAuto()));

    if (garmentProps.color) {
      const colorValue = garmentProps.color.startsWith('#') ? garmentProps.color.substring(1) : garmentProps.color;
      garmentImageCld.effect(CloudinaryEffect.colorize().color(colorValue).level(100));
    }
    // Aquí no se está aplicando rotación a la prenda base, pero se podría añadir si es necesario
    garmentImageComponent = <AdvancedImage 
                              cldImg={garmentImageCld} 
                              style={garmentBaseStyle}
                              alt="Prenda seleccionada (Cloudinary)"
                              plugins={[]} 
                            />;
  } else if (garmentProps.localSrc) {
    // Corregido: Usar Next Image para la prenda local
    garmentImageComponent = <Image 
                              src={garmentProps.localSrc} 
                              alt="Prenda seleccionada (Local)" 
                              layout="fill"
                              style={garmentBaseStyle} 
                            />;
  } else {
    garmentImageComponent = <p className="text-gray-500">Selecciona un tipo de prenda para ver la imagen.</p>;
  }
  
  return (
    <div className="flex-grow h-full bg-gray-200 border-2 border-gray-300 rounded-lg flex justify-center items-center p-4 overflow-hidden shadow-inner">
      <div
        className="relative w-full h-full max-w-[500px] max-h-[700px] bg-white shadow-lg rounded-md overflow-hidden"
        onClick={() => onSelectElement('')} 
        id="design-canvas-parent" 
      >
        {/* {garmentProps.publicId && ( ... )} DEPRECATED BLOCK */}
        {garmentImageComponent}
        {elements.map((element) => (
          <DraggableElement
            key={element.id}
            element={element}
            isSelected={element.id === selectedElementId}
            onSelect={onSelectElement}
            onResize={onElementResize}
          />
        ))}
      </div>
      {/* {!garmentProps.publicId && !garmentProps.localSrc && ( ... )} DEPRECATED BLOCK */}
      {/* El mensaje de "Selecciona un tipo de prenda" ahora se maneja dentro de garmentImageComponent si no hay ni publicId ni localSrc */}
    </div>
  );
}
