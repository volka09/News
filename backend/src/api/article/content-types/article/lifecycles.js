module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;
    if (data.content) {
      const words = data.content.split(/\s+/).length;
      data.readingTime = Math.ceil(words / 200); // 200 слов в минуту
    }
  },

  async beforeUpdate(event) {
    const { data } = event.params;
    if (data.content) {
      const words = data.content.split(/\s+/).length;
      data.readingTime = Math.ceil(words / 200);
    }
  },
};
