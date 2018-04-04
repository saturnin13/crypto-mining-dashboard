// config/database.js
module.exports = {
    connectionString: process.env.DATABASE_URL || "postgres://lncgqbiyoivknm:16497d98c045a638262b080a515986d172cadc0799e23f7ebc1cd225556116a7@ec2-54-217-214-201.eu-west-1.compute.amazonaws.com:5432/dabhdlnlb316fm",
    ssl: true
};