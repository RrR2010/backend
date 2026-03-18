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
        name: 'singularName',
        message: 'What is the singular name of the module?',
      },
      {
        type: 'input',
        name: 'pluralName',
        message: 'What is the plural name?',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/modules/{{kebabCase pluralName}}/application/use-cases/create-{{kebabCase singularName}}.usecase.ts',
        templateFile:
          'plop-templates/module/application/use-cases/create-model.usecase.hbs',
      },
      {
        type: 'add',
        path: 'src/modules/{{kebabCase pluralName}}/domain/entities/{{kebabCase singularName}}.entity.ts',
        templateFile: 'plop-templates/module/domain/entities/module.entity.hbs',
      },
    ],
  });
};
