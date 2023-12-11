import {AwsCustomResource, AwsCustomResourcePolicy, AwsSdkCall, PhysicalResourceId} from "aws-cdk-lib/custom-resources";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";
import {TableV2} from "aws-cdk-lib/aws-dynamodb";
import {Stack} from "aws-cdk-lib";


type Props = {
  scope: Stack;
  table: TableV2
}

export default function tableInitData(props: Props) {
  const { table, scope } = props;

  // Create DDB putItem call for data initialization
  const initializeData: AwsSdkCall = {
    service: "DynamoDB",
    action: "putItem",
    physicalResourceId: PhysicalResourceId.of(table.tableName + "_initialization"),
    parameters: {
      TableName: table.tableName,
      Item: {
        id: {
          N: "1", // DDB client sends numbers as strings, resulting in an error
        },
        count: {
          N: "0",
        }
      }
    }
  }

  // Create custom policy
  const ddbPolicy = new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["dynamodb:PutItem"],
    resources: [table.tableArn]
  })

  // Create resource for table initialization
  return new AwsCustomResource(scope, 'initTableData', {
    policy: AwsCustomResourcePolicy.fromStatements([
      ddbPolicy,
    ]),
    onCreate: initializeData,
    onUpdate: initializeData,
  });
}