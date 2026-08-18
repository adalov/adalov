# Desarrollo

[English](./development.md) | [Español](./development.es.md)

> [!WARNING]
> ☣️ **Este es un MVP en desarrollo activo. Todo puede cambiar en cualquier momento. No recomendamos usar este framework en proyectos de nivel productivo.**

Este documento describe cómo está organizado el monorepo de Adalov para desarrollo local y cómo agregar nuevos paquetes del framework.

**Adalov todavía es un MVP, por lo que estas decisiones pueden evolucionar a medida que el framework incorpore implementaciones y uso reales.**

## Requisitos

- Node.js 22 o posterior
- npm 10 o posterior

Instalá las dependencias desde la raíz del repositorio:

```bash
npm install
```

El repositorio utiliza npm Workspaces y TypeScript Project References. No se requiere ninguna herramienta adicional de build para monorepos.

## Estructura del repositorio

```text
adalov/
├── docs/
├── packages/
│   ├── cli/
│   ├── common/
│   ├── core/
│   ├── http/
│   └── metadata/
├── scripts/
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── tsconfig.package.json
├── tsconfig.packages.json
└── tsconfig.packages.build.json
```

Cada paquete del framework es un workspace de npm bajo `packages/`.

## Configuración de TypeScript

La configuración de TypeScript se divide por responsabilidad en lugar de duplicar opciones del compilador en cada paquete.

| Configuración | Responsabilidad |
| --- | --- |
| `tsconfig.json` | Configuración base para todo el repositorio. Define el comportamiento común del compilador compartido por las configuraciones de desarrollo y build, incluyendo comprobación estricta de tipos, resolución ESM/NodeNext, declaraciones, decoradores y soporte para proyectos composite. |
| `tsconfig.build.json` | Extiende la configuración base con comprobaciones más estrictas exclusivas del build y define la ubicación del estado incremental de TypeScript específico del build. |
| `tsconfig.package.json` | Define la estructura de fuentes común para cada paquete: raíz del paquete como `rootDir`, `build/` como salida del compilador, `.tsbuildinfo/dev.tsbuildinfo` como estado incremental de desarrollo, e `index.ts` junto con `lib/**/*.ts` como fuentes del paquete. Los archivos `tsconfig.json` individuales de los paquetes extienden esta configuración y normalmente contienen sólo referencias de proyecto específicas del paquete. |
| `tsconfig.packages.json` | Grafo de proyectos de desarrollo. Referencia el `tsconfig.json` de desarrollo de cada paquete y es utilizado por `npm run build:dev`. |
| `tsconfig.packages.build.json` | Grafo estricto de proyectos de build. Referencia el `tsconfig.build.json` de cada paquete y es utilizado por `npm run build`. |

### Referencias de proyecto de los paquetes

Un paquete sin dependencias internas puede utilizar una configuración mínima de desarrollo:

```json
{
  "extends": "../../tsconfig.package.json"
}
```

Un paquete que depende de otros paquetes de Adalov debe referenciar esos proyectos explícitamente. Por ejemplo:

```json
{
  "extends": "../../tsconfig.package.json",
  "references": [
    {
      "path": "../common/tsconfig.json"
    },
    {
      "path": "../metadata/tsconfig.json"
    }
  ]
}
```

La configuración de build correspondiente también debe declarar las referencias de build:

```json
{
  "extends": [
    "./tsconfig.json",
    "../../tsconfig.build.json"
  ],
  "references": [
    {
      "path": "../common/tsconfig.build.json"
    },
    {
      "path": "../metadata/tsconfig.build.json"
    }
  ]
}
```

Las `references` de TypeScript no se heredan mediante `extends`, por lo que tanto el grafo de desarrollo como el de build deben declararse explícitamente cuando un paquete tiene dependencias internas.

## Agregar un paquete nuevo

Agregar un paquete requiere crear el workspace y registrarlo en la configuración de paquetes/build de todo el repositorio.

### 1. Crear la estructura del paquete

Creá la siguiente estructura:

