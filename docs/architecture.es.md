# Arquitectura

[English](./architecture.md) | [Español](./architecture.es.md)

> [!WARNING]
> ☣️ **Este es un MVP en desarrollo activo. Todo puede cambiar en cualquier momento. No recomendamos usar este framework en proyectos de nivel productivo.**

Este documento describe la dirección arquitectónica actual de Adalov y la estructura del repositorio que la soporta.

**Adalov todavía es un MVP, por lo que estas decisiones pueden evolucionar a medida que el framework incorpore implementaciones y uso reales.**

## Objetivos de diseño

### Cero dependencias externas en tiempo de ejecución

Un objetivo principal de Adalov es proporcionar funcionalidad de framework sin introducir dependencias externas de terceros en tiempo de ejecución.

El framework debería apoyarse en Node.js y sus APIs estándar siempre que sea práctico; y los paquetes pueden depender de otros paquetes `@adalov/*`, pero la intención es que los paquetes publicados del framework no incorporen dependencias externas en tiempo de ejecución a las aplicaciones consumidoras.

Las herramientas de desarrollo quedan intencionalmente excluidas de esta restricción. TypeScript, Commitlint, Husky, herramientas de testing, linters y paquetes similares pueden utilizarse como dependencias de desarrollo cuando mejoren el flujo de trabajo del repositorio o la calidad del código.

### Límites explícitos entre paquetes

Cada paquete posee una responsabilidad claramente definida y expone su API pública a través de su punto de entrada raíz `index.ts`. Los detalles de implementación se encuentran bajo `lib/` y no deberían consumirse directamente desde otro paquete.

### Herramientas nativas primero

El repositorio prioriza las capacidades nativas de Node.js, npm Workspaces y TypeScript antes de introducir herramientas adicionales de build o monorepo.

### Estructura de monorepo escalable

Actualmente los paquetes viven en un único monorepo de npm Workspaces y se publican utilizando una versión compartida. Los límites se mantienen intencionalmente lo bastante independientes como para permitir versionado separado o extracción a repositorios independientes en el futuro si el proyecto lo requiere.

## Paquetes

| Paquete | Responsabilidad | Dependencias internas |
| --- | --- | --- |
| [`@adalov/cli`](../packages/cli/README.es.md) | Herramientas de línea de comandos para Adalov. | `@adalov/common` |
| [`@adalov/common`](../packages/common/README.es.md) | Utilidades, tipos, constantes y contratos comunes compartidos. | -- |
| [`@adalov/core`](../packages/core/README.es.md) | Orquestación central del framework y primitivas de alto nivel para tiempo de ejecución. | `@adalov/common`, `@adalov/metadata` |
| [`@adalov/http`](../packages/http/README.es.md) | Funcionalidad e integraciones del framework específicas de HTTP. | `@adalov/common`, `@adalov/core`, `@adalov/metadata` |
| [`@adalov/metadata`](../packages/metadata/README.es.md) | Definiciones de metadatos compartidas y primitivas relacionadas. | -- |

El grafo de dependencias actual es intencionalmente unidireccional:

```text
cli
└──> common

core
├──> common
└──> metadata

http
├──> common
├──> core
└──> metadata
```

`core` no depende de paquetes específicos de protocolo como `http`. Los paquetes de protocolo se construyen sobre las abstracciones de core.

## Límites de los paquetes

Un paquete fuente sigue esta estructura general:

```text
packages/<package>/
├── lib/
├── tests/
├── README.md
├── index.ts
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

`index.ts` define la API pública del paquete. Los imports entre paquetes deberían utilizar el nombre del paquete, por ejemplo:

```ts
import { Logger } from '@adalov/common';
```

Los imports hacia la estructura interna `lib/` de otro paquete no deberían utilizarse como parte de la arquitectura del framework.

## Manifiestos de workspace y distribución

Los manifiestos de los paquetes fuente son manifiestos de workspace y no artefactos publicables. Utilizan las siguientes convenciones del repositorio:

- `private: true` evita la publicación accidental de los workspaces fuente.
- `version: 0.0.0` es un placeholder de desarrollo.
- las dependencias internas `@adalov/*` utilizan el placeholder `0.0.0`.
- los paquetes utilizan ESM con `type: module`.

El `package.json` raíz contiene la versión canónica de Adalov. Durante la preparación de paquetes, los manifiestos publicables se generan bajo `dist/<package>/` utilizando esa versión raíz. Las dependencias internas `@adalov/*` se reescriben a la misma versión exacta de release.

Actualmente esto le da a Adalov releases sincronizados, manteniendo al mismo tiempo cada paquete estructuralmente independiente.

## Capas de build y distribución

La compilación y la distribución son aspectos separados.

```text
packages/<package>/ source
        │
        │ TypeScript build
        ▼
packages/<package>/build/
        │
        │ package preparation
        ▼
dist/<package>/
        │
        │ npm pack / publish
        ▼
consumer
```

`packages/<package>/build/` contiene la salida local del compilador de TypeScript utilizada por el workspace durante el desarrollo.

`dist/<package>/` contiene el artefacto publicable preparado. El paso de preparación copia únicamente la salida compilada y los archivos de paquete requeridos, y genera el `package.json` de distribución.

El estado incremental de TypeScript se almacena por separado bajo `packages/<package>/.tsbuildinfo/` y nunca forma parte de un artefacto de distribución.

Para los flujos de desarrollo y los detalles de configuración de TypeScript, consultá [Desarrollo](./development.es.md).

## Más documentación

- [Desarrollo](./development.es.md)
- [Convenciones del repositorio](./conventions.es.md)
