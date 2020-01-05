import { Handler, Context, Callback, APIGatewayProxyEvent } from "aws-lambda"
import { BasicResponses, BasicResponse } from "blizzy-core";
import { PostingUser } from "./entities";

import { v4 as uuid } from "uuid";
import dynamodb from './dynamodb';

const usersCreate: Handler = (event: APIGatewayProxyEvent, context: Context, callback: Callback) => {
    if (typeof event.body !== 'string') {
        callback("No body", BasicResponses.badRequest("The userId and name were expected components of this request."))
        return
    }

    const data: PostingUser = JSON.parse(event.body)
    const timestamp = new Date().getTime();

    const params = {
        TableName: process.env.TABLE_USERS,
        Item: {
            id: uuid(),
            userId: data.userId,
            name: data.name,
            createdAt: timestamp,
            updatedAt: timestamp,
        },
        ReturnValues: 'ALL_OLD',
    };

    dynamodb.put(params, function(err: any, data: any) {
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

export default usersCreate