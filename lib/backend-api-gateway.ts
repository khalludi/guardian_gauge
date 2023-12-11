import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import {LambdaIntegration, LambdaRestApi, RestApi} from 'aws-cdk-lib/aws-apigateway';
import {TableV2} from "aws-cdk-lib/aws-dynamodb";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";

export class BackendApiGateway extends Construct {
  constructor(scope: Construct, id: string, table: TableV2) {
    super(scope, id);

    // Create custom policy
    const ddbGetPolicy = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["dynamodb:GetItem"],
      resources: [table.tableArn]
    })

    const ddbUpdatePolicy = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["dynamodb:UpdateItem"],
      resources: [table.tableArn]
    });

    const getCountLambda = new NodejsFunction(this, 'getCount');
    getCountLambda.addEnvironment('TABLE_NAME', table.tableName);
    getCountLambda.addToRolePolicy(ddbGetPolicy);

    const updateCountLambda = new NodejsFunction(this, 'updateCount');
    updateCountLambda.addEnvironment('TABLE_NAME', table.tableName);
    updateCountLambda.addToRolePolicy(ddbUpdatePolicy);

    const api = new RestApi(this, 'apigw', {
      description: 'Counter business logic',
    });

    const counterPath = api.root.addResource('counter');
    counterPath.addMethod('GET', new LambdaIntegration(getCountLambda));
    counterPath.addMethod('PATCH', new LambdaIntegration(updateCountLambda));
  }
}