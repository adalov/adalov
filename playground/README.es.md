# Adalov Playground

> [!WARNING]
> ☣️ **Este es un MVP en desarrollo activo. Cualquier cosa puede cambiar en cualquier momento. No recomendamos utilizar este framework en proyectos de producción.**

Playground es una aplicación de desarrollo local utilizada para probar Adalov a través de las APIs públicas de sus paquetes.

Vive intencionalmente fuera de `packages/` porque no es un paquete publicable del framework. Está registrado como un workspace privado de npm únicamente para que los paquetes locales `@adalov/*` se vinculen mediante la instalación de workspaces del repositorio.

## Desarrollo

Instalá las dependencias del repositorio desde el root:

```bash
npm install
```

Iniciá el servidor de desarrollo del Playground con:

```bash
npm run playground
```

El servidor de desarrollo compila inicialmente los paquetes del framework y el Playground, luego mantiene ambas capas de compilación de TypeScript en modo watch mientras Node.js observa el entrypoint compilado del Playground y sus módulos importados.

Este flujo de trabajo local está intencionalmente separado de la validación final de los paquetes. Las pruebas contra artefactos `.tgz` empaquetados o paquetes publicados en npm deben realizarse desde un proyecto consumidor externo.
