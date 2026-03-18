/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

// Helper to reduce duplication and enforce idempotency
const add = (path, templateFile) => ({
  type: 'add',
  path,
  templateFile,
  skipIfExists: true,
});

module.exports = function (plop) {
  plop.setGenerator('module', {
    description:
      'Create a new module that follows the Domain-Driven Design (DDD) pattern',

    prompts: [
      {
        type: 'input',
        name: 'singularName',
        message: 'Singular name (e.g. user, product):',
        validate: (value) => {
          if (!value) return 'Name is required';

          if (value.trim().length < 2)
            return 'Name must have at least 2 characters';

          if (!/^[a-zA-Z\s]+$/.test(value))
            return 'Only letters and spaces allowed';

          return true;
        },
      },
      {
        type: 'input',
        name: 'pluralName',
        message: 'Plural name (e.g. users, products):',
        validate: (value) => {
          if (!value) return 'Plural name is required';

          if (value.trim().length < 2)
            return 'Plural must have at least 2 characters';

          if (!/^[a-zA-Z\s]+$/.test(value))
            return 'Only letters and spaces allowed';

          return true;
        },
      },
      {
        type: 'confirm',
        name: 'registerModule',
        message: 'Register module in AppModule?',
        default: false,
      },
    ],

    actions: (data) => {
      const base = 'src/modules/{{kebabCase pluralName}}';

      const actions = [
        // DOMAIN
        add(
          `${base}/domain/{{kebabCase singularName}}.entity.ts`,
          'plop-templates/module/domain/module.entity.hbs',
        ),
        add(
          `${base}/domain/{{kebabCase singularName}}.repository.ts`,
          'plop-templates/module/domain/module.repository.hbs',
        ),

        // APPLICATION
        add(
          `${base}/application/create-{{kebabCase singularName}}.usecase.ts`,
          'plop-templates/module/application/create-model.usecase.hbs',
        ),
        add(
          `${base}/application/list-{{kebabCase pluralName}}.usecase.ts`,
          'plop-templates/module/application/list-models.usecase.hbs',
        ),

        // INFRA
        add(
          `${base}/infra/prisma-{{kebabCase singularName}}.repository.ts`,
          'plop-templates/module/infra/prisma-model.repository.hbs',
        ),
        add(
          `${base}/infra/{{kebabCase singularName}}-mapper.ts`,
          'plop-templates/module/infra/model-mapper.hbs',
        ),

        // INTERFACE
        add(
          `${base}/interface/create-{{kebabCase singularName}}.dto.ts`,
          'plop-templates/module/interface/create-model.dto.hbs',
        ),
        add(
          `${base}/interface/create-{{kebabCase singularName}}-response.dto.ts`,
          'plop-templates/module/interface/create-model-response.dto.hbs',
        ),
        add(
          `${base}/interface/{{kebabCase singularName}}.controller.ts`,
          'plop-templates/module/interface/model.controller.hbs',
        ),

        // MODULE
        add(
          `${base}/{{kebabCase singularName}}.module.ts`,
          'plop-templates/module/model.module.hbs',
        ),
      ];

      // Optional: register module in AppModule
      if (data.registerModule) {
        actions.push(
          {
            type: 'modify',
            path: 'src/app.module.ts',
            pattern: /(imports:\s*\[)/,
            template: `$1\n    {{pascalCase singularName}}Module,`,
          },
          {
            type: 'modify',
            path: 'src/app.module.ts',
            pattern: /(from\s+['"].*['"];)/,
            template: `import { {{pascalCase singularName}}Module } from './modules/{{kebabCase pluralName}}/{{kebabCase singularName}}.module';\n$1`,
          },
        );
      }

      return actions;
    },
  });
};
