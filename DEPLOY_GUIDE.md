# OTTO - Guía de Despliegue en Vercel

## Repositorio
El código está disponible en: **https://github.com/jisantander/otto-agentic-commerce**

## Pasos para Desplegar

### 1. Ir a Vercel
Abre este enlace en tu navegador:
```
https://vercel.com/new/import?s=https://github.com/jisantander/otto-agentic-commerce
```

### 2. Iniciar Sesión
- Haz clic en **"Continue with GitHub"**
- Autoriza a Vercel para acceder a tu cuenta de GitHub

### 3. Configurar el Proyecto
- **Project Name**: `otto` (o el nombre que prefieras)
- **Framework Preset**: Next.js (debería detectarse automáticamente)

### 4. Variables de Entorno (IMPORTANTE)
Antes de hacer deploy, expande la sección **"Environment Variables"** y agrega:

| Variable | Valor |
|----------|-------|
| `OPENAI_API_KEY` | Tu API key de OpenAI |

Esta variable es necesaria para la funcionalidad de generación de imágenes con IA.

### 5. Deploy
Haz clic en **"Deploy"** y espera ~2 minutos.

### 6. URL Permanente
Una vez completado, Vercel te dará una URL como:
```
https://otto-xxxxx.vercel.app
```

También puedes configurar un dominio personalizado desde el dashboard de Vercel.

---

## Estructura del Proyecto
```
otto/
├── src/
│   ├── app/
│   │   ├── api/generate-image/  # API para generación de imágenes con IA
│   │   ├── globals.css          # Estilos Terminal Chic
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── CartSidebar.tsx      # Panel lateral de carrito
│   │   ├── ChatInput.tsx        # Input con cámara
│   │   ├── ChatInterface.tsx    # Interfaz principal
│   │   ├── ChatMessage.tsx      # Mensajes del chat
│   │   ├── ProductCard.tsx      # Tarjetas de producto
│   │   ├── ReasoningEngine.tsx  # Visualización de razonamiento
│   │   └── SolutionWidget.tsx   # Widget de solución
│   ├── lib/
│   │   ├── imageGeneration.ts   # Servicio de generación de imágenes
│   │   ├── mockData.ts          # Datos mock de productos
│   │   └── searchEngine.ts      # Motor de búsqueda
│   ├── store/
│   │   └── chatStore.ts         # Estado global con Zustand
│   └── types/
│       └── index.ts             # Tipos TypeScript
├── .env.local                   # Variables de entorno (local)
├── package.json
└── tailwind.config.ts
```

## Características
- **Chat-first interface** con input y cámara
- **Panel lateral de carrito** progresivo
- **Visualización de razonamiento** del agente AI
- **Generación de imágenes con IA** (GPT-4 Vision + DALL-E 3)
- **Datos mock** con retailers chilenos (Sodimac, Falabella, Zara Home, etc.)
