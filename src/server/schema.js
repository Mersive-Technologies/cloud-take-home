export const typeDefs = `
  type Device {
    name: String!, 
    user_email: String!
  }

  type Query {
    devices: [Device!]!
  }
`;
