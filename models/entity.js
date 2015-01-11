module.exports = {
  instance: {
    fields: {
      indexes: {
        slug: true
      },
      defaults: {
        slug: function(obj) {
          return (obj.data.name || obj.data.title).toLowerCase().replace(/\b(the|a|an|and|or)\b/g, '').trim().replace(/[^0-9A-Za-z ]/g, '').replace(/\s+/g, '-');
        },
        access: 'private'
      },
      unique: {
        slug: true
      }
    },

    plural: 'entities'
  },
  static: {
    plural: 'entities'
  }
};
