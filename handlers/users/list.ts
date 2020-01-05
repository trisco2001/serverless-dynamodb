import { Handler, Context, Callback, APIGatewayProxyEvent } from "aws-lambda"
import { BasicResponse, GatewayEventInteractor } from "blizzy-core";
import dynamodb from './dynamodb';

const usersList: Handler = (event: APIGatewayProxyEvent, context: Context, callback: Callback) => {
    const gatewayEventInteractor = new GatewayEventInteractor(event)
    const userId = gatewayEventInteractor.path('userId')

    const tableName = process.env.TABLE_USERS
    let params: any
    if (userId == null) {
        params = {
            TableName: tableName,
            Limit: 10,
        }
    } else {
        params = {
            TableName: tableName,
            Limit: 10,
            ExpressionAttributeValues: {
                ':userId': userId,
            },
            FilterExpression: 'userId = :userId'
        }
    }
    dynamodb.scan(params, function(err: any, data: any) {
        if (err) {
            console.log(err)
            const response: BasicResponse = {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(err),
            }
            callback(err, response)
        }
        else {
            console.log(data)
            const response = {
                statusCode: 200,
                body: JSON.stringify(data),
            };
            callback(null, response)
        }
    })
  }

export default usersList