'use client';

import { useState, useCallback } from 'react';
import DesignCanvas from "@/components/DesignCanvas";
import ElementEditorPanel from "@/components/ElementEditorPanel";
import GarmentOptionsPanel from "@/components/GarmentOptionsPanel";
import { DesignElement, GarmentProperties } from '@/types/elements'; // Importar GarmentProperties
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';

// Importa tu instancia de Cloudinary
import cld from '@/lib/cloudinary';
import { Effect } from "@cloudinary/url-gen/actions/effect"; // Corregido: Effect con mayúscula

export default function HomePage() {
  const [garmentProperties, setGarmentProperties] = useState<GarmentProperties>({
    publicId: '', // Inicialmente vacío para usar localSrc
    localSrc: '/images/prendas/camiseta_1.png', // Imagen local por defecto
    color: '#ffffff', // Color inicial por defecto para la prenda
  });
  const [elementsOnCanvas, setElementsOnCanvas] = useState<DesignElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleGarmentChange = (newPublicId: string, localSrc?: string) => {
    setGarmentProperties({
      publicId: newPublicId,
      localSrc: localSrc,
      color: garmentProperties.color // Mantener el color actual si se cambia solo la prenda
    });
    setElementsOnCanvas([]);
    setSelectedElementId(null);
  };

  const handleAddElement = (elementPublicId: string, elementType: string, localSrc?: string) => {
    const newElement: DesignElement = {
      id: Date.now().toString(),
      type: elementType as DesignElement['type'],
      publicId: elementPublicId,
      localSrc: localSrc,
      x: 50,
      y: 50,
      width: 80,
      height: 80,
      rotation: 0,
      color: '#cccccc', // Color inicial predeterminado para nuevos elementos
    };
    setElementsOnCanvas(prevElements => [...prevElements, newElement]);
    setSelectedElementId(newElement.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    setElementsOnCanvas(prevElements =>
      prevElements.map(el =>
        el.id === active.id ? { ...el, x: el.x + delta.x, y: el.y + delta.y } : el
      )
    );
    setSelectedElementId(active.id as string);
  };

  const handleElementResize = (elementId: string, newWidth: number, newHeight: number) => {
    setElementsOnCanvas(prevElements =>
      prevElements.map(el =>
        el.id === elementId ? { ...el, width: Math.max(20, newWidth), height: Math.max(20, newHeight) } : el
      )
    );
  };

  const handleSelectElement = (elementId: string) => {
    setSelectedElementId(prevId => (prevId === elementId ? null : elementId));
  };

  const handleRemoveSelectedElement = () => {
    if (selectedElementId) {
      setElementsOnCanvas(prevElements => prevElements.filter(el => el.id !== selectedElementId));
      setSelectedElementId(null);
    }
  };

  const handleElementPropertyChange = useCallback((elementId: string, property: keyof DesignElement, value: any) => {
    setElementsOnCanvas(prevElements =>
      prevElements.map(el =>
        el.id === elementId ? { ...el, [property]: value } : el
      )
    );
  }, []);

  const handleGarmentPropertyChange = useCallback((property: keyof GarmentProperties, value: any) => {
    setGarmentProperties(prev => ({ ...prev, [property]: value }));
  }, []);

  const selectedElement = elementsOnCanvas.find(el => el.id === selectedElementId);

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToParentElement]}
    >
      <main className="flex h-screen bg-gray-50">
        <ElementEditorPanel
          onAddElement={handleAddElement}
          selectedElement={selectedElement}
          onRemoveElement={handleRemoveSelectedElement}
          onElementPropertyChange={handleElementPropertyChange}
        />
        <DesignCanvas
          garmentProps={garmentProperties} // Pasar objeto de propiedades de la prenda
          elements={elementsOnCanvas}
          selectedElementId={selectedElementId}
          onSelectElement={handleSelectElement}
          onElementResize={handleElementResize}
        />
        <GarmentOptionsPanel
          onGarmentChange={handleGarmentChange} // Pasa el publicId
          garmentProps={garmentProperties}
          onGarmentPropertyChange={handleGarmentPropertyChange}
        />
      </main>
    </DndContext>
  );
}
