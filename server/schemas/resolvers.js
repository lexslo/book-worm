const { User, Book } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                    .select('-__v -password')
                    .populate('savedBooks');
    
                return userData;
            }
    
            throw new AuthenticationError('Not logged in');
        },

        users: async () => {
            return User.find()
                .select('-__v -password')
        }
    },

    
    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if(!user) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if(!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const token = signToken(user);
            return { token, user };
        },

        addUser: async (parent, args) => {
            // create new user in db w/ args passed in
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },

        saveBook: async (parent, args, context) => {
            // only allow if user is logged in
            if (context.user) {
                const userBooks = await User.findOneAndUpdate(
                    { id: context.user._id },
                    { $addToSet: { savedBooks: args.bookId } },
                    { new: true }
                );

                return userBooks;
            }

            throw new AuthenticationError('You must be logged in to save a book!');
        },

        removeBook: async (parent, { bookId }, context) => {
            //  check if user is logged in before removing
            if (context.user) {
                const updatedBooks = await User.findOneAndUpdate(
                    // get user by logged in ID
                    { id: context.user._id },
                    // remove book from savedBooks array by bookId
                    { $pull: { savedBooks: bookId } },
                    // return updated information
                    { new: true }
                )
            }

        }
    }
    
};

module.exports = resolvers;