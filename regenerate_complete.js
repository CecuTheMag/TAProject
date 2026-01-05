const fs = require('fs');

// Male and female names with matching surnames
const maleNames = [
    'Aleksandar', 'Anton', 'Atanas', 'Boris', 'Daniel', 'Dimitar', 'Emil', 'Filip', 
    'Georgi', 'Hristo', 'Ivan', 'Jivko', 'Kaloyan', 'Lazar', 'Lyubomir', 'Martin', 
    'Nikola', 'Nikolay', 'Ognyan', 'Pavel', 'Petar', 'Plamen', 'Rosen', 'Simeon', 
    'Stefan', 'Stoyan', 'Todor', 'Valentin', 'Veselin', 'Viktor', 'Vladimir', 'Yasen'
];

const femaleNames = [
    'Aleksandra', 'Anelia', 'Anna', 'Bilyana', 'Boryana', 'Daniela', 'Darina', 
    'Desislava', 'Elena', 'Elitsa', 'Eva', 'Galina', 'Gergana', 'Hristina', 
    'Irina', 'Kalina', 'Karina', 'Kristina', 'Maria', 'Milena', 'Nevena', 
    'Oksana', 'Olga', 'Petya', 'Radina', 'Ralitsa', 'Silvia', 'Stefka', 
    'Tanya', 'Teodora', 'Tsvetanka', 'Violeta', 'Yana', 'Zhaneta', 'Zlatka'
];

const maleSurnames = [
    'Dimitrov', 'Georgiev', 'Hristov', 'Ivanov', 'Kostov', 'Nikolov', 
    'Petkov', 'Petrov', 'Stefanov', 'Stoyanov', 'Todorov', 'Vasilev'
];

const femaleSurnames = [
    'Dimitrova', 'Georgieva', 'Hristova', 'Ivanova', 'Kostova', 'Nikolova', 
    'Petkova', 'Petrova', 'Stefanova', 'Stoyanova', 'Todorova', 'Vasileva'
];

// Teachers data
const teachers = [
    '1,Maria Petrova,0888123456,MATHEMATICS,maria.petrova@hbschool.bg',
    '2,Ivan Georgiev,0889234567,MATHEMATICS,ivan.georgiev@hbschool.bg',
    '3,Elena Dimitrova,0887345678,MATHEMATICS,elena.dimitrova@hbschool.bg',
    '4,Stefka Nikolova,0886456789,BULGARIAN,stefka.nikolova@hbschool.bg',
    '5,Petar Stoyanov,0885567890,BULGARIAN,petar.stoyanov@hbschool.bg',
    '6,Anna Hristova,0884678901,BULGARIAN,anna.hristova@hbschool.bg',
    '7,Maria Ivanova,0883789012,ENGLISH,maria.ivanova@hbschool.bg',
    '8,Georgi Petkov,0882890123,ENGLISH,georgi.petkov@hbschool.bg',
    '9,Desislava Todorova,0881901234,ENGLISH,desislava.todorova@hbschool.bg',
    '10,Nikolay Vasilev,0880012345,HISTORY,nikolay.vasilev@hbschool.bg',
    '11,Radka Georgieva,0889123456,HISTORY,radka.georgieva@hbschool.bg',
    '12,Stoyan Dimitrov,0888234567,GEOGRAPHY,stoyan.dimitrov@hbschool.bg',
    '13,Milena Petrova,0887345678,GEOGRAPHY,milena.petrova@hbschool.bg',
    '14,Veselina Stoeva,0886456789,BIOLOGY,veselina.stoeva@hbschool.bg',
    '15,Dimitar Nikolov,0885567890,BIOLOGY,dimitar.nikolov@hbschool.bg',
    '16,Krasimira Yordanova,0884678901,CHEMISTRY,krasimira.yordanova@hbschool.bg',
    '17,Atanas Petrov,0883789012,CHEMISTRY,atanas.petrov@hbschool.bg',
    '18,Borislav Georgiev,0882890123,PHYSICS,borislav.georgiev@hbschool.bg',
    '19,Tsvetelina Dimova,0881901234,PHYSICS,tsvetelina.dimova@hbschool.bg',
    '20,Stefan Stefanov,0880012345,PHYSICAL_EDUCATION,stefan.stefanov@hbschool.bg',
    '21,Maria Kostova,0889123456,PHYSICAL_EDUCATION,maria.kostova@hbschool.bg',
    '22,Elitsa Vasileva,0888234567,ART,elitsa.vasileva@hbschool.bg',
    '23,Hristo Hristov,0887345678,ART,hristo.hristov@hbschool.bg',
    '24,Nevena Petkova,0886456789,MUSIC,nevena.petkova@hbschool.bg',
    '25,Vladimir Todorov,0885567890,MUSIC,vladimir.todorov@hbschool.bg',
    '26,Plamen Georgiev,0884678901,TECHNOLOGY,plamen.georgiev@hbschool.bg',
    '27,Silvia Nikolova,0883789012,TECHNOLOGY,silvia.nikolova@hbschool.bg',
    '28,Aleksandar Dimitrov,0882890123,COMPUTER_SCIENCE,aleksandar.dimitrov@hbschool.bg',
    '29,Ivelina Stoyanova,0881901234,COMPUTER_SCIENCE,ivelina.stoyanova@hbschool.bg',
    '30,Martin Petrov,0880012345,GERMAN,martin.petrov@hbschool.bg',
    '31,Galina Georgieva,0889123456,GERMAN,galina.georgieva@hbschool.bg',
    '32,Rositsa Dimitrova,0888234567,FRENCH,rositsa.dimitrova@hbschool.bg',
    '33,Vasil Nikolov,0887345678,PHILOSOPHY,vasil.nikolov@hbschool.bg',
    '34,Daniela Petkova,0886456789,PSYCHOLOGY,daniela.petkova@hbschool.bg',
    '35,Director Ivan Stoyanov,0885567890,ADMINISTRATOR,director@hbschool.bg'
];

