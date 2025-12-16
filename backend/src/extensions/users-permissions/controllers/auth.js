/* global strapi */
const { sanitize } = require('@strapi/utils');

module.exports = {
  async callback(ctx) {
    const { identifier, password } = ctx.request.body;

    const user = await strapi
      .query('plugin::users-permissions.user')
      .findOne({
        where: { email: identifier },
        populate: ['role'],
      });

    if (!user) {
      return ctx.badRequest('Invalid identifier or password');
    }

    const validPassword = await strapi
      .plugin('users-permissions')
      .service('user')
      .validatePassword(password, user.password);

    if (!validPassword) {
      return ctx.badRequest('Invalid identifier or password');
    }

    const jwt = strapi
      .plugin('users-permissions')
      .service('jwt')
      .issue({ id: user.id });

    ctx.send({
      jwt,
      user: sanitize.contentAPI.output(user),
    });
  },
};
