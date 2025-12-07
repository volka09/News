module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/favorites/user',
      handler: 'favorite.findUserFavorites',
      config: { auth: { required: true } },
    },
    {
      method: 'POST',
      path: '/favorites',
      handler: 'favorite.add',
      config: { auth: { required: true } },
    },
    {
      method: 'DELETE',
      path: '/favorites/:id',
      handler: 'favorite.remove',
      config: { auth: { required: true } },
    },
  ],
};