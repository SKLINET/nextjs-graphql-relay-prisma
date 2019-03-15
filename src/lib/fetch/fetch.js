import fetch from 'isomorphic-fetch';

export function fetchData(operation, variables) {
    return fetch(process.env.API_ENDPOINT, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: operation,
            variables,
        }),
    }).then(response => response.json());
}
