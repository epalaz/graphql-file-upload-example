import React from 'react';
import logo from './logo.svg';
import './App.css';
import { InMemoryCache } from 'apollo-cache-inmemory'
import { createUploadLink } from 'apollo-upload-client'
import {ApolloClient} from "apollo-client"
import {ApolloProvider} from "react-apollo"
import gql from "graphql-tag"
import { Mutation } from "react-apollo"

const apolloCache = new InMemoryCache()

const uploadLink = createUploadLink({
  uri: 'http://localhost:4000', // Apollo Server is served from port 4000
  headers: {
    "keep-alive": "true"
  }
})

const client = new ApolloClient({
  cache: apolloCache,
  link: uploadLink
})

const fileUpload = ({target: { files }}) => {
    const file = files[0]
    console.log(file)
}

const UPLOAD_FILE = gql`
  mutation SingleUpload($file: Upload!) {
    singleUpload(file: $file) {
      filename
      mimetype
      encoding
    }
  }
`;

const UPLOAD_FILE_STREAM = gql`
  mutation SingleUploadStream($file: Upload!) {
    singleUploadStream(file: $file) {
      filename
      mimetype
      encoding
    }
  }
`;


function App() {
  return (
    <div className="App">
      <ApolloProvider client={client}>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <h2>Save Local</h2>
        <Mutation mutation={UPLOAD_FILE}>
          {(singleUpload, { data, loading }) => {
            console.log(data)
            return (<form onSubmit={fileUpload} encType={'multipart/form-data'}>
          <input name={'document'} type={'file'} onChange={({target: { files }}) => {
            const file = files[0]
            file && singleUpload({ variables: { file: file } })
          }}/>
              {loading && <p>Loading.....</p>}
          </form>)
          }
          }
        </Mutation>
        <h2>Stream to Server</h2>
        <Mutation mutation={UPLOAD_FILE_STREAM}>
          {(singleUploadStream, { data, loading }) => {
            console.log(data)
            return (<form onSubmit={fileUpload} encType={'multipart/form-data'}>
          <input name={'document'} type={'file'} onChange={({target: { files }}) => {
            const file = files[0]
            console.log(file)
            file && singleUploadStream({ variables: { file: file } })
          }}/>
              {loading && <p>Loading.....</p>}
          </form>)
          }
          }
        </Mutation>
      </header>
        </ApolloProvider>
    </div>
  );
}

export default App;
