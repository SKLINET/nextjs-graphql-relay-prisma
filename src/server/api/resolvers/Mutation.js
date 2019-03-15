const Mutation = {
    createUser: async (_, args, context, info) => {
        return context.db.mutation.createUser(
            {
                data: {
                    name: args.name,
                },
            },
            info
        );
    },
};

export default Mutation;
