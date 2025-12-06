'use strict';

/**
 * article controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::article.article', ({ strapi }) => ({
  async findOne(ctx) {
    const { id } = ctx.params;

    // Получаем статью
    const article = await strapi.db.query('api::article.article').findOne({
      where: { id },
    });

    if (article) {
      // Увеличиваем views
      await strapi.db.query('api::article.article').update({
        where: { id },
        data: { views: article.views + 1 },
      });
    }

    // Возвращаем стандартный ответ
    return await super.findOne(ctx);
  },
}));
