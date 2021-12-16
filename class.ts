import { PrismaClient } from '@prisma/client';

import express from "express";
import { ApolloServer, gql } from 'apollo-server';
import { buildFederatedSchema } from '@apollo/federation';
const app = express();

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

const prisma = new PrismaClient();
const router = express.Router();

// Defined variables for teachers and subjects
let teachers: any = [];

let classes: any = [];

let teacherSubjects: any = [];

const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Class" type defines the queryable fields for every book in our data source.
  type Classes {
    id: Int
    name: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "classes" query returns an array of zero or more Books (defined above).
  type Query {
    classes: [Classes]
  }
`;

async function main() {
  
  // Get subjects array from postgresql
  classes = await prisma.classes.findMany({});

  // ... you will write your Prisma Client queries here
  if (!classes || classes.length <= 0) {
    // ... inserting some teachers and subjects data here
    await prisma.classes.createMany({
      data: [{
        name: 'Class 1'
      },{
        name: 'Class 2'
      },{
        name: 'Class 3'
      }]
    });
  }



  console.log(JSON.stringify(classes));

}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

 

//  This code is for GraphQL

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves teachers from the "teachers" array above.
const resolvers = {
  Query: {
    classes: () => classes
  },
};

const server = new ApolloServer({ schema: buildFederatedSchema([{typeDefs, resolvers}]) });

server.listen(4002).then((url: any) => {
  console.log `🚀  Server ready at 4002`
})

router.get('/', (req, res) => {
  res.status(200).json({message: "success"});
});