# Adalov

[English](./README.md) | [Español](./README.es.md)

Adalov es un framework de Node.js y TypeScript para construir aplicaciones orientadas a microservicios, diseñado en torno al objetivo de **cero dependencias externas en tiempo de ejecución**.

> [!WARNING]
> ☣️ **Este es un MVP en desarrollo activo. Todo puede cambiar en cualquier momento. No recomendamos usar este framework en proyectos de nivel productivo.**

## Cero dependencias externas en tiempo de ejecución

Adalov busca proporcionar funcionalidad de framework utilizando Node.js y sus APIs estándar sin incorporar dependencias externas de terceros en tiempo de ejecución a las aplicaciones consumidoras.

Los paquetes pueden depender de otros paquetes `@adalov/*`, mientras que las herramientas de desarrollo como TypeScript, testing, linting y la automatización del repositorio quedan intencionalmente fuera de esta restricción.

## ¿Por qué Adalov?

El nombre **Adalov** deriva de [Ada Lovelace](https://es.wikipedia.org/wiki/Ada_Lovelace), la matemática del siglo XIX cuyo trabajo sobre la [Máquina Analítica de Charles Babbage](https://es.wikipedia.org/wiki/M%C3%A1quina_anal%C3%ADtica) es ampliamente reconocido como una de las primeras expresiones de la programación informática.

El nombre pretende ser un pequeño homenaje no sólo a Lovelace, sino también a las personas que sentaron las bases de la computación mucho antes de que fueran posibles las tecnologías que usamos hoy. Adalov está construido con la misma perspectiva: gran parte de lo que parece nuevo se apoya en décadas —y a veces siglos— de ideas, experimentación y trabajo que lo precedieron.

[Conocé más sobre Ada Lovelace](https://es.wikipedia.org/wiki/Ada_Lovelace)

## Requisitos

- Node.js 22.13.0 o posterior
- npm 10 o posterior

## Primeros pasos

Instalá las dependencias del repositorio desde la raíz del proyecto:

```bash
npm install
```

Este framework está organizado como un monorepo de npm Workspaces, y los paquetes se encuentran bajo `packages/`.

## Paquetes

| Paquete | Descripción |
| --- | --- |
| [`@adalov/cli`](./packages/cli/README.es.md) | Herramientas de línea de comandos para Adalov. |
| [`@adalov/common`](./packages/common/README.es.md) | Utilidades compartidas y contratos comunes. |
| [`@adalov/core`](./packages/core/README.es.md) | APIs centrales del framework y primitivas de tiempo de ejecución. |
| [`@adalov/http`](./packages/http/README.es.md) | APIs e integraciones del framework relacionadas con HTTP. |
| [`@adalov/metadata`](./packages/metadata/README.es.md) | Primitivas y utilidades del framework relacionadas con metadatos. |

## Desarrollo

La salida del compilador de TypeScript se genera localmente bajo `packages/<package>/build/`.
Los artefactos de paquetes listos para distribución se preparan por separado bajo `dist/<package>/`.

### Comandos disponibles

| Comando | Descripción |
| --- | --- |
| `npm run build:dev` | Compila todos los paquetes utilizando la configuración de TypeScript para desarrollo. |
| `npm run build` | Compila todos los paquetes utilizando la configuración de build más estricta. |
| `npm run clear` | Elimina los builds generados de los paquetes, el estado de build incremental de TypeScript y los artefactos de distribución. |
| `npm run prepare:packages` | Realiza un build limpio y prepara los artefactos de distribución bajo `dist/`. |
| `npm run tsc -- <args>` | Ejecuta el compilador de TypeScript local del repositorio con los argumentos provistos. |
| `npm run commitlint -- <args>` | Ejecuta Commitlint con los argumentos provistos. |
| `npm run validate:branch` | Valida el nombre de la branch actual contra la convención de nombres de branches del repositorio. |
| `npm run prepare` | Instala los Git hooks de Husky del repositorio. Normalmente npm lo invoca automáticamente. |

## Documentación

La documentación técnica se está ampliando a medida que evoluciona el framework:

- [Arquitectura](./docs/architecture.es.md)
- [Desarrollo](./docs/development.es.md)
- [Convenciones del repositorio](./docs/conventions.es.md)

## Licencia

Adalov se distribuye bajo la [Licencia MIT](./LICENSE).

**[El gran ensayo de encontrar la eternidad](https://www.youtube.com/watch?v=uL-08eRgf94)**
