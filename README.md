# Lumière Studio — Landing de validación (velas artesanales)

Landing page mobile-first para validar demanda antes de fabricar inventario
(Fake Door / Smoke Test). No incluye pasarela de pagos: cada CTA de producto
abre un formulario mínimo de "avísame cuando esté disponible" y registra
eventos de interés.

Es un sitio **estático** (HTML + CSS + JS, sin build, sin dependencias de
Node) para que el despliegue sea instantáneo en Vercel o Cloudflare Pages.
Usa Tailwind vía CDN sólo como utilidades de layout; el sistema visual
(colores, tipografía, componentes) vive en `css/styles.css`.

## Estructura

```
velas-landing/
├── index.html          → estructura de la página (secciones vacías, se llenan con JS)
├── css/
│   └── styles.css       → sistema visual: colores, tipografía, componentes, animaciones
├── js/
│   ├── config.js         → ÚNICO archivo que necesitas editar para cambiar contenido
│   ├── analytics.js      → función trackEvent() + hooks para GA4 / Meta Pixel / TikTok
│   └── main.js           → lógica de render e interacción (no hace falta tocarlo)
└── README.md
```

## 1. Ejecutar localmente

No requiere `npm install`. Basta un servidor estático simple:

```bash
cd velas-landing
python3 -m http.server 8000
# abrir http://localhost:8000
```

(o con Node: `npx serve .`)

## 2. Modificar productos, categorías y textos

Todo el contenido vive en **`js/config.js`**. No necesitas tocar HTML ni CSS.

Para añadir un producto nuevo, copia un bloque dentro de `products: [...]`:

```js
{
  id: "nombre-unico",          // usado para trackear interés (no lo repitas)
  name: "Nombre visible",
  category: "flores",          // debe coincidir con un id de categories[]
  categoryLabel: "Vela floral",
  description: "Descripción corta.",
  price: "Próximamente",       // o "$25.000" cuando definas precio
  image: "URL o ruta local",
},
```

Para quitar un producto, borra su bloque. Para reordenar, cambia el orden
en el array (afecta el campo `position` que se registra en analítica).

## 3. Reemplazar fotografías

Todas las imágenes están marcadas con el comentario `// PLACEHOLDER` en
`config.js` y usan por ahora fotos de stock (Unsplash) sólo para maquetar.
Para usar tus propias fotos:

1. Coloca tus archivos en `assets/` (crea subcarpetas si quieres, ej. `assets/productos/`).
2. Reemplaza el valor de `image` en `config.js` por la ruta relativa, ej.
   `image: "assets/productos/rose-bloom.jpg"`.

Recomendaciones: fotografía tipo still life, luz natural suave, fondos
crema/nude, relación de aspecto cuadrada para productos (1:1) y vertical
(4:5) para el hero y la sección editorial.

## 4. Cambiar textos (hero, propuesta de valor, historia, CTA final)

También en `js/config.js`, en los objetos `hero`, `valueProps`,
`brandStory`, `poll` y `finalCta`.

## 5. Desplegar

### Vercel
1. Sube la carpeta a un repositorio de GitHub (o usa `vercel` CLI directamente).
2. En [vercel.com](https://vercel.com) → "Add New Project" → importa el repo.
3. Framework preset: **Other** (sitio estático). No hace falta build command.
4. Deploy.

### Cloudflare Pages
1. Sube el repo a GitHub/GitLab.
2. En Cloudflare Pages → "Create a project" → conecta el repo.
3. Build command: (vacío). Output directory: `/` (raíz).
4. Deploy.

## 6. Conectar Google Analytics 4 / Meta Pixel / TikTok Pixel

Los snippets ya están preparados y comentados dentro de `<head>` en
`index.html`. Para activarlos:

1. Descomenta el bloque correspondiente.
2. Reemplaza el ID de ejemplo (`G-XXXXXXX`, `TU_PIXEL_ID`) por el tuyo.

No necesitas tocar `js/analytics.js`: la función `trackEvent()` detecta
automáticamente `window.gtag`, `window.fbq` y `window.ttq` si están
presentes y les reenvía cada evento.

## 7. Eventos registrados (para medir demanda)

| Evento                  | Cuándo se dispara                                   | Datos incluidos                              |
|--------------------------|------------------------------------------------------|-----------------------------------------------|
| `page_view`               | Al cargar la página                                   | —                                              |
| `hero_cta_click`          | Clic en CTA principal o secundario del hero           | cta, label                                     |
| `category_click`          | Clic en "Explorar" de una categoría                   | category_id, category_name                    |
| `product_view`            | Un producto entra al 50% en el viewport               | product_id, product_name                       |
| `product_interest`        | Clic en "Quiero esta vela"                            | product_id, product_name, category, position   |
| `lead_product_interest`   | Envío del formulario dentro del modal de un producto  | product_id, product_name, category             |
| `category_preference`     | Voto en "¿Cuál encenderías primero?"                  | category_id, category_name                     |
| `lead_start`               | Envío del formulario del CTA final                    | source                                         |
| `social_click`             | Clic en Instagram / TikTok / WhatsApp del footer      | network                                        |

Con estos eventos puedes calcular después:

- **CTR producto** = `product_interest` ÷ `product_view` (por `product_id`)
- **CTR categoría** = `category_click` ÷ `page_view`
- **Conversión a lead** = (`lead_product_interest` + `lead_start`) ÷ `page_view`
- **Preferencia por categoría** = conteo de `category_preference` por `category_id`

Mientras no conectes GA4/Pixel, cada evento queda igualmente en la consola
del navegador y en `sessionStorage` (`velas_event_log`) para que puedas
verificar que todo se está registrando correctamente.
