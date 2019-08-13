const { ApolloServer, gql } = require('apollo-server');
const AWS = require('aws-sdk')
const fs = require('fs')

AWS.config.loadFromPath('./credentials.json');
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

const typeDefs = gql`  
  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }
  
  type Query {
    _ : Boolean
  }
  
  type Mutation {
    singleUpload(file: Upload!): File!,
    singleUploadStream(file: Upload!): File!
  }
`;

const resolvers = {
  Mutation: {
    singleUpload: (parent, args) => {
      return args.file.then(file => {
        const {createReadStream, filename, mimetype} = file

        const fileStream = createReadStream()

        fileStream.pipe(fs.createWriteStream(`./uploadedFiles/${filename}`))

        return file;
      });
    },
    singleUploadStream: async (parent, args) => {
      const file = await args.file
      const {createReadStream, filename, mimetype} = file
      const fileStream = createReadStream()

      //Here stream it to S3

      const uploadParams = {Bucket: 'apollo-file-upload-test', Key: filename, Body: fileStream};
      const result = await s3.upload(uploadParams).promise()

      console.log(result)


      return file;
    }
  },
};

// In the most basic sense, the ApolloServer can be started
// by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({ typeDefs, resolvers });

// This `listen` method launches a web-server.  Existing apps
// can utilize middleware options, which we'll discuss later.
server.listen().then(({ url }) => {
  console.log(`\`🚀  Server ready at ${url}`);
});