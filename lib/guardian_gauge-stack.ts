import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import tableInitData from "./tableInitData";
import {BackendApiGateway} from "./backend-api-gateway";

export class GuardianGaugeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define DDB table
    const table = new dynamodb.TableV2(this, 'Counters', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.NUMBER },
      billing: dynamodb.Billing.provisioned({
        readCapacity: dynamodb.Capacity.fixed(1),
        writeCapacity:  dynamodb.Capacity.autoscaled({ maxCapacity: 1 }),
      }),
      tableName: 'Counters',
    });

    // Initialize Table Data
    const initTableDataResource = tableInitData({ table: table, scope: this });
    initTableDataResource.node.addDependency(table);

    // Create example lambda
    const apiGateway = new BackendApiGateway(this, 'hello-world', table);
    apiGateway.node.addDependency(table);
  }
}
