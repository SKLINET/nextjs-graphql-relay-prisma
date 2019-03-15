import { commitMutation as commitMutationDefault } from 'react-relay';

export function commitMutation(environment, options) {
    return new Promise((resolve, reject) => {
        commitMutationDefault(environment, {
            ...options,
            onError: error => {
                reject(error);
            },
            onCompleted: response => {
                resolve(response);
            },
        });
    });
}
