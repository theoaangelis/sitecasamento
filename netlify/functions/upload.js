const aws = require('aws-sdk'); // ✅ Declare apenas uma vez no início
const { parse } = require('lambda-multipart-parser');

// Configuração AWS
aws.config.update({
  accessKeyId: process.env.MEUAPP_AWS_ACCESS_KEY_ID,       // ✅ Prefixo MEUAPP_
  secretAccessKey: process.env.MEUAPP_AWS_SECRET_ACCESS_KEY, // ✅ Prefixo MEUAPP_
  region: process.env.MEUAPP_AWS_REGION,                   // ✅ Prefixo MEUAPP_
});

exports.handler = async (event) => {
  // Configuração CORS para evitar erros
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const result = await parse(event); // Faz o parse do arquivo
    const file = result.files[0];     // Obtém o arquivo enviado

    if (!file) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Nenhum arquivo enviado' }),
      };
    }

    const params = {
      Bucket: process.env.MEUAPP_S3_BUCKET_NAME,
      Key: `${Date.now()}-${file.filename}`,
      Body: file.content,
      ContentType: file.contentType,
    };

    const data = await new aws.S3().upload(params).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        url: data.Location 
      }),
    };

  } catch (error) {
    console.error('Erro no upload:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Erro no servidor',
        details: error.message,
      }),
    };
  }
};
console.log('Bucket Name:', process.env.MEUAPP_S3_BUCKET_NAME);
