import { PrismaClient } from '@prisma/client';

const express = require("express");
const expressGraphQl = require("express-graphql").graphqlHTTP;
const app = express();

const prisma = new PrismaClient();

let teachers: any = [
  // { id: 1, name: "Teacher 1"},
  // { id: 2, name: "Teacher 2"},
  // { id: 3, name: "Teacher 3"}
];

let subjects: any = [
  // {id: 1, name: "English", teacherId:1},
  // {id: 2, name: "EVS", teacherId:1},
  // {id: 3, name: "Maths", teacherId:2},
  // {id: 4, name: "Science", teacherId:2},
  // {id: 5, name: "Computer", teacherId:3}
];

let teacherSubjects: any = [
  // {id: 1, name: "English", teacherId:1},
  // {id: 2, name: "EVS", teacherId:1},
  // {id: 3, name: "Maths", teacherId:2},
  // {id: 4, name: "Science", teacherId:2},
  // {id: 5, name: "Computer", teacherId:3}
];

async function main() {
  teachers = await prisma.teachers.findMany();

  subjects = await prisma.subjects.findMany();

  teacherSubjects = await prisma.teacherSubjects.findMany();
  // ... you will write your Prisma Client queries here
  if(!subjects || subjects.length <= 0) {

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
        },{
          name: 'EVS'
        },{
          name: 'Maths'
        },{
          name: 'Science'
        },{
          name: 'Computer'
        }]
    });

    await prisma.teacherSubjects.createMany({
      data: [{
          teacherId: 1,
          subjectId: 1
        },{
          teacherId: 1,
          subjectId: 2
        },{
          teacherId: 2,
          subjectId: 2
        },{
          teacherId: 2,
          subjectId: 3
        },{
          teacherId: 3,
          subjectId: 3
        },{
          teacherId: 3,
          subjectId: 4
        },{
          teacherId: 3,
          subjectId: 5
        },{
          teacherId: 1,
          subjectId: 5
        }]
    });

  }

}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

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
                id: {type: GraphQLInt}
            },
            resolve: (parent: any, args: any) => subjects.find((subject: any) => subject.id === args.id ) 
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
                id: {type: GraphQLInt}
            },
            resolve: (parent: any, args: any) => teachers.find((teacher: any) => teacher.id === args.id ) 
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
             resolve: (teacher: any) =>{
                 return teacherSubjects.filter((subjectd: any) => { return subjectd.teacherId === teacher.id } )
             }
        }
    })
});

const schema = new GraphQLSchema({
    query: RouteQueryType
})

app.use('/', expressGraphQl({
    schema: schema,
    graphiql:true
}));

app.listen(4000,() => { console.log("server is running"); });