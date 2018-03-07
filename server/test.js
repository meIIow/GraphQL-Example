const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;
const graphql = require('graphql').graphql;

// Construct a schema, using GraphQL schema language
const typeDefs = `
  directive @upper on FIELD_DEFINITION

  type Query {
    hello: String @upper
  }
`;

// Implement resolvers for out custom Directive
const directiveResolvers = {
  upper: function( next, src, args, context) {
    return next().then((str) => {
      if (typeof(str) === 'string') {
        return str.toUpperCase();
      }
      return str;
    });
  },
}

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    hello: (root, args, context) => {
      return 'Hello world!';
    },
  },
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  directiveResolvers,
});

const query = `
query UPPER_HELLO {
  hello
}
`;

graphql(schema, query).then((result) => console.log('Got result', result));