```text
packages/<package-name>/
├── lib/
├── tests/
├── README.md
├── index.ts
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

`index.ts` es el límite de la API pública del paquete. Los archivos de implementación pertenecen bajo `lib/`, mientras que los tests del paquete pertenecen bajo `tests/`.

### 2. Crear el manifiesto del workspace

Un paquete de librería comienza con un manifiesto fuente similar a:

```json
{
  "name": "@adalov/<package-name>",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": {
      "types": "./build/index.d.ts",
      "import": "./build/index.js"
    }
  }
}
```

El manifiesto fuente es intencionalmente privado y utiliza `0.0.0` como placeholder. Las versiones publicables se generan más adelante a partir del `package.json` raíz.

Si el paquete depende de otro workspace de Adalov, declaralo utilizando el mismo placeholder:

```json
{
  "dependencies": {
    "@adalov/common": "0.0.0"
  }
}
```

La preparación de paquetes reescribe las versiones de dependencias internas de Adalov a la versión canónica de release de la raíz.

Los paquetes pueden exponer `exports`, `bin` o ambos según su responsabilidad. La transformación de distribución para entradas ejecutables `bin` debería mantenerse alineada con el pipeline de preparación de paquetes.

### 3. Configurar TypeScript

Creá `packages/<package-name>/tsconfig.json` extendiendo la configuración compartida de paquetes:

```json
{
  "extends": "../../tsconfig.package.json"
}
```

Agregá `references` para cada dependencia interna de Adalov.

Creá `packages/<package-name>/tsconfig.build.json`:

```json
{
  "extends": [
    "./tsconfig.json",
    "../../tsconfig.build.json"
  ]
}
```

Si el paquete tiene dependencias internas, agregá referencias equivalentes al `tsconfig.build.json` de cada dependencia.

El grafo de dependencias de npm y el grafo de project references de TypeScript deberían describir las mismas relaciones internas entre paquetes.

### 4. Registrar el paquete

Agregá el nombre del directorio del paquete a `PACKAGES` en:

```text
scripts/shared/packages.sh
```

Agregá su configuración de desarrollo a `tsconfig.packages.json`:

```json
{
  "path": "./packages/<package-name>/tsconfig.json"
}
```

Agregá su configuración de build a `tsconfig.packages.build.json`:

```json
{
  "path": "./packages/<package-name>/tsconfig.build.json"
}
```

### 5. Registrar el scope de commit

Los scopes de commits son intencionalmente cerrados. Agregá el nombre del nuevo paquete a `commitScopes` en:

```text
commitlint.config.mjs
```

Esto permite commits como:

```text
feat(<package-name>): add initial implementation
```

Consultá [Convenciones](./conventions.es.md) para las reglas de commits y branches del repositorio.

### 6. Actualizar la documentación raíz

Agregá el paquete a la tabla `Paquetes` del [`README.md`](../README.es.md) raíz y enlazá su README del paquete.

### 7. Actualizar los metadatos del workspace

Ejecutá:

```bash
npm install
```

Esto actualiza los links de npm Workspaces y `package-lock.json`.

### 8. Validar el paquete

Como mínimo, ejecutá:

```bash
npm run build:dev
npm run build
npm run prepare:packages
```

Verificá que el paquete genere salida local del compilador bajo:

```text
packages/<package-name>/build/
```

y un artefacto de distribución bajo:

```text
dist/<package-name>/
```

## Build y distribución

Los builds de desarrollo generan la salida del compilador dentro de cada workspace:

```text
packages/<package>/build/
```

Los builds estrictos utilizan la misma ubicación de salida local del paquete, pero habilitan las reglas más estrictas del compilador desde `tsconfig.build.json`.

`npm run prepare:packages` realiza un build limpio y crea artefactos listos para distribución bajo:

```text
dist/<package>/
```

El manifiesto de distribución se genera en lugar de copiarse directamente desde el workspace fuente. Aquí es donde metadatos exclusivos de la fuente como `private: true` y las versiones placeholder se reemplazan por valores publicables.

El estado incremental de build de TypeScript se almacena bajo:

```text
packages/<package>/.tsbuildinfo/
```

Git lo ignora y `npm run clear` lo elimina junto con las salidas del compilador y de distribución.

## Más documentación

- [Arquitectura](./architecture.es.md)
- [Convenciones del repositorio](./conventions.es.md)
