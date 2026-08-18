import { PACKAGE_INFO as CORE_PACKAGE_INFO } from '@adalov/core';
import { PACKAGE_INFO as HTTP_PACKAGE_INFO } from '@adalov/http';

console.log('Adalov Playground');
console.table([
    CORE_PACKAGE_INFO,
    HTTP_PACKAGE_INFO
]);
