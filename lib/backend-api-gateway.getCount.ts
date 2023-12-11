import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

const tableName = process.env.TABLE_NAME;

export const handler = async () => {
  if (tableName === undefined)
    return {statusCode: 500, body: `DynamoDB table name not provided: ${tableName}`}

  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  body = await dynamo.send(
    new GetCommand({
      TableName: tableName,
      Key: {
        id: 1,
      },
    })
  );

  body = {
    count: body.Item?.count,
  };
  body = JSON.stringify(body);

  return {
    statusCode,
    body,
    headers,
  };
};
