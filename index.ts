import { ApolloServer } from 'apollo-server';
import { ApolloGateway } from '@apollo/gateway';

const gateway = new ApolloGateway({
  serviceList: [
    { name: "Students", url: "http://localhost:4001/" },
    { name: "Classes", url: "http://localhost:4002/" }

  ]
});

const server = new ApolloServer({ gateway });

server.listen(4000).then((url: any) => {
  console.log `🚀  Server ready at 4000`
})