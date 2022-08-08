const Pessoa = require('../models/pessoa');
const neo4j = require('../database/neo4j');

const buscarPessoa = async (request, response) =>{
    const pessoas = await Pessoa.find({email: request.params.email},{__v:false});
    if(pessoas.length > 0){
        response.status(200).send(pessoas);
    }else{
        response.status(400).send('Usuário não encontrado');
    }
};

const getPessoas = async (request, response)=>{
    const pessoas = await Pessoa.find({},{_id: false, nome:true, email:true});
    response.status(200).send(pessoas);
};

const addPessoa = async (request, response) =>{
    const pessoa = new Pessoa(request.body);
    pessoa.save().then(async ()=>{

        const session = neo4j.session();
        await session.run(`CREATE (:Pessoa{email:"${request.body.email}"})`);
        await session.close();

        response.status(200).send('Salvo com sucesso');
    }).catch(err=>{
        response.status(400).send('Falha ao salvar');
    });
};

const deletarPessoa = async (request, response)=>{
    const result = await Pessoa.deleteOne({email: request.params.email});
    if(result.deletedCount > 0){
        response.status(200).send('Removido com sucesso!');
    }else{
        response.status(400).send('Usuário não encontrado');
    }
};

const atualizarPessoa = async(request, response)=>{
    const result = await Pessoa.updateOne({email: request.body.email},{$set:{nome: request.body.nome}});

    if(result.modifiedCount>0){
        response.status(200).send('Atualizado com sucesso');
    }else{
        response.status(400).send('Usuário não encontrado');
    }

}

const addAmizade = async(request, response)=>{
    const session = neo4j.session();
    const result = await session.run(`MATCH (p1:Pessoa{email:"${request.body.email1}"})
    OPTIONAL MATCH (p2:Pessoa{email:"${request.body.email2}"})
    CREATE (p1)-[:AMIGO]->(p2)`);
    if(result.summary.counters._stats.relationshipsCreated > 0){
        response.status(200).send('Relacionamento criado');
    }else{
        response.status(400).send('Falha ao criar relacionamento');
    }
    await session.close();
}

const getAmigos = async(request,response) =>{
    const session = neo4j.session();

    const result = await session.run(`MATCH (:Pessoa{email:"${request.params.email}"})-[:AMIGO]->(p2:Pessoa)
    RETURN p2.email`);

    const pessoas = [];

    result.records.forEach(r =>{
        pessoas.push(r._fields[0]);
    })

    response.status(200).send(pessoas);

    session.close();
}

module.exports = {getPessoas, addPessoa, deletarPessoa, atualizarPessoa, buscarPessoa, addAmizade, getAmigos};