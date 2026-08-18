#!/usr/bin/env node

const fs = require('node:fs');

const [
    rootPackageJsonPath,
    sourcePackageJsonPath,
    outputPackageJsonPath,
    packageName
] = process.argv.slice(2);

const requiredRootFields = [
    'version',
    'description',
    'repository',
    'keywords',
    'author',
    'license',
    'bugs',
    'homepage',
    'engines'
];
const requiredSourceFields = [
    'name'
];

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

const transformBins = (value) => {
    // @TODO
    return value;
};

const transformDependencies = (dependencies, version) => {
    return Object.fromEntries(
        Object.entries(dependencies).map(([dependency, dependencyVersion]) => [
            dependency,
            dependency.startsWith('@adalov/')
                ? version
                : dependencyVersion
        ])
    );
};

const validateFields = (
    packageName,
    rootPackage,
    sourcePackage
) => {
    for (const field of requiredRootFields) {
        if (rootPackage[field] == null) {
            throw new Error(`Missing required root package field: ${field}`);
        }
    }

    for (const field of requiredSourceFields) {
        if (sourcePackage[field] == null) {
            throw new Error(`Missing required source package field: ${field}`);
        }
    }

    if (sourcePackage.name !== `@adalov/${packageName}`) {
        throw new Error(
            `Package "${packageName}" must be named "@adalov/${packageName}"`
        );
    }
    
    if (sourcePackage.version !== '0.0.0') {
        throw new Error(
            `Source package "${sourcePackage.name}" must use version "0.0.0"`
        );
    }

    if (sourcePackage.type !== 'module') {
        throw new Error(
            `Source package "${sourcePackage.name}" must use type "module"`
        );
    }

    if (sourcePackage.private !== true) {
        throw new Error(
            `Source package "${sourcePackage.name}" must be private`
        );
    }
};

const generatePackageJson = (
    packageName,
    rootPackageJsonPath,
    sourcePackageJsonPath,
    outputPackageJsonPath
) => {
    const rootPackage = readJson(rootPackageJsonPath);
    const sourcePackage = readJson(sourcePackageJsonPath);
    
    validateFields(packageName, rootPackage, sourcePackage);

    const outputPackage = {
        name: sourcePackage.name,
        version: rootPackage.version,
        description: sourcePackage.description ?? rootPackage.description,
        type: 'module',
        ...(sourcePackage.exports && {
            exports: transformExports(sourcePackage.exports)
        }),
        ...(sourcePackage.bin && {
            bin: transformBins(sourcePackage.bin)
        }),
        ...(sourcePackage.dependencies && {
            dependencies: transformDependencies(
                sourcePackage.dependencies,
                rootPackage.version
            )
        }),
        repository: {
            ...rootPackage.repository,
            directory: `packages/${packageName}`
        },
        keywords: rootPackage.keywords,
        author: rootPackage.author,
        license: rootPackage.license,
        bugs: rootPackage.bugs,
        homepage: rootPackage.homepage,
        engines: rootPackage.engines
    };
    
    fs.writeFileSync(
        outputPackageJsonPath,
        JSON.stringify(outputPackage, null, 2)
    );
};

generatePackageJson(
    packageName,
    rootPackageJsonPath,
    sourcePackageJsonPath,
    outputPackageJsonPath
);
