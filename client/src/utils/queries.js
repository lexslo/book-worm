import { gql } from '@apollo/client';

const QUERY_ME = gql `
    {
        me {
            _id
            username
            email
            savedBooks {
                bookId
                authors
                description
                title
                image
                link
            }
        }
    }
`;

export { QUERY_ME };