import { Handler, Context, Callback, APIGatewayProxyEvent } from "aws-lambda"
import { BasicResponses, BasicResponse, GatewayEventInteractor } from "blizzy-core";
import { PostedUser } from "./entities";

import dynamodb from './dynamodb';

const updateUsers: Handler = (event: APIGatewayProxyEvent, context: Context, callback: Callback) => {
    if (typeof event.body !== 'string') {
        callback("No body", BasicResponses.badRequest("Invalid user characters body for update."))
        return
    }

    const data: PostedUser = JSON.parse(event.body)
    const timestamp = new Date().getTime();
    const gatewayEventInteractor = new GatewayEventInteractor(event)

    const id = gatewayEventInteractor.path("id")

    const params = {
        TableName: process.env.TABLE_USERS,
        Key: {
            id: id,
        },
        ExpressionAttributeNames: {
            '#name': 'name',
            '#updatedAt': 'updatedAt'
        },
        ExpressionAttributeValues: {
            ':name': data.name,
            ':updatedAt': timestamp,
        },
        UpdateExpression: 'SET #name = :name, #updatedAt = :updatedAt',
        ReturnValues: 'ALL_NEW',
    };

    dynamodb.update(params, function (err: any, data: any) {
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

export default updateUsers