function generateStudent(id, grade, classLetter, position) {
    const isMale = position % 2 === 0;
    
    const firstName = isMale ? 
        maleNames[Math.floor(Math.random() * maleNames.length)] :
        femaleNames[Math.floor(Math.random() * femaleNames.length)];
    
    const lastName = isMale ?
        maleSurnames[Math.floor(Math.random() * maleSurnames.length)] :
        femaleSurnames[Math.floor(Math.random() * femaleSurnames.length)];
    
    const fullName = `${firstName} ${lastName}`;
    const phone = `088${grade}${classLetter.charCodeAt(0)}${String(position).padStart(3, '0')}`;
    const emailName = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
    const email = `${emailName}.${grade}${classLetter.toLowerCase()}@student.hbschool.bg`;
    
    return `${id},${fullName},${phone},${grade}${classLetter},${email}`;
}

function generateClassStudents(grade, classLetter, startId) {
    const students = [];
    
    for (let i = 1; i <= 20; i++) {
        students.push(generateStudent(startId + i - 1, grade, classLetter, i));
    }
    
    students.sort((a, b) => {
        const nameA = a.split(',')[1];
        const nameB = b.split(',')[1];
        return nameA.localeCompare(nameB);
    });
    
    return students;
}

function generateAllStudents() {
    const allStudents = [];
    let currentId = 101;
    
    for (let grade = 5; grade <= 12; grade++) {
        for (let classLetter of ['A', 'B', 'C', 'D']) {
            const classStudents = generateClassStudents(grade, classLetter, currentId);
            allStudents.push(...classStudents);
            currentId += 20;
        }
    }
    
    return allStudents;
}

// Generate the complete CSV
const csvHeader = 'SCHOOL_ID,STUDENT_TEACHER_NAME,PHONE_NUMBER,ROLE,EMAIL';
const studentData = generateAllStudents();

const completeCSV = [
    csvHeader,
    ...teachers,
    ...studentData
].join('\n');

fs.writeFileSync('SCHOOL_DATA.csv', completeCSV);

console.log('Complete CSV generated with emails:');
console.log(`- ${teachers.length} teachers`);
console.log(`- ${studentData.length} students`);
console.log('- All students have proper emails');