'use strict';
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::favorite.favorite', ({ strapi }) => ({
  async findUserFavorites(ctx) {
  const user = ctx.state.user;
  if (!user) return ctx.unauthorized('Необходимо авторизоваться');

  const favUserLinks = await strapi.db.connection('favorites_user_lnk')
    .select('favorite_id')
    .where('user_id', user.id);

  const favoriteIds = favUserLinks.map(r => r.favorite_id);

  const favArticles = favoriteIds.length
    ? await strapi.db.connection('favorites_article_lnk')
        .select('favorite_id', 'article_id')
        .whereIn('favorite_id', favoriteIds)
    : [];

  const articles = [];
  for (const link of favArticles) {
    const art = await strapi.entityService.findOne('api::article.article', link.article_id, {
      populate: { category: true, coverImage: true, Author: true },
    });
    if (art) {
      articles.push({
        id: art.id,
        attributes: {
          ...art,
          isFavorite: true,
          favoriteId: link.favorite_id,
        },
      });
    }
  }

  ctx.body = {
    data: articles,
    meta: {
      pagination: {
        page: 1,
        pageSize: articles.length,
        pageCount: 1,
        total: articles.length,
      },
    },
  };
},

  async add(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Необходимо авторизоваться');

    const { article } = ctx.request.body.data || {};
    if (!article) return ctx.badRequest('Не указан article');

    const existing = await strapi.entityService.findMany('api::favorite.favorite', {
      filters: { user: user.id, article: article },
    });
    if (existing.length > 0) {
      return { isFavorite: true, favoriteId: existing[0].id };
    }

    const fav = await strapi.entityService.create('api::favorite.favorite', {
      data: {
        user: { connect: [user.id] },
        article: { connect: [article] },
      },
    });

    return { isFavorite: true, favoriteId: fav.id };
  },

  async remove(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Необходимо авторизоваться');

    const { id } = ctx.params;
    if (!id) return ctx.badRequest('Не указан favoriteId');

    const favorite = await strapi.entityService.findOne('api::favorite.favorite', id, {
      populate: { user: true },
    });
    if (!favorite) return { isFavorite: false, favoriteId: id };
    if (favorite.user?.id !== user.id) return ctx.unauthorized('Эта запись не принадлежит пользователю');

    await strapi.entityService.delete('api::favorite.favorite', id);

    return { isFavorite: false, favoriteId: id };
  },
}));