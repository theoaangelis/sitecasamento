const aws = require('aws-sdk');

aws.config.update({
  accessKeyId: process.env.MEUAPP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.MEUAPP_AWS_SECRET_ACCESS_KEY,
  region: process.env.MEUAPP_AWS_REGION,
});

const s3 = new aws.S3();
const bucketName = process.env.MEUAPP_S3_BUCKET_NAME;

exports.handler = async () => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  try {
    const data = await s3.listObjectsV2({ Bucket: bucketName }).promise();
    const fotos = data.Contents.map(
      (item) => `https://${bucketName}.s3.amazonaws.com/${item.Key}`
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(fotos),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro ao listar fotos' }),
    };
  }
};