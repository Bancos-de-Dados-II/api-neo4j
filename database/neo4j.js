require('dotenv').config();

const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
    `bolt://${process.env.NEO4J_HOST}`,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

module.exports = driver;