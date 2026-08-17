#!/usr/bin/env node

const fs = require('node:fs');

const [
    rootPackageJsonPath,
    sourcePackageJsonPath,
    outputPackageJsonPath,
    packageName
] = process.argv.slice(2);

if (
    !rootPackageJsonPath ||
    !sourcePackageJsonPath ||
    !outputPackageJsonPath ||
    !packageName
) {
    throw new Error(
        'Usage: prepare-package-json.js <root-package-json> <package-json> <output-package-json> <package-name>'
    );
}

const readJson = (path) => JSON.parse(
    fs.readFileSync(path, 'utf8')
);

const transformExports = (value) => {
    if (typeof value === 'string') {
        return value.replace(/^\.\/build\//, './');
    }

    if (Array.isArray(value)) {
        return value.map(transformExports);
    }

    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([key, child]) => [
                key,
                transformExports(child)
            ])
        );
    }

    return value;
};

const rootPackage = readJson(rootPackageJsonPath);
const sourcePackage = readJson(sourcePackageJsonPath);

const outputPackage = {
    name: sourcePackage.name,
    version: sourcePackage.version,
    description: sourcePackage.description ?? rootPackage.description,
    type: sourcePackage.type,
    ...(sourcePackage.exports && {
        exports: transformExports(sourcePackage.exports)
    }),
    ...(sourcePackage.dependencies && {
        dependencies: sourcePackage.dependencies
    }),
    ...(rootPackage.repository && {
        repository: {
            ...rootPackage.repository,
            directory: `packages/${packageName}`
        }
    }),
    ...(rootPackage.keywords && {
        keywords: rootPackage.keywords
    }),
    ...(rootPackage.author && {
        author: rootPackage.author
    }),
    ...(rootPackage.license && {
        license: rootPackage.license
    }),
    ...(rootPackage.bugs && {
        bugs: rootPackage.bugs
    }),
    ...(rootPackage.homepage && {
        homepage: rootPackage.homepage
    }),
    ...(rootPackage.engines && {
        engines: rootPackage.engines
    })
};

fs.writeFileSync(
    outputPackageJsonPath,
    JSON.stringify(outputPackage, null, 2)
);