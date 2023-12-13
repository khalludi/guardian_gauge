import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import {APIGatewayProxyEvent} from "aws-lambda";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = process.env.TABLE_NAME;

export const handler = async (event: APIGatewayProxyEvent) => {
  if (tableName === undefined)
    return {statusCode: 500, body: `DynamoDB table name not provided: ${tableName}`}

  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };
  const decrement = event.queryStringParameters?.operation === "decrement";

  body = await dynamo.send(
    new UpdateCommand({
      TableName: tableName,
      ExpressionAttributeNames: {
        "#count": "count",
      },
      ExpressionAttributeValues: {
        ":ct": decrement ? -1 : 1,
      },
      Key: {
        id: 1,
      },
      ReturnValues: "ALL_NEW",
      UpdateExpression: "SET #count = #count + :ct"
    })
  );
  body = JSON.stringify(body);

  return {
    statusCode,
    body,
    headers,
  };
};
