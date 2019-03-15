import Query from './Query';
import Mutation from './Mutation';
import types from './Types';

const resolvers = {
    ...types,
    Query: Query,
    Mutation: Mutation,
};

export default resolvers;
