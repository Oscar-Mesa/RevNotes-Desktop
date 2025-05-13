# RevNotes - Aplicación de Notas para Escritorio

RevNotes es una aplicación de escritorio para tomar notas con soporte para formato enriquecido, imágenes y organización en carpetas.

## Características Principales

-   Editor de texto enriquecido con Quill.js
-   Organización de notas en carpetas
-   Interfaz oscura moderna
-   Soporte para imágenes y videos
-   Funciona completamente offline
-   Disponible para Windows y macOS

---

## **Requisitos**

-   Node.js v16 o superior
-   npm o pnpm

## Instalación de Dependencias

### Windows y macOS

```bash
npm install
# o
pnpm install
```

## Desarrollo

Para iniciar la aplicación en modo desarrollo:

```bash
npm start
# o
pnpm start
```

## Build para Producción

### Windows

```bash
npm run build
# Esto generará un instalador .exe en la carpeta release/
```

### macOS

```bash
npm run build --mac
# Esto generará un archivo .dmg en la carpeta release/
```

## Estructura del Proyecto

```
.
├── main.js            # Punto de entrada principal de Electron
├── src/
│   ├── index.html     # Interfaz principal
│   ├── preload.js     # Puente entre main y renderer
│   ├── renderer.js    # Lógica de la interfaz
│   ├── style.css      # Estilos principales
│   └── img/           # Assets e iconos
├── package.json       # Configuración y dependencias
└── README.md          # Este archivo
```

## Soporte

Para reportar problemas o solicitar características, por favor abre un issue en el repositorio.

## Licencia

ISC © Neiver Peralta / **Revien**
