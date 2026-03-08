/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// const path = require('path');

module.exports = function (plop) {
  plop.setGenerator('module', {
    description:
      'Create a new module that follows the Domain-Driven Design (DDD) pattern',
    prompts: [
      {
        type: 'input',
        name: 'moduleName',
        message: 'What is the name of the module?',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/modules/{{kebabCase moduleName}}/{{kebabCase moduleName}}.module.ts',
        templateFile: 'plop-templates/module.hbs',
      },
      {
        type: 'add',
        path: 'src/modules/{{kebabCase moduleName}}/domain/{{kebabCase moduleName}}.entity.ts',
        templateFile: 'plop-templates/domain.entity.hbs',
      },
    ],
  });
};
