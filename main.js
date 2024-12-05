const fs = require("fs");

//calculate distance between two points
function calculateDistance(home, school) {
    return Math.sqrt(
        Math.pow(home[0] - school[0], 2) + Math.pow(home[1] - school[1], 2)
    );
}

//calculate total weightage
function calculateWeightage(student, school) {
    const dist = calculateDistance(student.homeLocation, school.location);
    let res = (1 / (1 + dist)) * 50;

    if (student.alumni && student.alumni === school.name) {
        res += 30;
    }
    if (student.volunteer && student.volunteer === school.name) {
        res += 20;
    }
    return res;
}

//allocate students to schools
function decideSchool(schools, students) {
    const res = {};

    schools.forEach((school) => {
        res[school.name] = [];
    });

    const scores = students
        .map((student) => {
            return schools.map((school) => {
                return {
                    studentId: student.id,
                    schoolName: school.name,
                    score: calculateWeightage(student, school),
                };
            });
        })
        .flat();

    //sort by score descending, then student id ascending
    scores.sort((a, b) => {
        if (a.schoolName !== b.schoolName) {
            return a.schoolName.localeCompare(b.schoolName);
        }
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        return a.studentId - b.studentId;
    });

    scores.forEach((entry) => {
        const school = schools.find((s) => s.name === entry.schoolName);

        if (res[school.name].length < school.maxAllocation) {
            res[school.name].push(entry.studentId);
        }
    });

    return Object.keys(res).map((schoolName) => {
        return { [schoolName]: res[schoolName] };
    });
}

function main() {
    //get input file name from command line arguments
    const args = process.argv.slice(2);
    const inputFilePath = args[0];
    const outputFilePath = args[1] || "output.json";

    if (!inputFilePath) {
        console.error("Please provide input file name");
        process.exit(1);
    }

    try {
        // read data
        const data = fs.readFileSync(inputFilePath, "utf8");
        const jsonData = JSON.parse(data);

        const schools = jsonData.schools;
        const students = jsonData.students;

        //decide schools
        const result = decideSchool(schools, students);

        //write output file
        fs.writeFileSync(outputFilePath, JSON.stringify(result), "utf8");
    } catch (err) {
        console.error("Error:", err.message);
    }
}

main();
