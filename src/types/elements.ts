export interface DesignElement {
  id: string; // Identificador único para el elemento
  type: string; // Tipo de elemento (ej: 'pocket', 'button', 'zipper')
  publicId: string; // Cambiado de src a publicId para Cloudinary
  localSrc?: string; // Para fallback local
  x: number; // Posición X en el lienzo
  y: number; // Posición Y en el lienzo
  width: number; // Ancho del elemento
  height: number; // Alto del elemento
  rotation?: number; // Añadido para futura edición de propiedades
  color?: string; // Para el tinte de color vía Cloudinary
  texturePublicId?: string; // Para la textura vía Cloudinary (futuro)
  zIndex?: number; // Para el orden de apilamiento (futuro)
}

export interface GarmentProperties {
  publicId: string; // Para Cloudinary
  localSrc?: string; // Para fallback local
  color?: string; // Hex color
  // Podríamos añadir más propiedades específicas de la prenda aquí si es necesario
}
