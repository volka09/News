'use strict';
const { createCoreController } = require('@strapi/strapi').factories;

function normalize(entity) {
  if (!entity) return null;
  return entity.attributes ? { id: entity.id, ...entity.attributes } : entity;
}

module.exports = createCoreController('api::article.article', ({ strapi }) => ({
  async find(ctx) {
    const { data, meta } = await super.find(ctx);
    const user = ctx.state.user;

    const enriched = await Promise.all(
      data.map(async (item) => {
        const base = normalize(item);
        let isFavorite = false;
        let favoriteId;

        if (user) {
          // Ищем favorite через link-таблицы
          const favIdsForUser = await strapi.db.connection('favorites_user_lnk')
            .select('favorite_id')
            .where('user_id', user.id);

          if (favIdsForUser.length) {
            const favIdSet = favIdsForUser.map(r => r.favorite_id);
            const favArticle = await strapi.db.connection('favorites_article_lnk')
              .first('favorite_id')
              .whereIn('favorite_id', favIdSet)
              .andWhere('article_id', base.id);

            if (favArticle) {
              isFavorite = true;
              favoriteId = favArticle.favorite_id;
            }
          }
        }

        return { ...base, isFavorite, favoriteId };
      })
    );

    return { data: enriched, meta };
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;

    const entity = await strapi.entityService.findOne('api::article.article', id, {
      populate: { category: true, coverImage: true, Author: true },
    });
    if (!entity) return ctx.notFound('Статья не найдена');

    await strapi.db.query('api::article.article').update({
      where: { id },
      data: { views: (entity.views ?? 0) + 1 },
    });

    const base = normalize(entity);

    let isFavorite = false;
    let favoriteId;
    if (user) {
      const favIdsForUser = await strapi.db.connection('favorites_user_lnk')
        .select('favorite_id')
        .where('user_id', user.id);

      if (favIdsForUser.length) {
        const favArticle = await strapi.db.connection('favorites_article_lnk')
          .first('favorite_id')
          .whereIn('favorite_id', favIdsForUser.map(r => r.favorite_id))
          .andWhere('article_id', entity.id);

        if (favArticle) {
          isFavorite = true;
          favoriteId = favArticle.favorite_id;
        }
      }
    }

    return { ...base, isFavorite, favoriteId };
  },
}));