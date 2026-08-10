/**
 * =====================================================================
 * CONFIG.JS — Panel de contenido centralizado
 * =====================================================================
 * Este es el ÚNICO archivo que necesitas tocar para:
 *   - Cambiar productos, precios, descripciones e IDs
 *   - Cambiar categorías
 *   - Cambiar textos del hero, propuesta de valor y CTA final
 *   - Apuntar a nuevas fotografías (ver /assets y comentarios "PLACEHOLDER")
 *
 * No es necesario tocar ningún otro archivo para actualizar contenido.
 * =====================================================================
 */

const SITE_CONFIG = {
  brand: {
    name: "Lummoria", // PLACEHOLDER — nombre / logo de marca
    tagline: "Velas artesanales",
  },

  nav: [
    { label: "Inicio", href: "#inicio" },
    { label: "Colecciones", href: "#colecciones" },
    { label: "Nosotros", href: "#historia" },
    { label: "Contacto", href: "#footer" },
  ],

  hero: {
    title: "Velas que transforman pequeños momentos.",
    subtitle:
      "Diseños artesanales inspirados en flores, bebidas y pequeños rituales cotidianos.",
    ctaPrimary: "Descubrir colección",
    ctaSecondary: "Conocer la marca",
    // PLACEHOLDER — reemplazar por fotografía hero real (still life, luz natural, fondo crema)
    image: "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?q=80&w=1400&auto=format&fit=crop",
  },

  categories: [
    {
      id: "cocteles",
      icon: "🍸",
      name: "Cócteles",
      description: "Velas inspiradas en tus bebidas favoritas.",
      // PLACEHOLDER — imagen categoría
      image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1000&auto=format&fit=crop",
    },
    {
      id: "vasos",
      icon: "🥂",
      name: "Vasos",
      description: "Diseños cálidos para acompañar cualquier espacio.",
      image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=1000&auto=format&fit=crop",
    },
    {
      id: "flores",
      icon: "🌸",
      name: "Flores",
      description: "Formas botánicas convertidas en pequeños objetos decorativos.",
      image: "https://images.unsplash.com/photo-1509973127-ef60b0aeee3d?q=80&w=1000&auto=format&fit=crop",
    },
  ],

  // Cada producto se identifica con un "id" único — se usa para trackear
  // el interés individual (product_interest / lead_product_interest).
  products: [
    {
      id: "espresso-martini",
      name: "Espresso Martini",
      category: "cocteles",
      categoryLabel: "Vela cóctel",
      description: "Notas cálidas de café y licor de vainilla en un molde de copa artesanal.",
      price: "Próximamente",
      image: "https://images.unsplash.com/photo-1602607203692-51d3e9c0f5ad?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "mojito-verde",
      name: "Mojito Verde",
      category: "cocteles",
      categoryLabel: "Vela cóctel",
      description: "Menta fresca y un toque cítrico dentro de un vaso tallado.",
      price: "Próximamente",
      image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "margarita-rosa",
      name: "Margarita Rosa",
      category: "cocteles",
      categoryLabel: "Vela cóctel",
      description: "Un giro frutal y sofisticado sobre el clásico de siempre.",
      price: "Próximamente",
      image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "vaso-taupe",
      name: "Vaso Taupe",
      category: "vasos",
      categoryLabel: "Vela en vaso",
      description: "Minimalista y versátil, pensada para cualquier ambiente del hogar.",
      price: "Próximamente",
      image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "vaso-marfil",
      name: "Vaso Marfil",
      category: "vasos",
      categoryLabel: "Vela en vaso",
      description: "Tonos neutros y textura suave para regalar o para ti.",
      price: "Próximamente",
      image: "https://images.unsplash.com/photo-1608181831718-c9ffd8630532?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "vaso-borgona",
      name: "Vaso Borgoña",
      category: "vasos",
      categoryLabel: "Vela en vaso",
      description: "Un acento profundo y elegante para espacios de descanso.",
      price: "Próximamente",
      image: "https://images.unsplash.com/photo-1617952385804-9b1e2ef0a5c8?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "rose-bloom",
      name: "Rosé Bloom",
      category: "flores",
      categoryLabel: "Vela floral",
      description: "Una composición inspirada en pétalos de rosa y tonos cálidos.",
      price: "Próximamente",
      image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "bouquet-nude",
      name: "Bouquet Nude",
      category: "flores",
      categoryLabel: "Vela floral",
      description: "Pequeño ramo de cera con acabado delicado y sofisticado.",
      price: "Próximamente",
      image: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "peonia-taupe",
      name: "Peonía Taupe",
      category: "flores",
      categoryLabel: "Vela floral",
      description: "Formas botánicas suaves, ideales como objeto decorativo.",
      price: "Próximamente",
      image: "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?q=80&w=800&auto=format&fit=crop",
    },
  ],

  valueProps: [
    {
      icon: "hand",
      title: "Hechas artesanalmente",
      description: "Cada pieza tiene pequeñas variaciones que la hacen única.",
    },
    {
      icon: "spark",
      title: "Diseñadas para decorar",
      description: "Objetos que funcionan incluso antes de encenderlos.",
    },
    {
      icon: "leaf",
      title: "Inspiradas en momentos",
      description: "Flores, bebidas y pequeños rituales cotidianos convertidos en velas.",
    },
  ],

  brandStory: {
    title: "Más que una vela.",
    // PLACEHOLDER — imagen editorial
    image: "https://images.unsplash.com/photo-1611048267451-e6ed903d4a38?q=80&w=1200&auto=format&fit=crop",
    paragraphs: [
      "Creamos objetos que decoran, generan ambientes y acompañan momentos, incluso antes de encenderse.",
      "Pensadas también como regalo, buscamos que cada pieza haga que los espacios se sientan un poco más personales.",
    ],
  },

  poll: {
    title: "¿Cuál encenderías primero?",
    thanks: "Gracias por ayudarnos a crear nuestra primera colección.",
  },

  finalCta: {
    title: "Estamos creando nuestra primera colección.",
    subtitle: "Sé de las primeras personas en conocer los diseños que lanzaremos.",
    cta: "Quiero conocerla",
  },

  footer: {
    instagram: "#", // PLACEHOLDER
    tiktok: "#", // PLACEHOLDER
    whatsapp: "#", // PLACEHOLDER
    privacy: "#", // PLACEHOLDER
  },
};
