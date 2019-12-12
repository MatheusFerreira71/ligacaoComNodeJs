const axios = require("axios");
const TotalVoice = require("totalvoice-node");
require('dotenv/config');
const client = new TotalVoice(process.env.TOTALVOICE_API_KEY);

const boss = {
    name: "Dilan.franca",
    telephone: process.env.BOSS_TELEPHONE
};


const servers = [
    {
        name: "Servidor 1",
        url: "http://localhost:4001",
        developer: {
            name: "Dailon",
            telephone: process.env.DAILONMONTEREI_TELEPHONE
        }
    },
    {
        name: "Servidor 2",
        url: "http://localhost:4002",
        developer: {
            name: "Matheus",
            telephone: process.env.MATHEUSFERREIRA_TELEPHONE
        }
    }
];

const notifications = [];

(async () => {
    console.log("Iniciando monitoramento dos servidores!");
    for (const server of servers) {
        await axios({
            url: server.url,
            method: "get"
        }).then(res => {
            console.log(`${server.name} está no ar!`);
        }).catch(() => {
            console.log(`${server.name} está fora do ar!`);
            const message = `${server.developer.name}, o ${server.name} está fora do ar, 
        por favor, faça algo o mais rápido o possível, digite um se você vai fazer algo 
        ou dois se você não podefaze nada!`;
            const options = {
                velocidade: 2,
                tipo_voz: "br-Vitoria",
                resposta_usuario: true
            };
            client.tts.enviar(server.developer.telephone, message, options).then(response => {
                notifications.push({
                    id: response.dados.id,
                    server,
                    status: "pending",
                });
            });
        });
    }
    console.log("Finalizando monitoramento dos servidores!");
})();

setInterval(async () => {
    for (const notification of notifications) {
        if (notification.status === "pending") {
            client.tts.buscar(notification.id).then(response => {
                if (!response.dados.resposta) {
                    console.log("Sem resposta.");
                } else if (response.dados.resposta === "1") {
                    notification.status = 'success';
                    console.log(`O desenvolvedor ${notification.server.developer.name} já foi avisado e vai fazer alguma coisa.`);
                    const message = `O ${notification.server.name} está fora do ar, o 
                    desenvolvedor ${notification.server.developer.name} já foi avisado e vai fazer alguma coisa.`;
                    const options = {
                        velocidade: 2,
                        tipo_voz: "br-Ricardo"
                    };
                    client.tts.enviar(boss.telephone, message, options);
                } else if (response.dados.resposta === "2") {
                    notification.status = 'success';
                    console.log(`O desenvolvedor ${notification.server.developer.name} já foi avisado e não pode fazer nada.`);
                    const message = `O ${notification.server.name} está fora do ar, o 
                    desenvolvedor ${notification.server.developer.name} já foi avisado e não pode fazer nada.`;
                    const options = {
                        velocidade: 2,
                        tipo_voz: "br-Ricardo"
                    };
                    client.tts.enviar(boss.telephone, message, options);
                }
            }).catch(() => {
                console.log("Deu ruim");
            });
        }
    }
}, 1000);