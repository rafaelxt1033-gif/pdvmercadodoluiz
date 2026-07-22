export default async function handler(req, res) {
    // 1. Bloqueio de métodos inseguros
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido. O sistema aceita apenas POST.' });
    }

    const { message, content, sha, branch } = req.body;
    
    // 2. Resgate do Token seguro (Não fica visível no navegador)
    const token = process.env.GHP_TOKEN;
    const repo = "rafaelxt1033-gif/pdvmercadodoluiz"; 

    if (!token) {
        return res.status(500).json({ error: 'Falha de Servidor: Credencial de nuvem ausente.' });
    }

    try {
        const githubUrl = `https://api.github.com/repos/${repo}/contents/precos.json`;

        // 3. Montagem do payload de atualização
        const bodyData = {
            message: message || "Sincronização Segura - PDV",
            content: content,
            branch: branch || "main"
        };

        if (sha) {
            bodyData.sha = sha;
        }

        // 4. Comunicação oficial com o GitHub
        const response = await fetch(githubUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify(bodyData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro de integridade ao comunicar com o repositório.');
        }

        return res.status(200).json({ success: true, data });

    } catch (error) {
        console.error("Erro Crítico na API:", error);
        return res.status(500).json({ error: error.message });
    }
}
