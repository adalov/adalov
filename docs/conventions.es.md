# Convenciones del repositorio

[English](./conventions.md) | [Español](./conventions.es.md)

> [!WARNING]
> ☣️ **Este es un MVP en desarrollo activo. Todo puede cambiar en cualquier momento. No recomendamos usar este framework en proyectos de nivel productivo.**

Este documento describe las convenciones de Git actualmente aplicadas por el repositorio de Adalov.

El objetivo es mantener los nombres de branches y el historial de commits lo suficientemente predecibles como para soportar automatización futura en torno a releases, changelogs y cambios a nivel de paquete.

**Adalov todavía es un MVP, por lo que estas decisiones pueden evolucionar a medida que el framework incorpore implementaciones y uso reales.**

## Mensajes de commit

Adalov utiliza Conventional Commits a través de Commitlint.

Cada commit debe utilizar la siguiente estructura:

```text
<type>(<scope>): <description>
```

El scope es obligatorio.

Ejemplo:

```text
feat(core): add application bootstrapper
```

### Tipos de commit permitidos

| Tipo | Uso previsto |
| --- | --- |
| `build` | Cambios al sistema de build o a la configuración relacionada con el build |
| `chore` | Mantenimiento del repositorio que no corresponde a otro tipo |
| `ci` | Configuración y automatización de Integración Continua |
| `docs` | Cambios únicamente de documentación |
| `feat` | Nueva funcionalidad |
| `fix` | Correcciones de bugs |

### Scopes de commit permitidos

Los scopes permitidos actualmente son:

```text
cli
common
core
http
metadata
repo
```

Los scopes de paquetes representan cambios pertenecientes a un paquete específico de Adalov. Utilizá `repo` para tooling, configuración, documentación u otros cambios que afecten al repositorio completo y no pertenezcan a un único paquete.

Los scopes deben estar en minúsculas.

Cuando se agrega un paquete nuevo, su nombre también debe agregarse a `commitScopes` en `commitlint.config.mjs`. Consultá [Agregar un paquete nuevo](./development.es.md#agregar-un-paquete-nuevo).

### Reglas adicionales de commits

La configuración actual de Commitlint también exige:

- una longitud máxima de 100 caracteres para el header;
- una línea en blanco antes del body de un commit;
- una línea en blanco antes de los footers del commit.

La fuente de verdad exacta es [`commitlint.config.mjs`](../commitlint.config.mjs).

## Nombres de branches

Las branches de trabajo deben seguir:

```text
<type>/<kebab-case-description>
```

Los tipos de branch permitidos se leen directamente de la regla `type-enum` de Commitlint, manteniendo alineados los tipos de branches y commits.

Ejemplos:

```text
chore/initial-setup
feat/http-router
fix/core-bootstrap
```

Las descripciones deben contener palabras alfanuméricas en minúsculas separadas por guiones.

Las branches permanentes se definen centralmente en [`scripts/shared/branches.sh`](../scripts/shared/branches.sh) y están exentas de esta regla. Las branches permanentes actuales son:

```text
main
develop
```

La implementación de la validación se encuentra en [`scripts/validate-branch-name.sh`](../scripts/validate-branch-name.sh).

Ejecutá la validación manualmente con:

```bash
npm run validate:branch
```

## Git hooks

El repositorio utiliza Husky para los Git hooks locales.

| Hook | Ruta | Descripción |
| --- | --- | --- |
| `commit-msg` | `.husky/commit-msg` | Ejecuta Commitlint contra el mensaje de commit que se está creando. Tipos de commit, scopes, formato u otras reglas configuradas en Commitlint que sean inválidas impiden completar el commit. |
| `pre-push` | `.husky/pre-push` | Valida los nombres de branches antes de hacer push. La validación comprueba las refs de branch pusheadas cuando están disponibles y utiliza la branch actual como fallback cuando es necesario. |

Los hooks de Husky se instalan mediante el script del lifecycle `prepare` de npm en la raíz, que normalmente se ejecuta automáticamente después de `npm install`.

## Validación manual

Commitlint puede invocarse directamente mediante el script de npm en la raíz:

```bash
npm run commitlint -- <args>
```

La validación de branches puede invocarse con:

```bash
npm run validate:branch
```

Estos comandos utilizan la misma configuración que los Git hooks y deberían preferirse antes que duplicar reglas de validación en otros lugares.

## Más documentación

- [Arquitectura](./architecture.es.md)
- [Desarrollo](./development.es.md)
