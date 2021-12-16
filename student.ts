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

let subjects: any = [];

let teacherSubjects: any = [];

const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Teachers {
    id: Int
    name: String
    subjectsOfTeacher: [TeacherSubjects!]
  }

  type Subjects {
    id: Int
    name: String
    teachersOfSubjects: [TeacherSubjects!]
  }

  type TeacherSubjects {
    id: Int
    teacherId: Int
    subjectId: Int
    name: String
    teachers: [SubjectTeacherData!]
    subjects: [SubjectTeacherData!]
  }

  type SubjectTeacherData {
    id: Int
    name: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    teachers: [Teachers]
    subjects: [Subjects]
    teacherSubjects: [TeacherSubjects]
    teacher(id: ID!): Teachers
  }
`;

async function main() {
  
  // Get subjects array from postgresql
  subjects = await prisma.subjects.findMany({
    include: {
      teachersOfSubjects: {
        include: {
          teachers: true
        }
      }
    }
  });
  
  // Add teacher name in teachersOfSubjects object
  subjects = subjects.map((post: any) => {
    post.teachersOfSubjects = post.teachersOfSubjects.map((sub: any)=> { sub["name"] = sub["teachers"]["name"]; return sub; })
    return post;
  })

  // ... you will write your Prisma Client queries here
  if (!subjects || subjects.length <= 0) {
    // ... inserting some teachers and subjects data here
    await prisma.teachers.createMany({
      data: [{
        name: 'Teacher 1'
      },{
        name: 'Teacher 2'
      },{
        name: 'Teacher 3'
      }]
    });

    await prisma.subjects.createMany({
      data: [{
        name: 'English'
      }, {
        name: 'EVS'
      }, {
        name: 'Maths'
      }, {
        name: 'Science'
      }, {
        name: 'Computer'
      }]
    });

    await prisma.teacherSubjects.createMany({
      data: [{
        teacherId: 1,
        subjectId: 1,
      }, {
        teacherId: 1,
        subjectId: 2
      }, {
        teacherId: 2,
        subjectId: 2
      }, {
        teacherId: 2,
        subjectId: 3
      }, {
        teacherId: 3,
        subjectId: 3
      }, {
        teacherId: 3,
        subjectId: 4
      }, {
        teacherId: 3,
        subjectId: 5
      }, {
        teacherId: 1,
        subjectId: 5
      }]
    });

  }

  // Get teachers array from postgresql
  teachers = await prisma.teachers.findMany({
    include: { subjectsOfTeacher: {
      include: {
        subjects: true
      }
    } }
  });
  
  // Add subject name in subjectsOfTeacher object
  teachers = teachers.map((post: any) => {
    post.subjectsOfTeacher = post.subjectsOfTeacher.map((sub: any)=> { sub["name"] = sub["subjects"]["name"]; return sub; })
    return post;
  })
  
  // Get teachers and subject Id array from postgresql
  teacherSubjects = await prisma.teacherSubjects.findMany({
    include: {
      teachers : true,
      subjects: true
    }
  });

  console.log(JSON.stringify(teacherSubjects));

}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

  //  This code is for GraphQL
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull
} = require("graphql");

const RouteQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Route Query",
  fields: () => ({
    subject: {
      type: SubjectType,
      description: "List of all subjects",
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent: any, args: any) => subjects.find((subject: any) => subject.id === args.id)
    },
    subjects: {
      type: new GraphQLList(SubjectType),
      description: "List of all subjects",
      resolve: () => subjects
    },
    teachers: {
      type: new GraphQLList(TeacherType),
      description: "List of all Teachers",
      resolve: () => teachers
    },
    teacher: {
      type: TeacherType,
      description: "List of all Teachers",
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent: any, args: any) => teachers.find((teacher: any) => teacher.id === args.id)
    },
    teacherSubjects: {
      type: new GraphQLList(TeacherSubjectType),
      description: "List of all subjects taken by teacher",
      resolve: () => teacherSubjects
    },
  })
});

const SubjectType = new GraphQLObjectType({
  name: "Subject",
  description: "This represents subjects",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    name: { type: new GraphQLNonNull(GraphQLString) }
  })
});

const TeacherSubjectType = new GraphQLObjectType({
  name: "TeacherSubject",
  description: "This represents subject taken by a teacher",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    teacherId: { type: new GraphQLNonNull(GraphQLInt) },
    subjectId: { type: new GraphQLNonNull(GraphQLInt) }
  })
});

const TeacherType = new GraphQLObjectType({
  name: "Teacher",
  description: "This represents a teacher of a subject",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    teacherSubjects: {
      type: new GraphQLList(SubjectType),
      resolve: (teacher: any) => {
        return teacherSubjects.filter((subjectd: any) => { return subjectd.teacherId === teacher.id })
      }
    }
  })
});

const schema = new GraphQLSchema({
  query: RouteQueryType
})

//  This code is for GraphQL

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves teachers from the "teachers" array above.
const resolvers = {
  Query: {
    teachers: () => teachers,
    subjects: () => subjects,
    teacherSubjects: () => teacherSubjects

  },
};

const server = new ApolloServer({ schema: buildFederatedSchema([{typeDefs, resolvers}]) });

server.listen(4001).then((url: any) => {
  console.log `🚀  Server ready at 4001`
})

router.get('/', (req, res) => {
  res.status(200).json({message: "success"});
});